import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EASE_OUT_EXPO = [0.22, 1, 0.36, 1];

const PAGE_VARIANTS = {
  initial: { opacity: 0, y: 18, scale: 0.995 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT_EXPO }
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.995,
    transition: { duration: 0.3, ease: EASE_OUT_EXPO }
  }
};

const REVEAL_VARIANTS = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE_OUT_EXPO }
  }
};

const STAGGER_CHILD_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE_OUT_EXPO }
  }
};

export const PageTransition = ({ children, className = '' }) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={PAGE_VARIANTS}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
};

export const FadeInSection = ({
  children,
  className = '',
  delay = 0,
  once = true,
  amount = 0.2
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={REVEAL_VARIANTS}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
};

export const StaggerEntrance = ({
  children,
  className = '',
  itemClassName = '',
  stagger = 0.07,
  delayChildren = 0.03,
  inView = false,
  once = true,
  amount = 0.12
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const items = React.Children.toArray(children).filter(Boolean);
  const triggerProps = inView
    ? {
        initial: 'hidden',
        whileInView: 'visible',
        viewport: { once, amount }
      }
    : {
        initial: 'hidden',
        animate: 'visible'
      };

  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren
          }
        }
      }}
      {...triggerProps}
    >
      {items.map((child, index) => (
        <motion.div
          key={child.key || `stagger-child-${index}`}
          className={itemClassName}
          variants={STAGGER_CHILD_VARIANTS}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
