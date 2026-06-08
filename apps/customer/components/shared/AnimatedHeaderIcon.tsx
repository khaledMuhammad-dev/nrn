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
      gsap.set(dome, { transformOrigin: '12px 3px', rotation: 0 });
      gsap.set(clapper, { transformOrigin: '12px 20px', rotation: 0 });
      tweenRef.current = gsap
        .timeline()
        .to(dome, { rotation: -16, duration: 0.1, ease: 'sine.inOut' }, 0)
        .to(clapper, { rotation: 24, duration: 0.11, ease: 'sine.inOut' }, 0.03)
        .to(dome, { rotation: 16, duration: 0.11, ease: 'sine.inOut' }, 0.1)
        .to(clapper, { rotation: -22, duration: 0.11, ease: 'sine.inOut' }, 0.12)
        .to(dome, { rotation: -10, duration: 0.09, ease: 'sine.inOut' }, 0.2)
        .to(clapper, { rotation: 14, duration: 0.09, ease: 'sine.inOut' }, 0.21)
        .to(dome, { rotation: 8, duration: 0.08, ease: 'sine.inOut' }, 0.28)
        .to(clapper, { rotation: -10, duration: 0.08, ease: 'sine.inOut' }, 0.29)
        .to(dome, { rotation: 0, duration: 0.1, ease: 'sine.out' }, 0.36)
        .to(clapper, { rotation: 0, duration: 0.1, ease: 'sine.out' }, 0.36);
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
      tweenRef.current = gsap
        .timeline()
        .to(arrow, { x: -12, opacity: 0.1, duration: 0.3, ease: 'power2.in' })
        .to({}, { duration: 0.12 })
        .to(arrow, { x: 0, opacity: 1, duration: 0.35, ease: 'back.out(2.5)' });
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
      if (clapperRef.current) gsap.set(clapperRef.current, { rotation: 0 });
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
