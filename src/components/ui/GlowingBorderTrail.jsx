// components/animations/GlowingBorderTrail.jsx
import React, { useEffect, useRef } from 'react';

const TRAIL_TIMELINE_KEY = '__ledgerly_border_trail_timeline__';
const TRAIL_TIMELINE_STORAGE_KEY = '__ledgerly_border_trail_timeline_session__';

const GlowingBorderTrail = ({ isActive = true, duration = 22000, pauseDuration = 0, isDarkMode = false }) => {
  const trailRef = useRef(null);
  const animationRef = useRef(null);
  const timelineRef = useRef(null);
  const lineLengthRef = useRef(44);
  const lineThicknessRef = useRef(1);

  const isValidTimeline = (value) => {
    if (!value || typeof value !== 'object') return false;
    return Number.isFinite(value.startAtEpoch)
      && Number.isFinite(value.duration)
      && Number.isFinite(value.pauseDuration);
  };

  const readStoredTimeline = () => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.sessionStorage.getItem(TRAIL_TIMELINE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return isValidTimeline(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const writeStoredTimeline = (timeline) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(TRAIL_TIMELINE_STORAGE_KEY, JSON.stringify(timeline));
    } catch {
      // no-op: storage can fail in private modes
    }
  };

  const isSidebarVisible = (node) => {
    if (!node || typeof window === 'undefined') return false;
    const style = window.getComputedStyle(node);
    if (style.display === 'none' || style.visibility === 'hidden') return false;

    const rect = node.getBoundingClientRect();
    return (
      rect.width > 0
      && rect.height > 0
      && rect.right > 0
      && rect.left < window.innerWidth
      && rect.bottom > 0
      && rect.top < window.innerHeight
    );
  };

  const getLayoutElements = () => {
    const navbar =
      document.querySelector('[data-dashboard-navbar="true"]')
      || document.querySelector('header');

    const sidebarCandidates = Array.from(
      document.querySelectorAll('[data-dashboard-sidebar="true"]')
    );

    const sidebar = sidebarCandidates.find((node) => isSidebarVisible(node)) || null;

    return { navbar, sidebar };
  };

  // Get interpolated point and current segment direction.
  const getPointOnPath = (points, progress) => {
    if (points.length === 1) {
      return { ...points[0], dx: 1, dy: 0 };
    }
    
    const segmentCount = points.length - 1;
    const segmentLength = 1 / segmentCount;
    const segment = Math.min(Math.floor(progress / segmentLength), segmentCount - 1);
    const segmentProgress = (progress - segment * segmentLength) / segmentLength;
    
    const p1 = points[segment];
    const p2 = points[segment + 1];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    
    return {
      x: p1.x + (p2.x - p1.x) * segmentProgress,
      y: p1.y + (p2.y - p1.y) * segmentProgress,
      dx,
      dy
    };
  };

  const applyTrailFrame = (point) => {
    if (!trailRef.current) return;

    const lineLength = lineLengthRef.current;
    const lineThickness = lineThicknessRef.current;
    const horizontal = Math.abs(point.dx) >= Math.abs(point.dy);

    trailRef.current.style.opacity = '1';
    trailRef.current.style.borderRadius = '999px';

    if (horizontal) {
      const movingLeft = point.dx < 0;
      const x = movingLeft ? point.x : point.x - lineLength;
      const y = point.y - lineThickness / 2;

      trailRef.current.style.width = `${lineLength}px`;
      trailRef.current.style.height = `${lineThickness}px`;
      trailRef.current.style.background = movingLeft
        ? 'linear-gradient(90deg, rgba(14,165,233,1) 0%, rgba(14,165,233,1) 74%, rgba(56,189,248,0.72) 90%, rgba(14,165,233,0) 100%)'
        : 'linear-gradient(90deg, rgba(14,165,233,0) 0%, rgba(56,189,248,0.72) 10%, rgba(14,165,233,1) 26%, rgba(14,165,233,1) 100%)';
      trailRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    } else {
      const movingDown = point.dy > 0;
      const x = point.x - lineThickness / 2;
      const y = movingDown ? point.y - lineLength : point.y;

      trailRef.current.style.width = `${lineThickness}px`;
      trailRef.current.style.height = `${lineLength}px`;
      trailRef.current.style.background = movingDown
        ? 'linear-gradient(180deg, rgba(14,165,233,0) 0%, rgba(56,189,248,0.72) 10%, rgba(14,165,233,1) 26%, rgba(14,165,233,1) 100%)'
        : 'linear-gradient(180deg, rgba(14,165,233,1) 0%, rgba(14,165,233,1) 74%, rgba(56,189,248,0.72) 90%, rgba(14,165,233,0) 100%)';
      trailRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  };

  const applyThemeClass = () => {
    if (!trailRef.current) return;
    trailRef.current.classList.toggle('glowing-border-trail-dark', Boolean(isDarkMode));
    trailRef.current.classList.toggle('glowing-border-trail-light', !isDarkMode);
  };

  const ensureTimeline = () => {
    const now = Date.now();

    if (typeof window === 'undefined') {
      if (!timelineRef.current) {
        timelineRef.current = { startAtEpoch: now, duration, pauseDuration };
      }
      return timelineRef.current;
    }

    const inMemory = isValidTimeline(window[TRAIL_TIMELINE_KEY]) ? window[TRAIL_TIMELINE_KEY] : null;
    const stored = readStoredTimeline();
    const existing = inMemory || stored;

    if (
      existing
      && Number.isFinite(existing.startAtEpoch)
      && existing.duration === duration
      && existing.pauseDuration === pauseDuration
    ) {
      window[TRAIL_TIMELINE_KEY] = existing;
      timelineRef.current = existing;
      return existing;
    }

    let nextStartAtEpoch = now;
    if (existing && Number.isFinite(existing.startAtEpoch)) {
      const oldCycle = (existing.duration * 2) + (existing.pauseDuration * 2);
      const newCycle = (duration * 2) + (pauseDuration * 2);
      if (oldCycle > 0 && newCycle > 0) {
        const oldOffset = ((now - existing.startAtEpoch) % oldCycle + oldCycle) % oldCycle;
        const mappedOffset = (oldOffset / oldCycle) * newCycle;
        nextStartAtEpoch = now - mappedOffset;
      }
    }

    const nextTimeline = {
      startAtEpoch: nextStartAtEpoch,
      duration,
      pauseDuration
    };
    window[TRAIL_TIMELINE_KEY] = nextTimeline;
    writeStoredTimeline(nextTimeline);
    timelineRef.current = nextTimeline;
    return nextTimeline;
  };

  const getFrameState = () => {
    const timeline = ensureTimeline();
    const now = Date.now();
    const segmentDuration = Math.max(1, Number(timeline.duration) || 1);
    const pause = Math.max(0, Number(timeline.pauseDuration) || 0);
    const moveAndPauseCycle = (segmentDuration * 2) + (pause * 2);

    if (moveAndPauseCycle <= 0) {
      return { direction: 'forward', progress: 0, isPause: false };
    }

    const cycleOffset = ((now - timeline.startAtEpoch) % moveAndPauseCycle + moveAndPauseCycle) % moveAndPauseCycle;
    const forwardEnd = segmentDuration;
    const forwardPauseEnd = forwardEnd + pause;
    const reverseEnd = forwardPauseEnd + segmentDuration;

    if (cycleOffset < forwardEnd) {
      return { direction: 'forward', progress: cycleOffset / segmentDuration, isPause: false };
    }
    if (cycleOffset < forwardPauseEnd) {
      return { direction: 'forward', progress: 1, isPause: true };
    }
    if (cycleOffset < reverseEnd) {
      return {
        direction: 'reverse',
        progress: (cycleOffset - forwardPauseEnd) / segmentDuration,
        isPause: false
      };
    }
    return { direction: 'reverse', progress: 1, isPause: true };
  };

  const getPathPoints = (direction = 'forward') => {
    const { navbar, sidebar } = getLayoutElements();
    if (!navbar) return null;

    const navbarRect = navbar.getBoundingClientRect();
    const borderY = navbarRect.bottom - 1;
    const navbarLeftX = navbarRect.left + 1;
    const navbarRightX = navbarRect.right - 1;

    if (!sidebar) {
      if (direction === 'reverse') {
        return [
          { x: navbarLeftX, y: borderY },
          { x: navbarRightX, y: borderY }
        ];
      }

      return [
        { x: navbarRightX, y: borderY },
        { x: navbarLeftX, y: borderY }
      ];
    }

    const sidebarRect = sidebar.getBoundingClientRect();
    const sidebarBorderX = sidebarRect.right - 1;
    const sidebarBottomY = sidebarRect.bottom - 1;

    if (direction === 'reverse') {
      return [
        { x: sidebarBorderX, y: sidebarBottomY }, // Bottom of sidebar border
        { x: sidebarBorderX, y: borderY }, // Up sidebar border to navbar border
        { x: navbarRightX, y: borderY } // Move right to navbar bottom right
      ];
    }

    return [
      { x: navbarRightX, y: borderY }, // Start at navbar bottom right
      { x: sidebarBorderX, y: borderY }, // Move left along navbar bottom border
      { x: sidebarBorderX, y: sidebarBottomY } // Move down sidebar border
    ];
  };

  const startAnimation = () => {
    ensureTimeline();

    const animate = () => {
      if (!trailRef.current) return;

      const { direction, progress, isPause } = getFrameState();
      const points = getPathPoints(direction);
      if (points) {
        const currentPoint = getPointOnPath(points, progress);
        applyTrailFrame(currentPoint);
        if (isPause && trailRef.current) {
          trailRef.current.style.opacity = '0.96';
        }
      } else if (trailRef.current) {
        trailRef.current.style.opacity = '0';
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const cleanup = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (trailRef.current && trailRef.current.parentNode) {
      trailRef.current.parentNode.removeChild(trailRef.current);
      trailRef.current = null;
    }
  };

  useEffect(() => {
    if (!isActive) {
      cleanup();
      return undefined;
    }

    // Create the trail element
    const trail = document.createElement('div');
    trail.className = 'glowing-border-trail';
    trail.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 44px;
      height: 1px;
      background: linear-gradient(
        90deg,
        rgba(14, 165, 233, 1) 0%,
        rgba(14, 165, 233, 1) 74%,
        rgba(56, 189, 248, 0.72) 90%,
        rgba(14, 165, 233, 0) 100%
      );
      box-shadow:
        0 0 7px rgba(14, 165, 233, 0.82),
        0 0 14px rgba(14, 165, 233, 0.48);
      border-radius: 999px;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      transition: opacity 0.45s ease;
      will-change: transform, width, height, background, opacity, box-shadow;
    `;
    document.body.appendChild(trail);
    trailRef.current = trail;
    applyThemeClass();

    // Start the animation sequence
    startAnimation();

    return cleanup;
  }, [isActive, duration, pauseDuration]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyThemeClass();
  }, [isDarkMode]); // eslint-disable-line react-hooks/exhaustive-deps

  return null; // This component doesn't render anything visible
};

export default GlowingBorderTrail;
