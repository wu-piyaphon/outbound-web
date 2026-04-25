"use client";

import {
  LineChart,
  Menu,
  Moon,
  Sun,
  Languages,
  LogOut,
  User as UserGlyph,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";
import { useSyncExternalStore } from "react";

/**
 * Icon registry. Add a new entry here to expose a Lucide icon to
 * Server Components. Keep the keys kebab-cased and stable.
 */
const ICONS = {
  "line-chart": LineChart,
  menu: Menu,
  moon: Moon,
  sun: Sun,
  languages: Languages,
  "log-out": LogOut,
  user: UserGlyph,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

const subscribe = () => () => {};
const getServerSnapshot = () => false;
const getClientSnapshot = () => true;

/**
 * Renders a Lucide icon only after client hydration.
 *
 * Lucide icons can surface server/client SVG attribute differences under
 * React 19 streaming, which manifests as a hydration mismatch on the parent
 * (often a Radix `asChild` trigger button). Deferring the icon to a
 * client-only mount keeps the parent's hydration tree stable while still
 * reserving space so the layout doesn't shift.
 *
 * Use this from Server Components — the registry indirection avoids passing
 * non-plain Lucide component references across the server→client boundary.
 */
export function Icon({ name, className, ...props }: IconProps) {
  const mounted = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot,
  );

  if (!mounted) {
    return <span className={className} aria-hidden />;
  }

  const IconComponent = ICONS[name];
  return <IconComponent className={className} aria-hidden {...props} />;
}
