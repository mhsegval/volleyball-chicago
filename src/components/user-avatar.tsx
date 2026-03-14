import Image from "next/image";

export function UserAvatar({
  name,
  avatarUrl,
  size = 44,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full object-cover ring-2 ring-white/10"
      />
    );
  }

  return (
    <div
      className="grid rounded-full bg-gradient-to-br from-sky-400 to-emerald-400 font-semibold text-slate-900 ring-2 ring-white/10"
      style={{ width: size, height: size, placeItems: "center" }}
    >
      {name?.slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}
