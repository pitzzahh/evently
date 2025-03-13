import { tv } from 'tailwind-variants';

export const calendarVariants = tv({
  base: 'bg-background rounded-md text-foreground border border-border overflow-hidden box-sizing-border-box h-full flex flex-col items-stretch',
  variants: {
    size: {
      default: 'w-full',
      compact: 'max-w-md'
    },
    view: {
      month: '',
      week: '',
      day: '',
      agenda: ''
    }
  },
  defaultVariants: {
    size: 'default',
    view: 'month'
  }
});

export const calendarToolbarVariants = tv({
  base: 'flex flex-wrap justify-between items-center text-base p-1 border-b border-border mb-0',
  variants: {
    position: {
      top: '',
      bottom: 'border-t border-b-0'
    }
  },
  defaultVariants: {
    position: 'top'
  }
});

export const calendarButtonVariants = tv({
  base: 'bg-transparent border-none h-10 px-4 rounded-md cursor-pointer transition-none mt-1 mb-1 shadow-none text-foreground',
  variants: {
    state: {
      default: 'hover:bg-accent hover:text-accent-foreground',
      active: 'bg-accent text-accent-foreground'
    }
  },
  defaultVariants: {
    state: 'default'
  }
});

export const calendarEventVariants = tv({
  base: 'bg-primary text-primary-foreground p-[5px] rounded-md cursor-pointer overflow-hidden whitespace-nowrap text-ellipsis',
  variants: {
    state: {
      default: 'hover:bg-ring',
      selected: 'bg-primary/90'
    }
  },
  defaultVariants: {
    state: 'default'
  }
});
