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
        className="rounded-full object-cover ring-1 ring-slate-200"
      />
    );
  }

  return (
    <div
      className="grid rounded-full bg-gradient-to-br from-sky-100 to-emerald-100 font-semibold text-slate-700 ring-1 ring-slate-200"
      style={{ width: size, height: size, placeItems: "center" }}
    >
      {name?.slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}
