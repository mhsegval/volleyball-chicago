import { format } from 'date-fns';
import type { UserProfile } from '@/lib/types';

export function formatOrdinalDay(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();

  const suffix =
    day % 10 === 1 && day !== 11
      ? 'st'
      : day % 10 === 2 && day !== 12
      ? 'nd'
      : day % 10 === 3 && day !== 13
      ? 'rd'
      : 'th';

  return `${day}${suffix} ${format(date, 'MMMM yyyy').toLowerCase()}`;
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

export function isNewUser(profile: UserProfile | null | undefined) {
  return !profile?.name || profile.name.trim().length === 0;
}