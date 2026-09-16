import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import weaponsMeta from "../../../data/_weapons-meta.json";
import siteMeta from "../../../data/_site-meta.json";
import WeaponDetailPage from "../../WeaponDetailPage";
import { badgeClass } from "../../badges";
import styles from "../../page.module.scss";

type WeaponMeta = Record<string, { displayName: string; type: string; image?: string }>;
const meta = weaponsMeta as WeaponMeta;

const SITE_URL = "https://bf6-free-loadout-guide.vercel.app";

const TYPE_URL: Record<string, string> = {
  "Assault Rifle": "assault-rifle",
  SMG: "smg",
  LMG: "lmg",
  DMR: "dmr",
  "Sniper Rifle": "sniper-rifle",
  Shotgun: "shotgun",
  Carbine: "carbine",
  Secondary: "secondary",
};

interface CardAttach {
  slot: string;
  cost: number;
  name: string;
}
interface LoadoutCard {
  title: string;
  budget: string;
  attachments: CardAttach[];
}
interface WeaponData {
  weapon: string;
  modes: Record<string, Record<string, LoadoutCard[]>>;
  attachments: { name: string; slot: string; level: number | null }[];
}

export function generateStaticParams() {
  return Object.keys(meta).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = meta[slug];
  if (!w) return {};
  return {
    title: `${w.displayName} Best Loadout & Attachments`,
    description: `Free BF6 ${w.displayName} loadout guide. Best attachments for ${w.displayName} (${w.type}) at every rank — Multiplayer, Battle Royale and Ranked. ${siteMeta.season}. No account needed.`,
    keywords: ["bf6", "battlefield 6", w.displayName, `${w.displayName} loadout`, `${w.displayName} best attachments`, "loadout builder", "weapon builds"],
    alternates: { canonical: `${SITE_URL}/weapon/${slug}` },
    openGraph: {
      type: "website",
      locale: "en_US",
      title: `${w.displayName} Best Loadout & Attachments — BF6`,
      description: `Best BF6 ${w.displayName} attachments at every rank — Multiplayer, Battle Royale and Ranked. ${siteMeta.season}.`,
      url: `${SITE_URL}/weapon/${slug}`,
      siteName: "BF6 Loadout Guide",
    },
    twitter: {
      card: "summary_large_image",
      title: `${w.displayName} Best Loadout & Attachments — BF6`,
      description: `Best BF6 ${w.displayName} attachments at every rank. ${siteMeta.season}.`,
    },
  };
}

