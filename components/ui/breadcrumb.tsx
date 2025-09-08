import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface BreadcrumbProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
}

const Breadcrumb = React.forwardRef<
  HTMLElement,
  BreadcrumbProps
>(({ className, children, ...props }, ref) => {
  return (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn(
        "inline-flex items-center space-x-1 text-sm text-gray-400",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
});

Breadcrumb.displayName = "Breadcrumb";

interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
}

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrentPage, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center", className)}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
      />
    );
  }
);

BreadcrumbItem.displayName = "BreadcrumbItem";

interface BreadcrumbLinkProps {
  children: React.ReactNode;
  href?: string;
  className?: string;
  asChild?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ href, children, className, asChild, ...props }, ref) => {
    return (
      <div className="inline-flex items-center">
        {typeof href === "undefined" ? (
          <span className={cn("font-medium text-white", className)}>
            {children}
          </span>
        ) : (
          <Link 
            href={href} 
            className={cn("hover:text-white transition-colors", className)}
            {...props}
            ref={ref}
          >
            {children}
          </Link>
        )}
        <ChevronRight className="mx-1 h-4 w-4" />
      </div>
    );
  }
);

BreadcrumbLink.displayName = "BreadcrumbLink";

export { Breadcrumb, BreadcrumbItem, BreadcrumbLink };
