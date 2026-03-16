'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';


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
  const { supabase } = await requireUser();

  const amount = Number(formData.get('amount') || 0);
  const method = String(formData.get('method') || '');

  if (!amount || amount <= 1) {
    return { error: 'amount must be greater than 1' };
  }

  if (method !== 'zelle' && method !== 'venmo') {
    return { error: 'invalid payment method' };
  }

  const { error } = await supabase.rpc('create_payment_request_and_credit', {
    p_amount: amount,
    p_method: method,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/profile');
  revalidatePath('/admin');
  return { success: true };
}

export async function approvePaymentRequest(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const requestId = String(formData.get('request_id') || '');

  const { error } = await supabase
    .from('payment_requests')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/admin');
  revalidatePath('/profile');
  revalidatePath('/');
  return { success: true };
}

export async function rejectPaymentRequest(formData: FormData) {
  const { supabase, user } = await requireAdmin();

  const requestId = String(formData.get('request_id') || '');

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
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath('/admin');
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

  if (!runId) {
    return { error: 'run id is required' };
  }

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

  const { error } = await supabase
    .from('runs')
    .update({
      date,
      start_time,
      end_time,
      gym_name,
      location_url,
      total_rent,
      max_players,
    })
    .eq('id', runId);

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

  redirect('/');
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
      return { error: 'please use jpg, png, webp, or iphone photo formats like heic/heif' };
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
      return { error: 'could not upload this photo. please try jpg or png if the issue continues' };
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
    .update(updatePayload)
    .eq('id', user.id);

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
      return { error: 'please use jpg, png, webp, or iphone photo formats like heic/heif' };
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
      return { error: 'could not upload this photo. please try jpg or png if the issue continues' };
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
    .update(updatePayload)
    .eq('id', user.id);

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

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}

export async function updateUserBalance(formData: FormData) {
  const { supabase } = await requireAdmin();

  const userId = String(formData.get('user_id') || '');
  const balance = Number(formData.get('balance') || 0);

  const { error } = await supabase
    .from('users')
    .update({ balance })
    .eq('id', userId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
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