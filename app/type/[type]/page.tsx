import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import weaponsMeta from "../../../data/_weapons-meta.json";
import siteMeta from "../../../data/_site-meta.json";
import { badgeClass } from "../../badges";
import styles from "../../page.module.scss";

type WeaponMeta = Record<string, { displayName: string; type: string; image?: string }>;
const meta = weaponsMeta as WeaponMeta;

const SITE_URL = "https://bf6-free-loadout-guide.vercel.app";

const TYPES: Record<string, { label: string; heading: string; description: string }> = {
  "assault-rifle": {
    label: "Assault Rifle",
    heading: "Best Assault Rifles in BF6",
    description: "Full list of Battlefield 6 assault rifles with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  smg: {
    label: "SMG",
    heading: "Best SMGs in BF6",
    description: "Full list of Battlefield 6 SMGs with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  lmg: {
    label: "LMG",
    heading: "Best LMGs in BF6",
    description: "Full list of Battlefield 6 light machine guns with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  dmr: {
    label: "DMR",
    heading: "Best DMRs in BF6",
    description: "Full list of Battlefield 6 designated marksman rifles with best attachments and loadouts at every rank.",
  },
  "sniper-rifle": {
    label: "Sniper Rifle",
    heading: "Best Sniper Rifles in BF6",
    description: "Full list of Battlefield 6 sniper rifles with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  shotgun: {
    label: "Shotgun",
    heading: "Best Shotguns in BF6",
    description: "Full list of Battlefield 6 shotguns with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  carbine: {
    label: "Carbine",
    heading: "Best Carbines in BF6",
    description: "Full list of Battlefield 6 carbines with best attachments and loadouts at every rank — Multiplayer, Battle Royale and Ranked.",
  },
  secondary: {
    label: "Secondary",
    heading: "Best Pistols & Secondaries in BF6",
    description: "Full list of Battlefield 6 secondary weapons and pistols with best attachments and loadouts at every rank.",
  },
};

export function generateStaticParams() {
  return Object.keys(TYPES).map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ type: string }>;
}): Promise<Metadata> {
  const { type } = await params;
  const t = TYPES[type];
  if (!t) return {};
  return {
    title: t.heading,
    description: `${t.description} ${siteMeta.season}. Free, no account needed.`,
    keywords: ["bf6", "battlefield 6", t.label.toLowerCase(), "best loadouts", "best attachments", "weapon tier list"],
    alternates: { canonical: `${SITE_URL}/type/${type}` },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${t.heading} — BF6 Loadout Guide`,
      description: t.description,
      url: `${SITE_URL}/type/${type}`,
      siteName: "BF6 Loadout Guide",
    },
    twitter: {
      card: "summary_large_image",
      title: `${t.heading} — BF6 Loadout Guide`,
      description: t.description,
    },
  };
}

export default async function TypePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  const t = TYPES[type];
  if (!t) notFound();

  const weapons = Object.entries(meta)
    .filter(([, d]) => d.type === t.label)
    .sort((a, b) => a[1].displayName.localeCompare(b[1].displayName));

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: t.heading,
            description: t.description,
            url: `${SITE_URL}/type/${type}`,
            mainEntity: {
              "@type": "ItemList",
              itemListElement: weapons.map(([slug, w], i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: w.displayName,
                url: `${SITE_URL}/weapon/${slug}`,
              })),
            },
          }),
        }}
      />
      <div className={styles.container}>
        <div className={styles.pageTop}>
          <span className={badgeClass(t.label)}>{t.label}</span>
          <h1 className={styles.detailName}>{t.heading}</h1>
          <p className={styles.pageSubtitle}>{t.description}</p>
          <div className={styles.seasonInfo}>
            <span className={styles.seasonInfoItem}>
              <span className={styles.seasonInfoUpdated}>updated</span>
              <span>: {siteMeta.updatedAt}</span>
            </span>
            <span className={styles.seasonInfoItem}>{siteMeta.season}</span>
          </div>
        </div>

        <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
          <Link href="/">BF6 Loadout Guide</Link>
          <span>›</span>
          <span>{t.heading}</span>
        </nav>

        <div className={styles.typeList}>
          {weapons.map(([slug, w]) => (
            <Link key={slug} href={`/weapon/${slug}`} className={styles.item}>
              <div className={styles.itemInfo}>
                {w.image && <Image className={styles.itemImg} src={w.image} alt="" width={48} height={28} loading="lazy" unoptimized />}
                <div className={styles.itemName}>{w.displayName}</div>
              </div>
              <div className={styles.itemRight}>
                <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/" className={styles.backLink}>← Browse all weapons</Link>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <span>Not affiliated with EA or DICE</span>
        </div>
      </footer>
    </div>
  );
}