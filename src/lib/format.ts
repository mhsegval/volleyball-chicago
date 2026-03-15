import type { UserProfile } from '@/lib/types';

export function isNewUser(profile: UserProfile) {
  return !profile.name || profile.name.trim().length === 0;
}

export function ordinal(n: number) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

export function formatRunWindow(date: string, startTime: string, endTime: string) {
  const runDate = new Date(`${date}T00:00:00`);
  const day = ordinal(runDate.getDate());
  const month = runDate.toLocaleString('en-US', { month: 'long' }).toLowerCase();
  const year = runDate.getFullYear();

  function formatTime(value: string) {
    const [hours, minutes] = value.split(':').map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);

    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  return `${day} ${month} ${year} time: ${formatTime(startTime)}-${formatTime(endTime)}`;
}