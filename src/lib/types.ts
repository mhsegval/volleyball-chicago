export type UserRole = "user" | "admin";
export type RunStatus = "active" | "completed";
export type PaymentMethod = "zelle" | "venmo";
export type PaymentStatus = "pending" | "approved" | "rejected" | "reversed";
export type SignupStatus = "roster" | "waitlist";

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  balance: number;
  streak: number;
  role: UserRole;
  created_at?: string;
};

export type Run = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  gym_name: string;
  location_url: string;
  total_rent: number;
  max_players: number;
  status: RunStatus;
  created_at?: string;
};

export type Signup = {
  id: string;
  run_id: string;
  user_id: string;
  status: SignupStatus;
  waitlist_position: number | null;
  guest_count: number;
  created_at: string;
};

export type PaymentRequest = {
  id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  users?: UserProfile;
};

export type BalanceHistoryItem = {
  id: string;
  kind: "payment" | "run_charge";
  amount: number;
  status?: string | null;
  method?: string | null;
  created_at: string;
  note: string;
};

export type MatchHistoryItem = {
  run_id: string;
  date: string;
  gym_name: string;
  player_count: number;
  did_play: boolean;
  your_share: number | null;
};