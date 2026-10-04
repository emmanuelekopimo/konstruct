export const ZONES = [
  "South West",
  "South South",
  "South East",
  "North Central",
  "North West",
] as const;
export type Zone = (typeof ZONES)[number];

export type City = { city: string; state: string; zone: Zone };

/** Cities with listed vendors. Projects anywhere else fall back by state, then zone. */
export const CITIES: City[] = [
  { city: "Lagos", state: "Lagos", zone: "South West" },
  { city: "Ikorodu", state: "Lagos", zone: "South West" },
  { city: "Ibadan", state: "Oyo", zone: "South West" },
  { city: "Abuja", state: "FCT", zone: "North Central" },
  { city: "Port Harcourt", state: "Rivers", zone: "South South" },
  { city: "Benin City", state: "Edo", zone: "South South" },
  { city: "Enugu", state: "Enugu", zone: "South East" },
  { city: "Kano", state: "Kano", zone: "North West" },
];

export const CITY_NAMES = CITIES.map((c) => c.city);

export function findCity(name: string): City | undefined {
  const n = name.trim().toLowerCase();
  return CITIES.find((c) => c.city.toLowerCase() === n);
}
