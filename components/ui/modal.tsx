'use client';

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function Modal({ isOpen, onCloseAction, children, title, className }: ModalProps) {
  // No need for a local state here which could cause issues
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCloseAction();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCloseAction]);

  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div 
        className={cn(
          "relative w-full max-w-md max-h-[90vh] overflow-auto bg-[#1e1e1e] border border-[#3c3c3c] rounded-md shadow-lg",
          className
        )}
      >
        {title && (
          <div className="flex justify-between items-center border-b border-[#3c3c3c] p-4">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button
              onClick={onCloseAction}
              className="p-1 rounded-full hover:bg-[#3c3c3c] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className={cn(!title && "pt-4")}>
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4 border-b border-[#3c3c3c]", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-6 py-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function ModalFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex justify-end space-x-2 px-6 py-4 border-t border-[#3c3c3c]", className)}
      {...props}
    >
      {children}
    </div>
  );
}
