import { useMotionValue, useTransform } from 'motion/react';

interface UseSwipeGestureReturn {
  x: ReturnType<typeof useMotionValue>;
  background: ReturnType<typeof useTransform>;
  dragProps: {
    drag: 'x';
    dragConstraints: { left: number; right: number };
    dragElastic: number;
    onDragEnd: (event: any, info: any) => void;
  };
}

export function useSwipeGesture(
  onSwipeRight: () => void,
  onSwipeLeft: () => void,
  threshold = 80
): UseSwipeGestureReturn {
  const x = useMotionValue(0);

  const background = useTransform(x, [-threshold, 0, threshold], ['#ef4444', 'transparent', '#10b981']);

  const handleDragEnd = (event: any, info: any) => {
    if (info.offset.x > threshold) {
      onSwipeRight();
    } else if (info.offset.x < -threshold) {
      onSwipeLeft();
    }
  };

  return {
    x,
    background,
    dragProps: {
      drag: 'x',
      dragConstraints: { left: 0, right: 0 },
      dragElastic: 0.2,
      onDragEnd: handleDragEnd,
    },
  };
}
