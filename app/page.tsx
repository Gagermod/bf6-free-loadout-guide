import loadoutsData from "../data/weapon-loadouts.json";
import WeaponApp from "./WeaponApp";

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

const weapons = loadoutsData as Record<string, WeaponData>;
const weaponList = Object.entries(weapons)
  .filter(([, data]) => data.type !== "Melee")
  .map(([slug, data]) => ({
    slug,
    displayName: data.displayName,
    type: data.type,
    image: data.image,
  }));

const allTypes = [...new Set(weaponList.map((w) => w.type))];

export default function Home() {
  return <WeaponApp weaponList={weaponList} allTypes={allTypes} />;
}
