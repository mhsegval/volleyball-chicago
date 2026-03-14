export type AppRole = 'user' | 'admin';
export type RunStatus = 'active' | 'completed';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  balance: number;
  streak: number;
  role: AppRole;
};

export type Run = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  gym_name: string;
  location_url: string;
  total_rent: number;
  status: RunStatus;
  balances_applied: boolean;
};

export type Signup = {
  id: string;
  run_id: string;
  user_id: string;
  created_at: string;
  users?: UserProfile;
};