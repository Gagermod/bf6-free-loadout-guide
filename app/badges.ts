import styles from "./page.module.scss";

const TYPE_BADGE: Record<string, string> = {
  "Assault Rifle": "AR",
  SMG: "SMG",
  LMG: "LMG",
  DMR: "DMR",
  "Sniper Rifle": "Sniper",
  Shotgun: "Shotgun",
  Carbine: "Carbine",
  Secondary: "Pistol",
};

export function badgeClass(type: string): string {
  return `${styles.badgeTag} ${styles[`badgeTag${TYPE_BADGE[type] || type}`] || ""}`;
}