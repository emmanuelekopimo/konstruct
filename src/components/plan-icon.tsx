import { Building, Building2, Home, Store } from "lucide-react";
import { sampleThumbPath } from "@/lib/samples";

export function PlanIcon({ sampleKey, buildingType, large }: { sampleKey: string | null; buildingType: string; large?: boolean }) {
  const cls = large ? "app-icon app-icon-lg" : "app-icon";
  if (sampleKey) {
    return (
      <span className={cls}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sampleThumbPath(sampleKey)} alt="" />
      </span>
    );
  }
  const Icon = buildingType === "commercial" ? Store : buildingType === "block_of_flats" ? Building2 : buildingType === "duplex" ? Building : Home;
  return (
    <span className={cls}>
      <Icon size={large ? 44 : 30} strokeWidth={1.6} />
    </span>
  );
}

export const BUILDING_LABEL: Record<string, string> = {
  bungalow: "Bungalow",
  duplex: "Duplex",
  block_of_flats: "Block of flats",
  commercial: "Commercial",
  other: "Building",
};
