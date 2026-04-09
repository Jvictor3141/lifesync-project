import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-semibold transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'border-indigo-500/20 bg-primary text-primary-foreground shadow-[0_1px_4px_rgba(99,102,241,0.25)] hover:bg-primary/90 hover:shadow-[0_2px_10px_rgba(99,102,241,0.35)] active:scale-[0.98]',
        destructive:
          'border-red-500/20 bg-destructive text-white shadow-[0_1px_4px_rgba(220,38,38,0.25)] hover:bg-destructive/90 hover:shadow-[0_2px_10px_rgba(220,38,38,0.3)] active:scale-[0.98]',
        outline:
          'border-border bg-transparent text-foreground hover:bg-secondary hover:text-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'border-transparent text-foreground hover:bg-secondary hover:text-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 px-3 text-xs has-[>svg]:px-2.5',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
