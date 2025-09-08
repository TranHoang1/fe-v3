import { cn } from "@/lib/utils";

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

export function TypographyH1({ children, className }: TypographyProps) {
  return (
    <h1 className={cn("text-3xl font-bold tracking-tight text-white", className)}>
      {children}
    </h1>
  );
}

export function TypographyH2({ children, className }: TypographyProps) {
  return (
    <h2 className={cn("text-2xl font-bold tracking-tight text-white", className)}>
      {children}
    </h2>
  );
}

export function TypographyH3({ children, className }: TypographyProps) {
  return (
    <h3 className={cn("text-xl font-bold tracking-tight text-white", className)}>
      {children}
    </h3>
  );
}

export function TypographyH4({ children, className }: TypographyProps) {
  return (
    <h4 className={cn("text-lg font-bold tracking-tight text-white", className)}>
      {children}
    </h4>
  );
}

export function TypographyP({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-base text-gray-400 leading-7", className)}>
      {children}
    </p>
  );
}

export function TypographySmall({ children, className }: TypographyProps) {
  return (
    <small className={cn("text-sm text-gray-400 leading-normal", className)}>
      {children}
    </small>
  );
}

export function TypographyLarge({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-lg text-white leading-7", className)}>
      {children}
    </p>
  );
}

export function TypographyLead({ children, className }: TypographyProps) {
  return (
    <p className={cn("text-xl text-gray-300 leading-7", className)}>
      {children}
    </p>
  );
}

export function TypographyCode({ children, className }: TypographyProps) {
  return (
    <code className={cn("relative rounded bg-[#2d2d2d] px-[0.3rem] py-[0.2rem] font-mono text-sm", className)}>
      {children}
    </code>
  );
}
