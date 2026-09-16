"use client";

import { useState } from "react";
import { WeaponDetail, type WeaponData, type WeaponListItem } from "./WeaponDetail";

export default function WeaponDetailPage({
  weapon,
  data,
}: {
  weapon: WeaponListItem;
  data: WeaponData;
}) {
  const [rank, setRank] = useState(1);
  return <WeaponDetail weapon={weapon} data={data} rank={rank} setRank={setRank} loading={false} />;
}