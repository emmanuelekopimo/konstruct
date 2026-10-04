import { createAvatar } from "@dicebear/core";
import { initials } from "@dicebear/collection";

const PALETTE = ["01875f", "1a73e8", "e37400", "c5221f", "8430ce", "007b83", "b31412", "185abc"];

/** Initials avatar generated locally (no image CDN). */
export function avatarUri(seed: string): string {
  return createAvatar(initials, {
    seed,
    backgroundColor: PALETTE,
    fontFamily: ["Arial"],
    fontWeight: 600,
    fontSize: 40,
  }).toDataUri();
}

export function Avatar({ name, className = "avatar", size }: { name: string; className?: string; size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarUri(name)} alt="" className={className} width={size} height={size} />
  );
}
