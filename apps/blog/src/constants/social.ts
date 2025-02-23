import type { LinkType } from './types';

export const socialLinks: LinkType[] = [
  {
    label: 'Github',
    url: 'https://github.com/KiritoKing',
    icon: 'tabler:brand-github',
    props: {
      target: '_blank',
    },
  },
  {
    label: 'Email',
    url: 'mailto:kiritoclzh@gmail.com',
    icon: 'tabler:mail',
    props: {
      target: '_blank',
    },
  },
  {
    label: 'RSS',
    url: '/rss.xml',
    icon: 'tabler:rss',
    props: {
      target: '_blank',
    },
  },
];
