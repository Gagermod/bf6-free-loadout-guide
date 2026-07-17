"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./page.module.scss";

interface LoadoutItem {
  name: string;
  cost: number;
  mastery: number;
  unlock?: string | null;
}

interface WeaponData {
  displayName: string;
  type: string;
  image?: string;
  stats: Record<string, string | null>;
  loadouts: Record<number, Record<string, LoadoutItem>>;
  noData?: boolean;
}

interface WeaponListItem {
  slug: string;
  displayName: string;
  type: string;
  image?: string;
}

interface ModeLoadouts {
  [mode: string]: Record<number, Record<string, LoadoutItem>>;
}

const SLOT_ORDER = [
  "Barrel", "Underbarrel", "Ammunition", "Muzzle", "Magazine",
  "Top Accessory", "Left Accessory", "Right Accessory", "Scope",
  "Optic Accessory", "Ergonomics",
];

export default function WeaponApp({
  weaponList,
  allTypes,
}: {
  weaponList: WeaponListItem[];
  allTypes: string[];
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [rank, setRank] = useState(1);
  const [weaponData, setWeaponData] = useState<WeaponData | null>(null);
  const [modeData, setModeData] = useState<ModeLoadouts | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = weaponList.filter((w) => {
    const matchesSearch = w.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "All" || w.type === activeFilter;
    return matchesSearch && matchesType;
  });

  const loadWeapon = useCallback(async (slug: string) => {
    setLoading(true);
    try {
      const [loadoutRes, modeRes] = await Promise.all([
        fetch(`/api/weapon/${slug}`),
        fetch(`/api/loadout/${slug}`),
      ]);
      if (loadoutRes.ok) setWeaponData(await loadoutRes.json());
      if (modeRes.ok) setModeData(await modeRes.json());
    } catch {
      // fallback
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedSlug) {
      loadWeapon(selectedSlug);
      setRank(1);
    } else {
      setWeaponData(null);
      setModeData(null);
    }
  }, [selectedSlug, loadWeapon]);

  useEffect(() => {
    if (weaponData) {
      document.title = `${weaponData.displayName} Best Loadout — Free BF6 Guide`;
    } else {
      document.title = "Free BF6 Loadout Guide — Best Attachments for Every Weapon & Rank";
    }
  }, [weaponData]);

  return (
    <div className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "BF6 Loadout Guide",
            url: "https://bf6loadout.gg",
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
              onChange={(e) => setSearch(e.target.value)}
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
                <div key={w.slug}>
                  <div
                    className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                    onClick={() => setSelectedSlug(isActive ? null : w.slug)}
                  >
                    <div className={styles.itemInfo}>
                      {w.image && <img className={styles.itemImg} src={w.image} alt="" loading="lazy" />}
                      <div className={styles.itemName}>{w.displayName}</div>
                    </div>
                    <div className={styles.itemRight}>
                      {!isActive && (
                        <span className={`${styles.badgeTag} ${styles[`badgeTag${w.type}`] || ""}`}>{w.type}</span>
                      )}
                      <svg className={`${styles.chevron} ${isActive ? styles.chevronUp : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                  {isActive && weaponData && (
                    <div className={styles.itemDetailMobile}>
                      <WeaponDetail weapon={weaponData} weaponSlug={selectedSlug} modeData={modeData} rank={rank} setRank={setRank} onClose={() => setSelectedSlug(null)} loading={loading} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {selectedSlug && weaponData && (
            <div className={styles.detail}>
              <div className={styles.detailInner}>
                <WeaponDetail weapon={weaponData} weaponSlug={selectedSlug} modeData={modeData} rank={rank} setRank={setRank} onClose={() => setSelectedSlug(null)} loading={loading} />
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

const MAX_WEIGHT = 100;

function WeightBar({ loadout }: { loadout: Record<string, LoadoutItem> }) {
  const totalWeight = Object.values(loadout).reduce((sum, item) => sum + (item.cost || 0), 0);
  const filledSquares = Math.min(Math.floor(totalWeight / 10), 10);
  const isMax = totalWeight >= MAX_WEIGHT;

  return (
    <div className={styles.weightBar}>
      <div className={styles.weightSquares}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={`${styles.weightSquare} ${i < filledSquares ? styles.weightSquareFilled : ""} ${isMax && i < filledSquares ? styles.weightSquareMax : ""}`} />
        ))}
      </div>
      <span className={`${styles.weightText} ${isMax ? styles.weightTextMax : ""}`}>
        {totalWeight}/{MAX_WEIGHT}
      </span>
    </div>
  );
}

function WeaponDetail({ weapon, weaponSlug, modeData, rank, setRank, onClose, loading }: {
  weapon: WeaponData;
  weaponSlug: string;
  modeData: ModeLoadouts | null;
  rank: number;
  setRank: (n: number) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const maxRank = 40;
  const [mode, setMode] = useState<GameMode>("multiplayer");
  const [subMode, setSubMode] = useState<SubMode>("big-maps");
  const [changedSlots, setChangedSlots] = useState<Record<string, "changed" | "new" | "removed">>({});
  const prevLoadoutRef = useRef<Record<string, LoadoutItem>>({});
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const modeKey = mode === "multiplayer" ? subMode : mode;
  const modeLoadout = modeData?.[modeKey];

  let loadout: Record<string, LoadoutItem>;
  if (modeLoadout) {
    loadout = modeLoadout[rank] || {};
  } else {
    loadout = weapon.loadouts?.[rank] || {};
  }

  useEffect(() => {
    const prevLoadout = prevLoadoutRef.current;
    const changes: Record<string, "changed" | "new" | "removed"> = {};

    for (const [slot, item] of Object.entries(loadout)) {
      const prev = prevLoadout[slot];
      if (!prev) changes[slot] = "new";
      else if (prev.name !== item.name || prev.cost !== item.cost) changes[slot] = "changed";
    }
    for (const slot of Object.keys(prevLoadout)) {
      if (!loadout[slot]) changes[slot] = "removed";
    }

    if (Object.keys(changes).length > 0) {
      setChangedSlots(changes);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
      animTimeoutRef.current = setTimeout(() => setChangedSlots({}), 900);
    }
    prevLoadoutRef.current = { ...loadout };
  }, [rank, modeKey]);

  return (
    <>
      <div className={styles.detailTop}>
        <div>
          <span className={`${styles.typeBadge} ${styles[`badgeTag${weapon.type}`] || ""}`}>{weapon.type}</span>
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
          <img src={weapon.image} alt={`${weapon.displayName} loadout`} />
        </div>
      )}

      {weapon.noData ? (
        <div className={styles.noDataMessage}>
          <p>No attachment data available for this weapon yet.</p>
        </div>
      ) : loading ? (
        <div className={styles.noDataMessage}><p>Loading...</p></div>
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

          <WeightBar loadout={loadout} />

          <div className={styles.attachments}>
            {SLOT_ORDER.filter((s) => loadout[s] && s !== "").map((slotName) => {
              const item = loadout[slotName];
              const changeType = changedSlots[slotName];
              const rowClass = changeType === "new" ? `${styles.attachRow} ${styles.attachRowNew}` : changeType === "changed" ? `${styles.attachRow} ${styles.attachRowChanged}` : changeType === "removed" ? `${styles.attachRow} ${styles.attachRowRemoved}` : styles.attachRow;

              return (
                <div key={slotName} className={rowClass}>
                  <div className={styles.attachLeft}>
                    <div className={styles.attachName}>{item.name}</div>
                    <div className={styles.attachSlotInfo}>
                      {slotName}
                      <svg className={styles.attachWeightIcon} width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6v-9l6-4.5z" />
                        <path d="M12 8l-4 3v5h8v-5l-4-3z" />
                      </svg>
                      {item.cost}
                    </div>
                  </div>
                  <div className={styles.attachLevel}>{item.unlock || (item.mastery > 0 ? `Level ${item.mastery}` : "")}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
