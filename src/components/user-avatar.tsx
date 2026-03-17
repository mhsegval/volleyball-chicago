import Image from "next/image";

export function UserAvatar({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  const initials = (name || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200"
      style={{ width: size, height: size }}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={name || "user avatar"}
          fill
          className="object-cover"
          sizes={`${size}px`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-600">
          {initials || "?"}
        </div>
      )}
    </div>
  );
}
