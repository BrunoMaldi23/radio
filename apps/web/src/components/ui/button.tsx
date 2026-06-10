import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-amber-700 to-amber-500 text-white shadow-sm shadow-amber-800/20 hover:from-amber-500 hover:to-amber-500',
        secondary: 'bg-[#020617] text-white hover:bg-[#0f172a]',
        outline: 'border border-slate-900/10 bg-white/85 text-[#0f172a] shadow-sm hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800',
        ghost: 'text-[#0f172a] hover:bg-amber-50'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
