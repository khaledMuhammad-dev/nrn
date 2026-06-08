'use client';

import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface HeaderIconButtonProps {
  onClick?: () => void;
  title?: string;
  className?: string;
  children: ReactNode;
}

export function HeaderIconButton({ onClick, title, className, children }: HeaderIconButtonProps) {
  return (
    <Button variant="ghost" size="icon" onClick={onClick} title={title} className={className}>
      <span className="inline-flex h-full w-full items-center justify-center">{children}</span>
    </Button>
  );
}
