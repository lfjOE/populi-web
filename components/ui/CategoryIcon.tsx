"use client";

// components/ui/CategoryIcon.tsx — Mapeo de slugs de categoría a react-icons (Bootstrap)
//
// Cada categoría del backend tiene un slug (pot-hole, street-light, etc.)
// Este componente devuelve el ícono correspondiente de Bootstrap Icons.

import {
  BsExclamationTriangleFill,
  BsLightbulbFill,
  BsDropletFill,
  BsTreeFill,
  BsTrashFill,
  BsFunnelFill,
  BsSignpostFill,
  BsBricks,
  BsStoplightsFill,
  BsQuestionCircleFill,
} from "react-icons/bs";
import type { IconType } from "react-icons";

const ICON_MAP: Record<string, IconType> = {
  "pot-hole": BsExclamationTriangleFill,
  "street-light": BsLightbulbFill,
  "water-leak": BsDropletFill,
  "fallen-tree": BsTreeFill,
  trash: BsTrashFill,
  drain: BsFunnelFill,
  "traffic-sign": BsSignpostFill,
  sidewalk: BsBricks,
  "traffic-light": BsStoplightsFill,
  other: BsQuestionCircleFill,
};

// Colores por categoría para usar en marcadores y pills
export const CATEGORIA_COLORS: Record<string, string> = {
  "pot-hole": "#e65100",
  "street-light": "#f59e0b",
  "water-leak": "#0288d1",
  "fallen-tree": "#2e7d32",
  trash: "#8d6e63",
  drain: "#546e7a",
  "traffic-sign": "#c62828",
  sidewalk: "#795548",
  "traffic-light": "#d32f2f",
  other: "#757575",
};

interface Props {
  slug: string;
  size?: number;
  className?: string;
}

export default function CategoryIcon({ slug, size = 16, className = "" }: Props) {
  const Icon = ICON_MAP[slug] || ICON_MAP.other;
  return <Icon size={size} className={className} />;
}