function loadData(slug: string): WeaponData | null {
  const file = path.join(process.cwd(), "data", `${slug}-bfmeta-loadouts.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, "utf8")) as WeaponData;
}

const MODE_LABELS: Record<string, string> = {
  "battle-royale": "Battle Royale",
  ranked: "Ranked",
  "big-maps": "Multiplayer — Big Maps",
  "small-maps": "Multiplayer — Small Maps",
};

function rankCardKey(cards: LoadoutCard[]): string {
  return JSON.stringify(cards.map((c) => [c.title, c.budget, c.attachments]));
}

interface RankGroup {
  range: string;
  cards: LoadoutCard[];
}

function buildRankGroups(modeData: Record<string, LoadoutCard[]>): RankGroup[] {
  const ranks = Object.keys(modeData)
    .map(Number)
    .sort((a, b) => a - b);
  const groups: RankGroup[] = [];
  let start: number | null = null;
  let prevKey: string | null = null;
  let prevCards: LoadoutCard[] = [];

  for (const rank of ranks) {
    const cards = modeData[String(rank)] || [];
    if (!cards.length) continue;
    const key = rankCardKey(cards);
    if (start === null) {
      start = rank;
    } else if (prevKey !== key) {
      groups.push({ range: start === rank - 1 ? `Rank ${start}` : `Ranks ${start}–${rank - 1}`, cards: prevCards });
      start = rank;
    }
    prevKey = key;
    prevCards = cards;
  }
  if (start !== null) {
    groups.push({ range: start === ranks[ranks.length - 1] ? `Rank ${start}` : `Ranks ${start}–${ranks[ranks.length - 1]}`, cards: prevCards });
  }
  return groups;
}

function Example({ cards }: { cards: LoadoutCard[] }) {
  const c = cards[0];
  if (!c) return null;
  const others = cards.slice(1);
  return (
    <div className={styles.seoRankContent}>
      <div className={styles.seoRankHead}>
        <span className={styles.seoCardTitle}>{c.title}</span>
        <span className={styles.seoCardBudget}>{c.budget}</span>
      </div>
      <ul className={styles.seoAttachList}>
        {c.attachments.map((a) => (
          <li key={`${a.slot}-${a.name}`}>
            <span className={styles.seoAttachName}>{a.name}</span>
            <span className={styles.seoAttachSlot}>— {a.slot} · {a.cost}</span>
          </li>
        ))}
      </ul>
      {others.length > 0 && (
        <div className={styles.seoAltTitles}>
          Alternatives: {others.map((o) => o.title).join(", ")}
        </div>
      )}
    </div>
  );
}

function SeoLoadoutBlock({ slug, data }: { slug: string; data: WeaponData }) {
  const w = meta[slug];
  const typeUrl = TYPE_URL[w?.type] || "smg";
  const modes = Object.keys(data.modes).filter((m) => MODE_LABELS[m]);

  return (
    <section className={styles.seoSection}>
      <h2 className={styles.seoHeading}>
        Best {w?.displayName} Attachments & Loadouts in BF6
      </h2>
      <p className={styles.seoIntro}>
        Full breakdown of {w?.displayName} — a {w?.type.toLowerCase()} in Battlefield 6 — across all game
        modes and every rank. Choose your rank and see the recommended setup, or browse the complete list below ({siteMeta.season}).
      </p>

      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">BF6 Loadout Guide</Link>
        <span>›</span>
        <Link href={`/type/${typeUrl}`}>{w?.displayName}</Link>
        <span>›</span>
        <span>{w?.displayName}</span>
      </nav>

      {modes.map((mode) => {
        const groups = buildRankGroups(data.modes[mode]);
        return (
          <details key={mode} className={styles.seoMode}>
            <summary className={styles.seoModeSummary}>
              <span className={styles.seoModeTitle}>{MODE_LABELS[mode]} attachments</span>
              <span className={styles.seoModeMeta}>{groups.length} sets</span>
            </summary>
            <div className={styles.seoRankList}>
              {groups.map((g, i) => (
                <div key={i} className={styles.seoRankRow}>
                  <div className={styles.seoRankLabel}>{g.range}</div>
                  <Example cards={g.cards} />
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </section>
  );
}

export default async function WeaponPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = meta[slug];
  if (!w) notFound();

  const data = loadData(slug);
  if (!data) notFound();

  const weapon = { slug, displayName: w.displayName, type: w.type, image: w.image };
  const typeUrl = TYPE_URL[w.type] || "smg";

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "BF6 Loadout Guide", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: w.type, item: `${SITE_URL}/type/${typeUrl}` },
              { "@type": "ListItem", position: 3, name: `${w.displayName} Best Loadout` },
            ],
          }),
        }}
      />
      <div className={styles.container}>
        <div className={styles.pageTop}>
          <span className={badgeClass(w.type)}>{w.type}</span>
          <h1 className={styles.detailName}>{w.displayName} Best Loadout</h1>
          <p className={styles.pageSubtitle}>
            See the best {w.displayName} attachments for every rank in Battlefield 6.
          </p>
          <div className={styles.seasonInfo}>
            <span className={styles.seasonInfoItem}>
              <span className={styles.seasonInfoUpdated}>updated</span>
              <span>: {siteMeta.updatedAt}</span>
            </span>
            <span className={styles.seasonInfoItem}>{siteMeta.season}</span>
          </div>
        </div>

        <WeaponDetailPage weapon={weapon} data={data} />

        <Link href="/" className={styles.backLink}>
          ← Browse all weapons
        </Link>

        <SeoLoadoutBlock slug={slug} data={data} />

        <nav className={styles.typeNav}>
          <span>More {w.type}s:</span>
          {Object.entries(meta)
            .filter(([, d]) => d.type === w.type && d.displayName !== w.displayName)
            .slice(0, 10)
            .map(([s, d]) => (
              <Link key={s} href={`/weapon/${s}`} className={styles.typeNavLink}>
                {d.displayName}
              </Link>
            ))}
        </nav>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <span>Not affiliated with EA or DICE</span>
        </div>
      </footer>
    </div>
  );
}