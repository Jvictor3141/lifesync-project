import { cva } from 'class-variance-authority';

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full border text-sm font-medium transition-all cursor-pointer disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'border-primary/10 bg-primary text-primary-foreground shadow-[0_18px_30px_-18px_rgba(85,105,92,0.95)] hover:bg-primary/90 hover:-translate-y-0.5',
        destructive:
          'border-destructive/20 bg-destructive text-white shadow-[0_18px_30px_-18px_rgba(176,95,84,0.85)] hover:bg-destructive/90 hover:-translate-y-0.5',
        outline:
          'border-border bg-background/75 text-foreground shadow-sm hover:bg-secondary hover:text-secondary-foreground',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost:
          'border-transparent text-foreground hover:bg-accent/70 hover:text-accent-foreground',
        link: 'border-transparent text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-9 px-3.5 text-sm has-[>svg]:px-3',
        lg: 'h-11 px-6 has-[>svg]:px-4',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);
