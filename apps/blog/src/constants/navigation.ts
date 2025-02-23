import { getPermalink, getBlogPermalink } from '~/utils/permalinks';
import type { LinkType } from './types';

export const routes: LinkType[] = [
  {
    label: 'Home',
    url: getPermalink('/'),
    icon: 'tabler:home',
  },
  {
    label: 'Blog',
    url: getBlogPermalink(),
    icon: 'tabler:book',
  },
];
