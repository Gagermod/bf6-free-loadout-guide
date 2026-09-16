import { ImageResponse } from "next/og";
import siteMeta from "../data/_site-meta.json";

export const alt = "BF6 Loadout Guide — Free weapon builds for Battlefield 6";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 72px",
          background: "linear-gradient(135deg, #0b0f14 0%, #161b22 55%, #0b0f14 100%)",
          color: "#ffffff",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 56,
            fontWeight: 900,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
          }}
        >
          BF6 LOADOUT GUIDE
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontSize: 34,
            fontWeight: 400,
            color: "#9aa4b2",
            maxWidth: 960,
          }}
        >
          Best attachments for every weapon and rank — Multiplayer, Battle Royale, Ranked.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            gap: 12,
            fontSize: 22,
            color: "#d6dce4",
          }}
        >
          <span style={{ display: "flex", padding: "10px 18px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
            updated: {siteMeta.updatedAt}
          </span>
          <span style={{ display: "flex", padding: "10px 18px", background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
            {siteMeta.season}
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}