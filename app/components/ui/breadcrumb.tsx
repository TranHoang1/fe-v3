'use client';

import * as React from 'react';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export function Breadcrumb({ className, children, ...props }: BreadcrumbProps) {
  return (
    <nav 
      className={cn('flex items-center text-sm text-gray-400', className)} 
      aria-label="Breadcrumb"
      {...props}
    >
      <ol className="flex items-center space-x-2">
        {children}
      </ol>
    </nav>
  );
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  children?: React.ReactNode;
  isCurrentPage?: boolean;
}

export function BreadcrumbItem({ 
  className, 
  children, 
  isCurrentPage,
  ...props 
}: BreadcrumbItemProps) {
  return (
    <li className={cn('flex items-center', className)} {...props}>
      {children}
      {!isCurrentPage && <ChevronRight className="h-4 w-4 mx-2 text-gray-500" />}
    </li>
  );
}

export interface BreadcrumbLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  children?: React.ReactNode;
  href?: string;
  asChild?: boolean;
}

export function BreadcrumbLink({ 
  className, 
  children, 
  href,
  ...props 
}: BreadcrumbLinkProps) {
  if (!href) {
    return (
      <span className={cn('text-white font-medium', className)} {...props}>
        {children}
      </span>
    );
  }
  
  return (
    <Link 
      href={href} 
      className={cn('hover:text-white transition-colors', className)}
      {...props}
    >
      {children}
    </Link>
  );
}
