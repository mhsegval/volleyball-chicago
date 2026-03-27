'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

type LedgerKind =
  | 'payment_submitted'
  | 'payment_approved'
  | 'payment_rejected'
  | 'payment_reversed'
  | 'manual_balance_adjustment'
  | 'run_completed'
  | 'run_charge';

async function insertLedgerEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: {
    kind: LedgerKind;
    user_id?: string | null;
    run_id?: string | null;
    payment_request_id?: string | null;
    amount: number;
    method?: 'zelle' | 'venmo' | null;
    note?: string | null;
    actor_user_id?: string | null;
    metadata?: Record<string, unknown>;
    created_at?: string;
  }
) {
  const { error } = await supabase.from('ledger_entries').insert({
    kind: input.kind,
    user_id: input.user_id ?? null,
    run_id: input.run_id ?? null,
    payment_request_id: input.payment_request_id ?? null,
    amount: Number(input.amount ?? 0),
    method: input.method ?? null,
    note: input.note ?? null,
    actor_user_id: input.actor_user_id ?? null,
    metadata: input.metadata ?? {},
    created_at: input.created_at ?? new Date().toISOString(),
  });

  if (error) {
    console.error('ledger insert failed', {
      kind: input.kind,
      message: error.message,
    });
  }
}

async function ensureProfileAfterVerify(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: {
    id: string;
    email?: string | null;
    user_metadata?: { name?: string | null } | null;
  }
) {
  const email = user.email?.trim().toLowerCase() || '';
  const metadataName = user.user_metadata?.name?.trim() || '';

  const { data: existingProfile } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('id', user.id)
    .maybeSingle();

  if (existingProfile) {
    const updatePayload: { email?: string; name?: string } = {};

    if (!existingProfile.email && email) {
      updatePayload.email = email;
    }

    if ((!existingProfile.name || existingProfile.name.trim().length === 0) && metadataName) {
      updatePayload.name = metadataName;
    }

    if (Object.keys(updatePayload).length > 0) {
      await supabase.from('users').update(updatePayload).eq('id', user.id);
    }

    return;
  }

  const insertPayload = {
    id: user.id,
    email,
    name: metadataName,
  };

  const { error } = await supabase.from('users').insert(insertPayload);

  if (error) {
    const message = error.message.toLowerCase();

    if (!message.includes('duplicate') && !message.includes('unique')) {
      throw new Error(error.message);
    }
  }
}

export async function createRunWithState(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const result = await createRun(formData);

  if (result?.error) {
    return { error: result.error };
  }

  return { success: 'run created successfully' };
}

export async function updateRunWithState(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const result = await updateRunDetails(formData);

  if (result?.error) {
    return { error: result.error };
  }

  return { success: 'run updated successfully' };
}

export async function createPaymentRequest(formData: FormData) {
  const { supabase, user } = await requireUser();

  const amount = Number(formData.get('amount') || 0);
  const method = String(formData.get('method') || '');

  if (!amount || amount <= 1) {
    return { error: 'amount must be greater than 1' };
  }

  if (method !== 'zelle' && method !== 'venmo') {
    return { error: 'invalid payment method' };
  }

  const createdAt = new Date().toISOString();

  const { error } = await supabase.rpc('create_payment_request_and_credit', {
    p_amount: amount,
    p_method: method,
  });

  if (error) {
    return { error: error.message };
  }

  const { data: latestRequest } = await supabase
    .from('payment_requests')
    .select('id, created_at')
    .eq('user_id', user.id)
    .eq('amount', amount)
    .eq('method', method)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  await insertLedgerEntry(supabase, {
    kind: 'payment_submitted',
    user_id: user.id,
    payment_request_id: latestRequest?.id ?? null,
    amount,
    method,
    actor_user_id: user.id,
    created_at: latestRequest?.created_at ?? createdAt,
    note: 'payment request submitted and balance credited through trust-based flow',
    metadata: {
      source: 'createPaymentRequest',
      trust_based_credit: true,
    },
  });

  revalidatePath('/');
  revalidatePath('/profile');
  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  return { success: true };
}

