import { format } from 'date-fns';

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

export function formatRunWindow(date: string, startTime: string, endTime: string) {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${date}T${endTime}`);
  return `${formatOrdinalDay(date)} time: ${format(start, 'h:mm a')}-${format(end, 'h:mm a')}`;
}

export function isNewUser(profile?: { name: string; avatar_url: string | null } | null) {
  return !profile || !profile.name || !profile.avatar_url;
}