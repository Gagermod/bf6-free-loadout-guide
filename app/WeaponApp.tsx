"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import styles from "./page.module.scss";

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

interface WeaponModeData {
  modes: Record<string, Record<string, LoadoutCard[]>>;
  attachments: { name: string; slot: string; level: number | null }[];
}

interface WeaponData extends WeaponModeData {
  weapon: string;
}

interface WeaponListItem {
  slug: string;
  displayName: string;
  type: string;
  image?: string;
}

const SLOT_ORDER = [
  "Barrel", "Underbarrel", "Ammunition", "Muzzle", "Magazine",
  "Top Accessory", "Left Accessory", "Right Accessory", "Scope",
  "Optic Accessory", "Ergonomics",
];

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

function badgeClass(type: string): string {
  return `${styles.badgeTag} ${styles[`badgeTag${TYPE_BADGE[type] || type}`] || ""}`;
}

export default function WeaponApp({
  weaponList,
  allTypes,
  updatedAt = "Sep 17, 2026",
  season = "Season 4",
}: {
  weaponList: WeaponListItem[];
  allTypes: string[];
  updatedAt?: string;
  season?: string;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [rank, setRank] = useState(1);
  const [weaponData, setWeaponData] = useState<WeaponData | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = weaponList.filter((w) => {
    const matchesSearch = w.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "All" || w.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const abortRef = useRef<AbortController | null>(null);

  const loadWeapon = useCallback(async (slug: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setWeaponData(null);
    try {
      const res = await fetch(`/api/weapon/${slug}`, { signal: controller.signal });
      if (res.ok) setWeaponData(await res.json());
    } catch {
      // aborted or failed
    }
    if (!controller.signal.aborted) setLoading(false);
  }, []);

  const handleSelectWeapon = useCallback((slug: string | null) => {
    setRank(1);
    setSelectedSlug(slug);
    if (slug) {
      loadWeapon(slug);
    } else {
      abortRef.current?.abort();
      setWeaponData(null);
    }
  }, [loadWeapon]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (selectedSlug) {
      setSelectedSlug(null);
      setWeaponData(null);
    }
  }, [selectedSlug]);

  const selectedWeapon = useMemo(
    () => weaponList.find((w) => w.slug === selectedSlug) || null,
    [weaponList, selectedSlug]
  );

  useEffect(() => {
    if (selectedWeapon) {
      document.title = `${selectedWeapon.displayName} Best Loadout — Free BF6 Guide`;
    } else {
      document.title = "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank";
    }
  }, [selectedWeapon]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BF6 Loadout Guide",
            url: "https://bf6-free-loadout-guide.vercel.app",
            description: "Free Battlefield 6 loadout builder. See the best attachments for every weapon at every rank. No account needed.",
            applicationCategory: "GameApplication",
            operatingSystem: "Web",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            author: { "@type": "Organization", name: "BF6 Loadout Guide" },
          }),
        }}
      />
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.badge}>Free · No Account Required</div>
          <h1 className={styles.title}>BF6 Meta Builds</h1>
          <p className={styles.subtitle}>
            Pick a weapon, set your rank, see best attachments for every gun level — for free.
          </p>
          <div className={styles.seasonInfo}>
            <span className={styles.seasonInfoItem}>
              <span className={styles.seasonInfoUpdated}>updated</span>
              <span>: {updatedAt}</span>
            </span>
            <span className={styles.seasonInfoItem}>{season}</span>
          </div>
        </header>

        <div className={styles.toolbar}>
          <div className={styles.search}>
            <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Search weapons..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <div className={styles.filters}>
            {(["All", ...allTypes] as const).map((type) => (
              <button
                key={type}
                className={`${styles.filterBtn} ${activeFilter === type ? styles.filterBtnActive : ""}`}
                onClick={() => setActiveFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className={`${styles.content} ${selectedSlug ? styles.contentSplit : ""}`}>
          <div className={styles.list}>
            {filtered.map((w) => {
              const isActive = selectedSlug === w.slug;
              return (
                <div key={w.slug} ref={isActive ? (el) => {
                  if (el) el.scrollIntoView({ block: "start", behavior: "smooth" });
                } : undefined}>
                  <div
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                    onClick={() => handleSelectWeapon(isActive ? null : w.slug)}
                  >
                    <div className={styles.itemInfo}>
                      {w.image && <Image className={styles.itemImg} src={w.image} alt="" width={48} height={28} loading="lazy" unoptimized />}
                      <div className={styles.itemName}>{w.displayName}</div>
                    </div>
                    <div className={styles.itemRight}>
                      {!isActive && (
                        <span className={badgeClass(w.type)}>{w.type}</span>
                      )}
                      <svg className={`${styles.chevron} ${isActive ? styles.chevronUp : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                  {isActive && (
                    <div className={styles.itemDetailMobile}>
                      <WeaponDetail weapon={selectedWeapon} data={weaponData} rank={rank} setRank={setRank} onClose={() => handleSelectWeapon(null)} loading={loading} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedSlug && (
            <div className={styles.detail}>
              <div className={styles.detailInner}>
                <WeaponDetail weapon={selectedWeapon} data={weaponData} rank={rank} setRank={setRank} onClose={() => handleSelectWeapon(null)} loading={loading} />
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <span>Not affiliated with EA or DICE</span>
        </div>
      </footer>
    </div>
  );
}

type GameMode = "battle-royale" | "ranked" | "multiplayer";
type SubMode = "big-maps" | "small-maps";

function WeightBar({ budget }: { budget: string }) {
  const match = budget.match(/^(\d+)\/(\d+)$/);
  const current = match ? Number(match[1]) : 0;
  const max = match ? Number(match[2]) : 100;
  const filledSquares = max > 0 ? Math.min(Math.floor((current / max) * 10), 10) : 0;
  const isMax = max > 0 && current >= max;

  return (
    <div className={styles.weightBar}>
      <div className={styles.weightSquares}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`${styles.weightSquare} ${i < filledSquares ? styles.weightSquareFilled : ""} ${isMax && i < filledSquares ? styles.weightSquareMax : ""}`} />
        ))}
      </div>
      <span className={`${styles.weightText} ${isMax ? styles.weightTextMax : ""}`}>
        {budget}
      </span>
    </div>
  );
}

function WeaponDetail({
  weapon,
  data,
  rank,
  setRank,
  onClose,
  loading,
}: {
  weapon: WeaponListItem | null;
  data: WeaponData | null;
  rank: number;
  setRank: (n: number) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const maxRank = 40;
  const [mode, setMode] = useState<GameMode>("multiplayer");
  const [subMode, setSubMode] = useState<SubMode>("big-maps");
  const [playstyle, setPlaystyle] = useState<string>("");
  const [changedSlots, setChangedSlots] = useState<Record<string, "changed" | "new" | "removed">>({});
  const prevCardRef = useRef<Record<string, CardAttach>>({});
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const modeKey = mode === "multiplayer" ? subMode : mode;

  const cards = useMemo<LoadoutCard[]>(() => {
    if (!data) return [];
    return data.modes?.[modeKey]?.[String(rank)] || [];
  }, [data, modeKey, rank]);

  const card = useMemo<LoadoutCard | undefined>(() => {
    if (!cards.length) return undefined;
    const active = playstyle && cards.find((c) => c.title === playstyle);
    return active || cards[0];
  }, [cards, playstyle]);

  const levelByAttach = useMemo(() => {
    const map: Record<string, number | null> = {};
    for (const a of data?.attachments || []) map[a.name.toLowerCase()] = a.level;
    return map;
  }, [data]);

  const sortedAttachments = useMemo(() => {
    if (!card) return [];
    const known = SLOT_ORDER.filter((s) => s !== "");
    const knownMatches = known
      .map((slot) => card.attachments.find((a) => a.slot === slot))
      .filter((a): a is CardAttach => Boolean(a));
    const others = card.attachments.filter((a) => !known.includes(a.slot));
    return [...knownMatches, ...others];
  }, [card]);

  useEffect(() => {
    if (!card) return;
    const prev = prevCardRef.current;
    const changes: Record<string, "changed" | "new" | "removed"> = {};

    for (const a of card.attachments) {
      const old = prev[a.slot];
      if (!old) changes[a.slot] = "new";
      else if (old.name !== a.name || old.cost !== a.cost) changes[a.slot] = "changed";
    }
    for (const slot of Object.keys(prev)) {
      if (!card.attachments.some((a) => a.slot === slot)) changes[slot] = "removed";
    }

    if (Object.keys(changes).length > 0) {
      requestAnimationFrame(() => {
        setChangedSlots(changes);
        if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
        animTimeoutRef.current = setTimeout(() => setChangedSlots({}), 900);
      });
    }
    const next: Record<string, CardAttach> = {};
    for (const a of card.attachments) next[a.slot] = a;
    prevCardRef.current = next;
  }, [card]);

  if (loading || !weapon) {
    return (
      <div className={styles.detailHeader}>
        <div className={styles.detailTitleRow}>
          <div className={styles.detailName} style={{ width: 200, height: 24, background: "var(--muted)", borderRadius: 6 }} />
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
        <div className={styles.noDataMessage}><p>Loading...</p></div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.detailTop}>
        <div>
          <span className={badgeClass(weapon.type)}>{weapon.type}</span>
          <h2 className={styles.detailName}>{weapon.displayName} Best Loadout</h2>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>
      </div>

      {weapon.image && (
        <div className={styles.weaponImage}>
          <Image src={weapon.image} alt={`${weapon.displayName} loadout`} width={600} height={80} unoptimized />
        </div>
      )}

      {!data ? (
        <div className={styles.noDataMessage}>
          <p>No attachment data available for this weapon yet.</p>
        </div>
      ) : (
        <>
          <div className={styles.modeTabs}>
            <div className={styles.modeTabsMain}>
              {(["multiplayer", "battle-royale", "ranked"] as const).map((m) => (
                <button key={m} className={`${styles.modeTab} ${mode === m ? styles.modeTabActive : ""}`} onClick={() => setMode(m)}>
                  {m === "battle-royale" ? "Battle Royale" : m === "ranked" ? "Ranked" : "Multiplayer"}
                </button>
              ))}
            </div>
            {mode === "multiplayer" && (
              <div className={styles.modeTabsSub}>
                <button className={`${styles.modeTabSub} ${subMode === "big-maps" ? styles.modeTabSubActive : ""}`} onClick={() => setSubMode("big-maps")}>Big Maps</button>
                <button className={`${styles.modeTabSub} ${subMode === "small-maps" ? styles.modeTabSubActive : ""}`} onClick={() => setSubMode("small-maps")}>Small Maps</button>
              </div>
            )}
          </div>

          {cards.length > 1 && (
            <div className={styles.modeTabsSub} style={{ marginBottom: "1rem" }}>
              {cards.map((c) => (
                <button key={c.title} className={`${styles.modeTabSub} ${card?.title === c.title ? styles.modeTabSubActive : ""}`} onClick={() => setPlaystyle(c.title)}>
                  {c.title}
                </button>
              ))}
            </div>
          )}

          <div className={styles.rankSection}>
            <div className={styles.rankHeader}>
              <div>
                <div className={styles.rankLabel}>Your rank</div>
                <div className={styles.rankValue}>{rank}</div>
              </div>
            </div>
            <div className={styles.sliderWrap}>
              <input type="range" className={styles.slider} min={1} max={maxRank} value={rank} onChange={(e) => setRank(Number(e.target.value))} />
              <div className={styles.sliderTicks}><span>1</span><span>10</span><span>20</span><span>30</span><span>40</span></div>
            </div>
          </div>

          {card && <WeightBar budget={card.budget} />}

          <div className={styles.attachments}>
            {sortedAttachments.map((att) => {
              const changeType = changedSlots[att.slot];
              const rowClass = changeType === "new" ? `${styles.attachRow} ${styles.attachRowNew}` : changeType === "changed" ? `${styles.attachRow} ${styles.attachRowChanged}` : changeType === "removed" ? `${styles.attachRow} ${styles.attachRowRemoved}` : styles.attachRow;
              const level = levelByAttach[att.name.toLowerCase()];

              return (
                <div key={`${att.slot}-${att.name}`} className={rowClass}>
                  <div className={styles.attachLeft}>
                    <div className={styles.attachName}>{att.name}</div>
                    <div className={styles.attachSlotInfo}>
                      {att.slot}
                      <svg className={styles.attachWeightIcon} width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5z" />
                        <path d="M12 8l-4 3v5h8v-5l-4-3z" />
                      </svg>
                      {att.cost}
                    </div>
                  </div>
                  <div className={styles.attachLevel}>{level != null && level > 0 ? `Level ${level}` : ""}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}