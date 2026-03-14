'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

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

  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split('.').pop() || 'png';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatar, {
        upsert: true,
        contentType: avatar.type || 'image/png',
      });

    if (uploadError) {
      return { error: uploadError.message };
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

  if (avatar && avatar.size > 0) {
    const ext = avatar.name.split('.').pop() || 'png';
    const path = `${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, avatar, {
        upsert: true,
        contentType: avatar.type || 'image/png',
      });

    if (uploadError) {
      return { error: uploadError.message };
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

  const payload = {
    date: String(formData.get('date') || ''),
    start_time: String(formData.get('start_time') || ''),
    end_time: String(formData.get('end_time') || ''),
    gym_name: String(formData.get('gym_name') || '').trim(),
    location_url: String(formData.get('location_url') || '').trim(),
    total_rent: Number(formData.get('total_rent') || 0),
    status: 'active',
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