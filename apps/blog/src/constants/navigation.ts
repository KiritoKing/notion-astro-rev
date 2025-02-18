import { getPermalink, getBlogPermalink } from '~/utils/permalinks';
import type { IconLinkItem } from './types';

export const routes: IconLinkItem[] = [
  {
    text: 'Home',
    href: getPermalink('/'),
    icon: 'tabler:home',
  },
  {
    text: 'Blog',
    href: getBlogPermalink(),
    icon: 'tabler:book',
  },
];
