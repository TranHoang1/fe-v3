'use client';

import { ReactNode } from 'react';

interface DetailFieldProps {
  label: string;
  value?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export function DetailField({ label, value, prefix, suffix }: DetailFieldProps) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}:</span>
      <span>
        {prefix && <span className="text-gray-500">{prefix}</span>}
        {value === undefined || value === null ? <span className="text-gray-500">-</span> : value}
        {suffix && <span className="text-gray-500">{suffix}</span>}
      </span>
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function DetailSection({ title, children, className = '' }: DetailSectionProps) {
  return (
    <div className={`bg-[#2d2d2d] p-4 rounded-md ${className}`}>
      <h3 className="text-md font-semibold mb-2 text-[#007acc]">{title}</h3>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface DetailViewProps {
  children: ReactNode;
  className?: string;
}

export default function DetailView({ children, className = '' }: DetailViewProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      {children}
    </div>
  );
}
