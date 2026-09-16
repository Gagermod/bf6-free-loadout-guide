"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.scss";
import { badgeClass } from "./badges";
import type { WeaponListItem } from "./WeaponDetail";

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

  const filtered = weaponList.filter((w) => {
    const matchesSearch = w.displayName.toLowerCase().includes(search.toLowerCase());
    const matchesType = activeFilter === "All" || w.type === activeFilter;
    return matchesSearch && matchesType;
  });

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

        <div className={styles.content}>
          <div className={styles.list}>
            {filtered.map((w) => (
              <Link key={w.slug} href={`/weapon/${w.slug}`} className={styles.item}>
                <div className={styles.itemInfo}>
                  {w.image && <Image className={styles.itemImg} src={w.image} alt="" width={48} height={28} loading="lazy" unoptimized />}
                  <div className={styles.itemName}>{w.displayName}</div>
                </div>
                <div className={styles.itemRight}>
                  <span className={badgeClass(w.type)}>{w.type}</span>
                  <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <div className={styles.noDataMessage}>
                <p>No weapons match your search.</p>
              </div>
            )}
          </div>
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