export async function approvePaymentRequest(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const requestId = String(formData.get('request_id') || '');
  const reviewedAt = new Date().toISOString();

  const { data: request, error: requestError } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single();

  if (requestError || !request) {
    return { error: 'payment request not found' };
  }

  const { error } = await supabase
    .from('payment_requests')
    .update({
      status: 'approved',
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  await insertLedgerEntry(supabase, {
    kind: 'payment_approved',
    user_id: request.user_id,
    payment_request_id: request.id,
    amount: Number(request.amount),
    method: request.method,
    actor_user_id: user.id,
    created_at: reviewedAt,
    note: 'payment approved by admin',
    metadata: {
      source: 'approvePaymentRequest',
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  revalidatePath('/profile');
  revalidatePath('/');
  return { success: true };
}

export async function rejectPaymentRequest(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const requestId = String(formData.get('request_id') || '');
  const reviewedAt = new Date().toISOString();

  const { data: request, error: requestError } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'pending')
    .single();

  if (requestError || !request) {
    return { error: 'payment request not found' };
  }

  const { data: targetUser, error: userError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', request.user_id)
    .single();

  if (userError || !targetUser) {
    return { error: 'user not found' };
  }

  const reversedBalance = Number(targetUser.balance) - Number(request.amount);

  const { error: balanceError } = await supabase
    .from('users')
    .update({ balance: reversedBalance })
    .eq('id', request.user_id);

  if (balanceError) {
    return { error: balanceError.message };
  }

  const { error: updateError } = await supabase
    .from('payment_requests')
    .update({
      status: 'rejected',
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (updateError) {
    return { error: updateError.message };
  }

  await insertLedgerEntry(supabase, {
    kind: 'payment_rejected',
    user_id: request.user_id,
    payment_request_id: request.id,
    amount: Number(request.amount),
    method: request.method,
    actor_user_id: user.id,
    created_at: reviewedAt,
    note: 'payment rejected and credited balance reversed',
    metadata: {
      source: 'rejectPaymentRequest',
      resulting_balance: reversedBalance,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  revalidatePath('/profile');
  revalidatePath('/');
  return { success: true };
}

export async function reverseApprovedPaymentRequest(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const requestId = String(formData.get('request_id') || '');
  const reversedAt = new Date().toISOString();

  const { data: request, error: requestError } = await supabase
    .from('payment_requests')
    .select('*')
    .eq('id', requestId)
    .eq('status', 'approved')
    .single();

  if (requestError || !request) {
    return { error: 'approved payment request not found' };
  }

  const { error } = await supabase.rpc('reverse_approved_payment_request', {
    p_request_id: requestId,
  });

  if (error) {
    return { error: error.message };
  }

  await insertLedgerEntry(supabase, {
    kind: 'payment_reversed',
    user_id: request.user_id,
    payment_request_id: request.id,
    amount: Number(request.amount),
    method: request.method,
    actor_user_id: user.id,
    created_at: reversedAt,
    note: 'approved payment reversed by admin',
    metadata: {
      source: 'reverseApprovedPaymentRequest',
    },
  });

  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  revalidatePath('/profile');
  revalidatePath('/');
  return { success: true };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth');
  }

  return { supabase, user };
}

async function requireAdmin() {
  const { supabase, user } = await requireUser();

  const { data: profile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (error || profile?.role !== 'admin') {
    redirect('/');
  }

  return { supabase, user };
}

export async function sendOtp(formData: FormData) {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const name = String(formData.get('name') || '').trim();

  const supabase = await createClient();

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(email)) {
    return { error: 'please enter a valid email address' };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      data: { name },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'otp sent' };
}

export async function updateRunDetails(formData: FormData) {
  const { supabase } = await requireAdmin();

  const runId = String(formData.get('run_id') || '').trim();
  const date = String(formData.get('date') || '').trim();
  const start_time = String(formData.get('start_time') || '').trim();
  const end_time = String(formData.get('end_time') || '').trim();
  const gym_name = String(formData.get('gym_name') || '').trim();
  const location_url = String(formData.get('location_url') || '').trim();
  const total_rent = Number(formData.get('total_rent') || 0);
  const max_players = Number(formData.get('max_players') || 0);

  const { error } = await supabase.rpc('update_run_admin', {
    p_run_id: runId,
    p_date: date,
    p_start_time: start_time,
    p_end_time: end_time,
    p_gym_name: gym_name,
    p_location_url: location_url,
    p_total_rent: total_rent,
    p_max_players: max_players,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function deleteActiveRun() {
  const { supabase } = await requireAdmin();

  const { data: run, error: runError } = await supabase
    .from('runs')
    .select('id')
    .eq('status', 'active')
    .maybeSingle();

  if (runError) {
    return { error: runError.message };
  }

  if (!run) {
    return { error: 'no active run found' };
  }

  const { error } = await supabase.from('runs').delete().eq('id', run.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function verifyOtp(formData: FormData) {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase();
  const token = String(formData.get('token') || '').trim();

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: 'could not complete sign in' };
  }

  await ensureProfileAfterVerify(supabase, {
    id: user.id,
    email: user.email,
    user_metadata: user.user_metadata as { name?: string | null } | null,
  });

  revalidatePath('/');
  revalidatePath('/onboarding');
  revalidatePath('/profile');
  redirect("/onboarding");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/auth');
}

export async function completeProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get('name') || '').trim();
  const avatar = formData.get('avatar') as File | null;

  if (!name) {
    return { error: 'name is required' };
  }

  let avatarUrl: string | null = null;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  if (avatar && avatar.size > 0) {
    if (!allowedTypes.includes(avatar.type)) {
      return {
        error:
          'please use jpg, png, webp, or iphone photo formats like heic/heif',
      };
    }

    const ext = avatar.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ext === 'heic' || ext === 'heif' ? 'jpg' : ext;
    const path = `${user.id}/${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatar, {
        upsert: true,
        contentType: avatar.type || 'image/jpeg',
      });

    if (uploadError) {
      return {
        error:
          'could not upload this photo. please try jpg or png if the issue continues',
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    avatarUrl = publicUrlData.publicUrl;
  }

  const updatePayload: { name: string; avatar_url?: string } = { name };

  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl;
  }

const { error } = await supabase
  .from('users')
  .upsert(
    {
      id: user.id,
      email: user.email?.trim().toLowerCase() || "",
      ...updatePayload,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/onboarding');
  revalidatePath('/profile');
  redirect('/');
}

export async function updateOwnProfile(formData: FormData) {
  const { supabase, user } = await requireUser();

  const name = String(formData.get('name') || '').trim();
  const avatar = formData.get('avatar') as File | null;

  if (!name) {
    return { error: 'name is required' };
  }

  let avatarUrl: string | null = null;

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif',
  ];

  if (avatar && avatar.size > 0) {
    if (!allowedTypes.includes(avatar.type)) {
      return {
        error:
          'please use jpg, png, webp, or iphone photo formats like heic/heif',
      };
    }

    const ext = avatar.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeExt = ext === 'heic' || ext === 'heif' ? 'jpg' : ext;
    const path = `${user.id}/${Date.now()}.${safeExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatar, {
        upsert: true,
        contentType: avatar.type || 'image/jpeg',
      });

    if (uploadError) {
      return {
        error:
          'could not upload this photo. please try jpg or png if the issue continues',
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    avatarUrl = publicUrlData.publicUrl;
  }

  const updatePayload: { name: string; avatar_url?: string } = { name };

  if (avatarUrl) {
    updatePayload.avatar_url = avatarUrl;
  }

const { error } = await supabase
  .from('users')
  .upsert(
    {
      id: user.id,
      email: user.email?.trim().toLowerCase() || "",
      ...updatePayload,
    },
    { onConflict: "id" }
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/profile');
  redirect('/profile');
}

export async function addSignup(formData: FormData) {
  const { supabase } = await requireUser();

  const runId = String(formData.get('run_id') || '');
  const userId = String(formData.get('user_id') || '');

  const { error } = await supabase.rpc('add_signup_by_user_id', {
    p_run_id: runId,
    p_user_id: userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function removeSignup(formData: FormData) {
  const { supabase } = await requireUser();

  const runId = String(formData.get('run_id') || '');
  const userId = String(formData.get('user_id') || '');

  const { error } = await supabase.rpc('remove_signup_by_user_id', {
    p_run_id: runId,
    p_user_id: userId,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function createRun(formData: FormData) {
  const { supabase } = await requireAdmin();

  await supabase.rpc('complete_expired_runs');

  const date = String(formData.get('date') || '').trim();
  const start_time = String(formData.get('start_time') || '').trim();
  const end_time = String(formData.get('end_time') || '').trim();
  const gym_name = String(formData.get('gym_name') || '').trim();
  const location_url = String(formData.get('location_url') || '').trim();
  const total_rent = Number(formData.get('total_rent') || 0);
  const max_players = Number(formData.get('max_players') || 0);

  if (!date || !start_time || !end_time || !gym_name || !location_url) {
    return { error: 'please fill all run fields' };
  }

  if (!total_rent || total_rent <= 0) {
    return { error: 'total rent must be greater than 0' };
  }

  if (!max_players || max_players <= 0) {
    return { error: 'max players must be greater than 0' };
  }

  if (end_time <= start_time) {
    return { error: 'end time must be after start time' };
  }

  const payload = {
    date,
    start_time,
    end_time,
    gym_name,
    location_url,
    total_rent,
    max_players,
    status: 'active' as const,
  };

  const { error } = await supabase.from('runs').insert(payload);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function completeActiveRun() {
  const { supabase, user } = await requireAdmin();

  const completedAt = new Date().toISOString();

  const { data: run, error: runError } = await supabase
    .from('runs')
    .select('*')
    .eq('status', 'active')
    .maybeSingle();

  if (runError) {
    return { error: runError.message };
  }

  if (!run) {
    return { error: 'no active run found' };
  }

  const { data: rosterSignups, error: signupsError } = await supabase
    .from('signups')
    .select('user_id, status')
    .eq('run_id', run.id)
    .eq('status', 'roster');

  if (signupsError) {
    return { error: signupsError.message };
  }

  const rosterUsers = (rosterSignups ?? []) as Array<{
    user_id: string;
    status: string;
  }>;

  const rosterCount = rosterUsers.length;
  const share =
    rosterCount > 0
      ? Number((Number(run.total_rent) / rosterCount).toFixed(2))
      : Number(run.total_rent);

  const { error } = await supabase
    .from('runs')
    .update({ status: 'completed' })
    .eq('id', run.id);

  if (error) {
    return { error: error.message };
  }

  await supabase.rpc('refresh_streaks_for_run', {
    p_run_id: run.id,
  });

  await insertLedgerEntry(supabase, {
    kind: 'run_completed',
    run_id: run.id,
    amount: Number(run.total_rent),
    actor_user_id: user.id,
    created_at: completedAt,
    note: `${run.gym_name} run completed`,
    metadata: {
      source: 'completeActiveRun',
      gym_name: run.gym_name,
      run_date: run.date,
      total_rent: Number(run.total_rent),
      roster_count: rosterCount,
      share_per_player: share,
    },
  });

  for (const signup of rosterUsers) {
    await insertLedgerEntry(supabase, {
      kind: 'run_charge',
      user_id: signup.user_id,
      run_id: run.id,
      amount: share,
      actor_user_id: user.id,
      created_at: completedAt,
      note: `${run.gym_name} run charge`,
      metadata: {
        source: 'completeActiveRun',
        gym_name: run.gym_name,
        run_date: run.date,
        total_rent: Number(run.total_rent),
        roster_count: rosterCount,
        share_per_player: share,
      },
    });
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  revalidatePath('/profile');
  return { success: true };
}

export async function updateUserBalance(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const userId = String(formData.get('user_id') || '');
  const balance = Number(formData.get('balance') || 0);

  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('balance')
    .eq('id', userId)
    .single();

  if (existingUserError || !existingUser) {
    return { error: 'user not found' };
  }

  const previousBalance = Number(existingUser.balance ?? 0);

  const { error } = await supabase
    .from('users')
    .update({ balance })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  const delta = Number((balance - previousBalance).toFixed(2));

  await insertLedgerEntry(supabase, {
    kind: 'manual_balance_adjustment',
    user_id: userId,
    amount: delta,
    actor_user_id: user.id,
    note: 'admin manually updated user balance',
    metadata: {
      source: 'updateUserBalance',
      previous_balance: previousBalance,
      new_balance: balance,
    },
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/payments');
  revalidatePath('/profile');
  return { success: true };
}

export async function updateUserName(formData: FormData) {
  const { supabase } = await requireAdmin();

  const userId = String(formData.get('user_id') || '');
  const name = String(formData.get('name') || '').trim();

  const { error } = await supabase
    .from('users')
    .update({ name })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateUserRole(formData: FormData) {
  const { supabase } = await requireAdmin();

  const userId = String(formData.get('user_id') || '');
  const role = String(formData.get('role') || '');

  if (role !== 'admin' && role !== 'user') {
    return { error: 'invalid role' };
  }

  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/');
  return { success: true };
}