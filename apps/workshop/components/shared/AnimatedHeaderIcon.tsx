'use client';

import { useRef, useEffect, useCallback } from 'react';
import gsap from 'gsap';
import { interpolate } from 'flubber';
import { HEADER_ICON_PATHS, type HeaderIconVariant } from '@nrn/shared';
import { cn } from '@/lib/utils';

interface AnimatedHeaderIconProps {
  variant: HeaderIconVariant;
  size?: number;
  className?: string;
}

const SVG_PROPS = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

function morphPath(
  pathEl: SVGPathElement,
  from: string,
  to: string,
  duration: number,
  onComplete?: () => void
): gsap.core.Tween {
  let interpolator: ((t: number) => string) | null = null;
  try {
    interpolator = interpolate(from, to);
  } catch {
    pathEl.setAttribute('d', to);
    onComplete?.();
    return gsap.delayedCall(0, onComplete ?? (() => undefined));
  }

  const state = { progress: 0 };
  return gsap.to(state, {
    progress: 1,
    duration,
    ease: 'power2.inOut',
    onUpdate: () => pathEl.setAttribute('d', interpolator!(state.progress)),
    onComplete,
  });
}

export function AnimatedHeaderIcon({ variant, size = 16, className }: AnimatedHeaderIconProps) {
  const hitRef = useRef<HTMLSpanElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const bellDomeRef = useRef<SVGGElement>(null);
  const clapperRef = useRef<SVGGElement>(null);
  const moonRef = useRef<SVGGElement>(null);
  const starRefs = useRef<(SVGPathElement | null)[]>([]);
  const raysGroupRef = useRef<SVGGElement>(null);
  const raysPathRef = useRef<SVGPathElement>(null);
  const arrowGroupRef = useRef<SVGGElement>(null);
  const tweenRef = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null);

  const killTween = useCallback(() => {
    tweenRef.current?.kill();
    tweenRef.current = null;
  }, []);

  const handleEnter = useCallback(() => {
    killTween();

    if (variant === 'globe' && svgRef.current) {
      gsap.set(svgRef.current, { transformOrigin: '50% 50%', rotation: 0, scale: 1 });
      tweenRef.current = gsap
        .timeline()
        .to(svgRef.current, { rotation: 360, scale: 1.1, duration: 0.7, ease: 'power2.inOut', force3D: true })
        .to(svgRef.current, { scale: 1, duration: 0.15, ease: 'power2.out' });
      return;
    }

    if (variant === 'bell' && bellDomeRef.current && clapperRef.current) {
      const dome = bellDomeRef.current;
      const clapper = clapperRef.current;
      gsap.set(dome, { transformOrigin: '50% 0%', rotation: 0 });
      gsap.set(clapper, { x: 0 });
      tweenRef.current = gsap
        .timeline()
        // Dome: damped ring from top mount — power2 per arc, ~60% decay
        .to(dome, { rotation: -20, duration: 0.14, ease: 'power2.out' }, 0)
        .to(dome, { rotation: 17, duration: 0.15, ease: 'power2.inOut' }, 0.14)
        .to(dome, { rotation: -11, duration: 0.13, ease: 'power2.inOut' }, 0.29)
        .to(dome, { rotation: 7, duration: 0.12, ease: 'power2.inOut' }, 0.42)
        .to(dome, { rotation: -3, duration: 0.10, ease: 'power2.inOut' }, 0.54)
        .to(dome, { rotation: 0, duration: 0.12, ease: 'power2.out' }, 0.64)
        // Clapper: 40ms lag, translates opposite to dome (free pendulum inside moving bell)
        .to(clapper, { x: 3.5, duration: 0.15, ease: 'power1.out' }, 0.04)
        .to(clapper, { x: -2.8, duration: 0.15, ease: 'power1.inOut' }, 0.19)
        .to(clapper, { x: 1.8, duration: 0.13, ease: 'power1.inOut' }, 0.34)
        .to(clapper, { x: -1, duration: 0.12, ease: 'power1.inOut' }, 0.47)
        .to(clapper, { x: 0.4, duration: 0.10, ease: 'power1.inOut' }, 0.59)
        .to(clapper, { x: 0, duration: 0.12, ease: 'power1.out' }, 0.69);
      return;
    }

    if (variant === 'moon' && moonRef.current) {
      const stars = starRefs.current.filter(Boolean) as SVGPathElement[];
      gsap.set(moonRef.current, { transformOrigin: '12px 12px', scale: 1 });
      gsap.set(stars, { opacity: 0, scale: 0, transformOrigin: '50% 50%' });
      tweenRef.current = gsap
        .timeline()
        .to(moonRef.current, { scale: 1.08, duration: 0.4, ease: 'power2.out' }, 0)
        .to(
          stars,
          {
            opacity: 1,
            scale: 1,
            duration: 0.35,
            stagger: 0.07,
            ease: 'back.out(3)',
          },
          0.04
        );
      return;
    }

    if (variant === 'sun' && raysGroupRef.current && svgRef.current) {
      gsap.set(raysGroupRef.current, { transformOrigin: '50% 50%', rotation: 0 });
      gsap.set(svgRef.current, { transformOrigin: '50% 50%', scale: 1 });
      tweenRef.current = gsap
        .timeline()
        .to(raysGroupRef.current, { rotation: 45, duration: 0.55, ease: 'power2.out' }, 0)
        .to(svgRef.current, { scale: 1.15, duration: 0.3, ease: 'power2.out' }, 0)
        .to(svgRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' }, 0.3);
      return;
    }

    if (variant === 'logout' && arrowGroupRef.current) {
      const arrow = arrowGroupRef.current;
      gsap.set(arrow, { x: 0, opacity: 1 });
      const tl = gsap.timeline();
      tl.to(arrow, { x: 14, opacity: 0, duration: 0.3, ease: 'power2.in' }); // arrow exits right
      tl.to({}, { duration: 0.15 }); // hold off-screen
      tl.set(arrow, { x: -10 }); // wrap to left of door
      tl.to(arrow, { x: 0, opacity: 1, duration: 0.35, ease: 'back.out(2)' }); // re-enter
      tweenRef.current = tl;
    }
  }, [variant, killTween]);

  const handleLeave = useCallback(() => {
    killTween();

    if (variant === 'globe' && svgRef.current) {
      gsap.set(svgRef.current, { rotation: 0, scale: 1 });
      return;
    }

    if (variant === 'bell') {
      if (bellDomeRef.current) gsap.set(bellDomeRef.current, { rotation: 0 });
      if (clapperRef.current) gsap.set(clapperRef.current, { x: 0 });
      return;
    }

    if (variant === 'moon') {
      if (moonRef.current) gsap.set(moonRef.current, { scale: 1 });
      const stars = starRefs.current.filter(Boolean) as SVGPathElement[];
      gsap.set(stars, { opacity: 0, scale: 0 });
      return;
    }

    if (variant === 'sun') {
      if (raysGroupRef.current) gsap.set(raysGroupRef.current, { rotation: 0 });
      if (svgRef.current) gsap.set(svgRef.current, { scale: 1 });
      return;
    }

    if (variant === 'logout' && arrowGroupRef.current) {
      gsap.set(arrowGroupRef.current, { x: 0, opacity: 1 });
    }
  }, [variant, killTween]);

  useEffect(() => () => killTween(), [killTween]);

  return (
    <span
      ref={hitRef}
      className="inline-flex h-full w-full items-center justify-center"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <svg
        ref={svgRef}
        width={size}
        height={size}
        className={cn('shrink-0 pointer-events-none', className)}
        aria-hidden
        {...SVG_PROPS}
      >
        {variant === 'globe' && <path d={HEADER_ICON_PATHS.globe.body} />}

        {variant === 'bell' && (
          <>
            <g ref={bellDomeRef} className="bell-dome">
              <path d={HEADER_ICON_PATHS.bell.dome} />
            </g>
            <g ref={clapperRef} className="bell-clapper">
              <path d={HEADER_ICON_PATHS.bell.clapper} />
            </g>
          </>
        )}

        {variant === 'moon' && (
          <>
            <g ref={moonRef}>
              <path d={HEADER_ICON_PATHS.moon.crescent} />
            </g>
            {HEADER_ICON_PATHS.moon.stars.map((star, i) => (
              <path
                key={i}
                ref={(el) => {
                  starRefs.current[i] = el;
                }}
                d={star}
                fill="currentColor"
                stroke="none"
                className="star-path"
              />
            ))}
          </>
        )}

        {variant === 'sun' && (
          <>
            <path d={HEADER_ICON_PATHS.sun.center} />
            <g ref={raysGroupRef} className="sun-rays-group">
              <path ref={raysPathRef} className="sun-rays" d={HEADER_ICON_PATHS.sun.rays} />
            </g>
          </>
        )}

        {variant === 'logout' && (
          <>
            <path d={HEADER_ICON_PATHS.logout.door} />
            <g ref={arrowGroupRef} className="logout-arrow">
              <path d={HEADER_ICON_PATHS.logout.chevron} />
              <path d={HEADER_ICON_PATHS.logout.shaft} />
            </g>
          </>
        )}
      </svg>
    </span>
  );
}
