'use client';

import type { AnimatedIconProps } from './icons/types';
import { resolveStarlightIcon } from './icons/starlight-icon-map';

export interface ItshoverIconProps extends AnimatedIconProps {
  name: string;
}

export default function ItshoverIcon({
  name,
  size = 24,
  color = 'currentColor',
  strokeWidth = 2,
  className = '',
}: ItshoverIconProps) {
  const Icon = resolveStarlightIcon(name);
  if (!Icon) return null;

  return (
    <span className="itshover-icon" aria-hidden="true">
      <Icon size={size} color={color} strokeWidth={strokeWidth} className={className} />
    </span>
  );
}
