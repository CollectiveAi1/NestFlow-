export const pageTransition = {
  initial: { opacity: 0, y: 10, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 }
};
