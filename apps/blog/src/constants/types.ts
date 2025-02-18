import type React from 'react';

export type IconLinkItem = {
  text?: string;
  /** iconify格式字符串 */
  icon: string;
  href: string;
  props?: Omit<React.HTMLProps<HTMLAnchorElement>, 'href'>;
};
