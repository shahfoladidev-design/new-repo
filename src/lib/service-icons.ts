import {
  Users,
  Map,
  Car,
  Package,
  Headset,
  UserRound,
  HeartHandshake,
  Compass,
  ClipboardList,
  LifeBuoy,
  Backpack,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  users: Users,
  map: Map,
  car: Car,
  package: Package,
  headset: Headset,
  "user-round": UserRound,
  "heart-handshake": HeartHandshake,
  compass: Compass,
  "clipboard-list": ClipboardList,
  lifebuoy: LifeBuoy,
  backpack: Backpack,
};

const SLUG_DEFAULTS: Record<string, string> = {
  "group-private-tours": "users",
  "custom-travel-planning": "map",
  "transport-local-guides": "car",
  "package-tours": "package",
  "travel-support": "headset",
  "female-guide-tours": "user-round",
  "family-packages": "heart-handshake",
};

export const SERVICE_ICON_OPTIONS = [
  { value: "users", label: "Users (Group & Private)" },
  { value: "map", label: "Map (Custom Planning)" },
  { value: "car", label: "Car (Transport)" },
  { value: "package", label: "Package (Tours)" },
  { value: "headset", label: "Headset (Support)" },
  { value: "user-round", label: "Person (Female Guide)" },
  { value: "heart-handshake", label: "Handshake (Family)" },
  { value: "compass", label: "Compass" },
  { value: "clipboard-list", label: "Clipboard" },
  { value: "lifebuoy", label: "Lifebuoy" },
  { value: "backpack", label: "Backpack" },
] as const;

export function resolveServiceIconKey(iconKey?: string | null, slug?: string | null) {
  const key = (iconKey || (slug ? SLUG_DEFAULTS[slug] : null) || "compass").toLowerCase();
  return ICON_MAP[key] ? key : "compass";
}

export function getServiceIcon(iconKey?: string | null, slug?: string | null): LucideIcon {
  return ICON_MAP[resolveServiceIconKey(iconKey, slug)] ?? Compass;
}
