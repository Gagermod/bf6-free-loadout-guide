import weaponsMeta from "../data/_weapons-meta.json";
import siteMeta from "../data/_site-meta.json";
import WeaponApp from "./WeaponApp";

const meta = weaponsMeta as Record<
  string,
  { displayName: string; type: string; image?: string }
>;

const weaponList = Object.entries(meta)
  .filter(([, data]) => data.type !== "Melee")
  .map(([slug, data]) => ({
    slug,
    displayName: data.displayName,
    type: data.type,
    image: data.image,
  }));

const allTypes = [...new Set(weaponList.map((w) => w.type))];

export default function Home() {
  return (
    <WeaponApp
      weaponList={weaponList}
      allTypes={allTypes}
      updatedAt={siteMeta.updatedAt}
      season={siteMeta.season}
    />
  );
}