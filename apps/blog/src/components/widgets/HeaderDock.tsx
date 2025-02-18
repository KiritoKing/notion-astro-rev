'use client';

import { buttonVariants } from '~/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';
import { cn } from '~/lib/utils';
import { Dock, DockIcon } from '~/components/ui/dock';

import { Icon } from '@iconify/react';
import type { IconLinkItem } from '../../constants/types';

type DockItem = IconLinkItem;

export type Props = {
  groups: DockItem[][];
};

export function HeaderDock({ groups }: Props) {
  return (
    <div className="sticky top-0 flex flex-col items-center justify-center">
      <TooltipProvider>
        <Dock direction="middle" className="mt-0">
          {groups.map((group) =>
            group.map((item) => (
              <DockIcon key={item.text}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <a
                      href={item.href}
                      aria-label={item.text}
                      className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-12 rounded-full')}
                      {...item.props}
                    >
                      <Icon icon={item.icon!} className="size-4" />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.text}</p>
                  </TooltipContent>
                </Tooltip>
              </DockIcon>
            ))
          )}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
