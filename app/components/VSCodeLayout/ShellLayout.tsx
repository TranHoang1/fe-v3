'use client';

import { ReactNode } from 'react';

interface ShellLayoutProps {
  children: ReactNode;
}

export default function ShellLayout({ children }: ShellLayoutProps) {
  // Return only the content area since the main sidebar is already in the root layout
  return (
    <div className="h-full overflow-auto">
      {children}
    </div>
  );
}
