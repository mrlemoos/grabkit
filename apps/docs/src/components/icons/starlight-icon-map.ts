import type { ComponentType } from 'react';
import type { AnimatedIconProps } from './types';
import ArrowNarrowRightIcon from './arrow-narrow-right-icon';
import BookIcon from './book-icon';
import ExternalLinkIcon from './external-link-icon';
import FileDescriptionIcon from './file-description-icon';
import GearIcon from './gear-icon';
import GithubIcon from './github-icon';

export type StarlightIconName =
  | 'github'
  | 'external'
  | 'right-arrow'
  | 'document'
  | 'setting'
  | 'open-book';

const iconMap: Record<StarlightIconName, ComponentType<AnimatedIconProps>> = {
  github: GithubIcon,
  external: ExternalLinkIcon,
  'right-arrow': ArrowNarrowRightIcon,
  document: FileDescriptionIcon,
  setting: GearIcon,
  'open-book': BookIcon,
};

export function resolveStarlightIcon(name: string): ComponentType<AnimatedIconProps> | undefined {
  return iconMap[name as StarlightIconName];
}
