import type { IconLinkItem } from './types';

export const socialLinks: IconLinkItem[] = [
  {
    text: 'Github',
    href: 'https://github.com/KiritoKing',
    icon: 'tabler:brand-github',
    props: {
      target: '_blank',
    },
  },
  {
    text: 'Email',
    href: 'mailto:kiritoclzh@gmail.com',
    icon: 'tabler:mail',
    props: {
      target: '_blank',
    },
  },
  {
    text: 'RSS',
    href: '/rss.xml',
    icon: 'tabler:rss',
    props: {
      target: '_blank',
    },
  },
];
