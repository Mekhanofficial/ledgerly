import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

const NUMBER_PATTERN = /-?\d[\d,]*(?:\.\d+)?/;

const toNumber = (value) => {
  const parsed = Number(String(value).replace(/,/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};

const parseValue = (value, decimalsOverride) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const decimals = Number.isInteger(value) ? 0 : String(value).split('.')[1]?.length || 0;
    return {
      target: value,
      prefix: '',
      suffix: '',
      decimals: Math.max(0, Math.min(decimalsOverride ?? decimals, 4))
    };
  }

  if (value === null || value === undefined) {
    return null;
  }

  const text = String(value);
  const match = text.match(NUMBER_PATTERN);
  if (!match || match.index == null) {
    return null;
  }

  const rawNumber = match[0];
  const target = toNumber(rawNumber);
  if (target === null) {
    return null;
  }

  const decimalsInValue = rawNumber.includes('.') ? rawNumber.split('.')[1].length : 0;
  return {
    target,
    prefix: text.slice(0, match.index),
    suffix: text.slice(match.index + rawNumber.length),
    decimals: Math.max(0, Math.min(decimalsOverride ?? decimalsInValue, 4))
  };
};

const formatValue = (parts, numericValue) => {
  const normalized = Object.is(numericValue, -0) ? 0 : numericValue;
  const formattedNumber = normalized.toLocaleString(undefined, {
    minimumFractionDigits: parts.decimals,
    maximumFractionDigits: parts.decimals
  });
  return `${parts.prefix}${formattedNumber}${parts.suffix}`;
};

const CountUpNumber = ({
  value,
  duration = 1800,
  decimals,
  className = '',
  animate = true,
  viewportAmount = 0.35
}) => {
  const elementRef = useRef(null);
  const hasAnimatedRef = useRef(false);
  const parsedValue = useMemo(() => parseValue(value, decimals), [value, decimals]);
  const inView = useInView(elementRef, { once: true, amount: viewportAmount });
  const [displayValue, setDisplayValue] = useState(parsedValue?.target ?? 0);

  useEffect(() => {
    if (!parsedValue) return;
    if (!animate) {
      setDisplayValue(parsedValue.target);
      hasAnimatedRef.current = true;
      return;
    }

    setDisplayValue(0);
    hasAnimatedRef.current = false;
  }, [parsedValue, animate]);

  useEffect(() => {
    if (!parsedValue || !animate || hasAnimatedRef.current || !inView) {
      return;
    }

    hasAnimatedRef.current = true;
    let rafId = 0;
    let startAt = 0;
    const target = parsedValue.target;

    const tick = (timestamp) => {
      if (!startAt) startAt = timestamp;
      const elapsed = timestamp - startAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(target * eased);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        setDisplayValue(target);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(rafId);
  }, [animate, duration, inView, parsedValue]);

  if (!parsedValue) {
    return (
      <span ref={elementRef} className={className}>
        {value}
      </span>
    );
  }

  return (
    <span ref={elementRef} className={className}>
      {formatValue(parsedValue, animate && inView ? displayValue : parsedValue.target)}
    </span>
  );
};

export default CountUpNumber;
