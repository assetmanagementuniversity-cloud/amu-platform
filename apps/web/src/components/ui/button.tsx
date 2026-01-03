'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// AMU Brand Button Variants (Sections 9.2 & 9.3)
// All buttons use Montserrat (font-heading) as per Section 9.3
const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md font-heading text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary: AMU Navy (#0A2F5C) with subtle hover effect (#153e70)
        default:
          'bg-amu-navy text-white hover:bg-[#153e70] focus-visible:ring-amu-navy',
        primary:
          'bg-amu-navy text-white hover:bg-[#153e70] focus-visible:ring-amu-navy',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
        // Outline: Slate Blue border (#5D7290) as per Section 9.2
        outline:
          'border border-amu-slate bg-white text-amu-charcoal hover:bg-amu-sky/30 hover:border-amu-navy focus-visible:ring-amu-navy',
        // Secondary: Slate Blue border (#5D7290) accent as per Section 9.2
        secondary:
          'border border-amu-slate bg-amu-sky text-amu-navy hover:bg-amu-sky/80 hover:border-amu-navy focus-visible:ring-amu-navy',
        ghost:
          'text-amu-charcoal hover:bg-amu-sky/50 hover:text-amu-navy focus-visible:ring-amu-navy',
        link: 'text-amu-navy underline-offset-4 hover:underline focus-visible:ring-amu-navy',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, disabled, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
