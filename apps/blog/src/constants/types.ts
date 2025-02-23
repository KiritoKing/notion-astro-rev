import type React from 'react';

export type LinkType = {
  label: string;
  url: string;
  /** iconify格式字符串 */
  icon?: string;
  props?: Omit<React.HTMLProps<HTMLAnchorElement>, 'href'>;
};
