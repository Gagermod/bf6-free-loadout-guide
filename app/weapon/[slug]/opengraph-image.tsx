import { ImageResponse } from "next/og";
import weaponsMeta from "../../../data/_weapons-meta.json";
import siteMeta from "../../../data/_site-meta.json";

type WeaponMeta = Record<string, { displayName: string; type: string; image?: string }>;
const meta = weaponsMeta as WeaponMeta;

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = meta[slug];
  const name = w?.displayName || "BF6";
  const type = w?.type || "Weapon";

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
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#5aa2ff",
            marginBottom: 20,
          }}
        >
          {type} · BF6 Loadout Guide
        </div>
        <div style={{ display: "flex", fontSize: 92, fontWeight: 900, letterSpacing: "-0.02em", lineHeight: 1.05 }}>
          {name}
        </div>
        <div style={{ display: "flex", marginTop: 20, fontSize: 34, fontWeight: 400, color: "#9aa4b2" }}>
          Best loadout & attachments at every rank
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
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