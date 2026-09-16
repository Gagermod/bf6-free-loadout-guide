"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import styles from "./page.module.scss";
import { badgeClass } from "./badges";

export interface CardAttach {
  slot: string;
  cost: number;
  name: string;
}

export interface LoadoutCard {
  title: string;
  budget: string;
  attachments: CardAttach[];
}

export interface WeaponModeData {
  modes: Record<string, Record<string, LoadoutCard[]>>;
  attachments: { name: string; slot: string; level: number | null }[];
}

export interface WeaponData extends WeaponModeData {
  weapon: string;
}

export interface WeaponListItem {
  slug: string;
  displayName: string;
  type: string;
  image?: string;
}

export const SLOT_ORDER = [
  "Barrel", "Underbarrel", "Ammunition", "Muzzle", "Magazine",
  "Top Accessory", "Left Accessory", "Right Accessory", "Scope",
  "Optic Accessory", "Ergonomics",
];

export type GameMode = "battle-royale" | "ranked" | "multiplayer";
export type SubMode = "big-maps" | "small-maps";

export function WeightBar({ budget }: { budget: string }) {
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

export function WeaponDetail({
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
  onClose?: () => void;
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
          {onClose && (
            <button className={styles.closeBtn} onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18" /><path d="m6 6 12 12" />
              </svg>
            </button>
          )}
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
        {onClose && (
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        )}
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