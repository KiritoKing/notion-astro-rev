import { getPermalink, getBlogPermalink } from '~/utils/permalinks';
import type { LinkType } from './types';

export const routes: LinkType[] = [
  {
    label: 'Home',
    url: getPermalink('/'),
  },
  {
    label: 'Archive',
    url: getBlogPermalink(),
    icon: 'tabler:book',
  },
];
