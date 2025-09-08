import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative w-full rounded-md border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-[#2d2d2d] border-[#3c3c3c] text-white",
        destructive: "border-red-500/50 bg-red-500/10 text-red-400 [&>svg]:text-red-400",
        success: "border-green-500/50 bg-green-500/10 text-green-400 [&>svg]:text-green-400",
        warning: "border-yellow-500/50 bg-yellow-500/10 text-yellow-400 [&>svg]:text-yellow-400",
        info: "border-[#007acc]/50 bg-[#007acc]/10 text-[#007acc] [&>svg]:text-[#007acc]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

function Alert({ className, variant, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

interface AlertTitleProps extends React.HTMLAttributes<HTMLParagraphElement> {}

function AlertTitle({ className, ...props }: AlertTitleProps) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

function AlertDescription({ className, ...props }: AlertDescriptionProps) {
  return (
    <div
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

export { Alert, AlertTitle, AlertDescription };
