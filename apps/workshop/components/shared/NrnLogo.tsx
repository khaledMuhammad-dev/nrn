'use client';

import { motion } from 'framer-motion';

interface NrnLogoProps {
  size?:       number;
  className?:  string;
  splashMode?: boolean;
  fill?:       string;
}

// Container — slight scale-up on hover; shrinks in from a smaller size on splash entrance
const containerVariants = {
  rest:    { scale: 1, opacity: 1 },
  hover:   { scale: 1.08, transition: { type: 'spring' as const, stiffness: 300, damping: 18 } },
  hidden:  { scale: 0.72, opacity: 0 },
  visible: { scale: 1,    opacity: 1, transition: { duration: 0.38, ease: 'easeOut' } },
};

// Vertical bar — draws downward from top on entry; lifts slightly on hover
const verticalBarVariants = {
  rest:    { y: 0, scaleY: 1 },
  hover:   { y: -3, scaleY: 1.06, transition: { type: 'spring' as const, stiffness: 420, damping: 14 } },
  hidden:  { y: -12, scaleY: 0.35, opacity: 0 },
  visible: { y: 0,   scaleY: 1,    opacity: 1, transition: { type: 'spring' as const, stiffness: 260, damping: 20, delay: 0.25 } },
};

// Diagonal arm (top-right swoop) — swoops in from upper-right on entry
const diagonalArmVariants = {
  rest:    { x: 0, rotate: 0 },
  hover:   { x: 2, rotate: 4, transition: { type: 'spring' as const, stiffness: 360, damping: 14 } },
  hidden:  { x: 24, y: -18, rotate: -20, opacity: 0 },
  visible: { x: 0,  y: 0,   rotate: 0,   opacity: 1, transition: { type: 'spring' as const, stiffness: 220, damping: 16, delay: 0.55 } },
};

// Bottom rail — rises up from below on entry
const bottomRailVariants = {
  rest:    { y: 0 },
  hover:   { y: 2.5, transition: { type: 'spring' as const, stiffness: 360, damping: 16 } },
  hidden:  { y: 16, opacity: 0 },
  visible: { y: 0,  opacity: 1, transition: { type: 'spring' as const, stiffness: 240, damping: 20, delay: 0.70 } },
};

// Left S-curve — sweeps in from the left on entry
const leftCurveVariants = {
  rest:    { x: 0 },
  hover:   { x: -2.5, transition: { type: 'spring' as const, stiffness: 360, damping: 14 } },
  hidden:  { x: -26, opacity: 0 },
  visible: { x: 0,   opacity: 1, transition: { type: 'spring' as const, stiffness: 200, damping: 18, delay: 0.42 } },
};

// Small square accent — pops in with a quarter-turn spin as the anchor point
const squareVariants = {
  rest:    { scale: 1 },
  hover:   { scale: 1.25, transition: { type: 'spring' as const, stiffness: 450, damping: 12 } },
  hidden:  { scale: 0, rotate: 45, opacity: 0 },
  visible: { scale: 1, rotate: 0,  opacity: 1, transition: { type: 'spring' as const, stiffness: 400, damping: 14, delay: 0.08 } },
};

export function NrnLogo({ size = 40, className, splashMode = false, fill }: NrnLogoProps) {
  const height    = size;
  const width     = Math.round(size * (67 / 60));
  const pathFill  = fill ?? 'var(--brand-primary)';

  const containerProps = splashMode
    ? { initial: 'hidden' as const, animate: 'visible' as const }
    : { initial: 'rest' as const, whileHover: 'hover' as const };

  return (
    <motion.div
      {...containerProps}
      variants={containerVariants}
      className={className}
      style={{ display: 'inline-flex', transformOrigin: 'center' }}
    >
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={width}
        height={height}
        viewBox="0 0 67 60"
        fill="none"
      >
        {/* Vertical bar */}
        <motion.path
          variants={verticalBarVariants}
          style={{ transformOrigin: '34.84px 22.69px' }}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M31.2338 38.1523V7.22949H38.4538V38.1523H31.2338Z"
          fill={pathFill}
        />

        {/* Diagonal arm (top-right) */}
        <motion.path
          variants={diagonalArmVariants}
          style={{ transformOrigin: '54px 19px' }}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M50.2576 19.6986C49.038 20.7304 48.994 22.5968 50.1625 23.6866L60.0652 32.9191L55.1405 38.2009L45.2379 28.9683C40.9068 24.9317 41.0714 18.02 45.588 14.192L62.3327 0L67 5.50894L50.2553 19.7009L50.2576 19.6986Z"
          fill={pathFill}
        />

        {/* Bottom rail */}
        <motion.path
          variants={bottomRailVariants}
          style={{ transformOrigin: '39px 51px' }}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M37.2131 45.1147C39.3624 42.9654 42.2769 41.7598 45.3142 41.7598H62.3117V48.9798H45.3142C44.1897 48.9798 43.1116 49.4273 42.3186 50.2203L36.0863 56.4526C33.937 58.6019 31.0225 59.8099 27.9829 59.8099H16.3228V52.5898H27.9829C29.1074 52.5898 30.1855 52.1424 30.9808 51.3494L37.2131 45.1171V45.1147Z"
          fill={pathFill}
        />

        {/* Left curve / S-shape */}
        <motion.path
          variants={leftCurveVariants}
          style={{ transformOrigin: '14px 28px' }}
          fillRule="evenodd"
          clipRule="evenodd"
          d="M17.7626 14.4471H3.60771V7.22705H17.7626C28.5695 7.22705 31.5442 22.0822 21.5697 26.2417L10.7373 30.7606C8.60656 31.6486 7.22005 33.7307 7.22005 36.04C7.22005 39.1979 9.77976 41.7599 12.94 41.7599H27.6258V48.98H12.94C5.79412 48.98 0 43.1859 0 36.04C0 30.8186 3.13935 26.1072 7.95967 24.097L18.7921 19.5781C21.4839 18.4559 20.6817 14.4471 17.7649 14.4471H17.7626Z"
          fill={pathFill}
        />

        {/* Small square accent */}
        <motion.path
          variants={squareVariants}
          style={{ transformOrigin: '20.56px 34.7px' }}
          d="M17.1066 31.2432H24.0137V38.1502H17.1066V31.2432Z"
          fill={pathFill}
        />
      </motion.svg>
    </motion.div>
  );
}
