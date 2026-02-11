import clsx from 'clsx';

type SkeletonVariant = 'card' | 'text' | 'circle' | 'bar';

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function LoadingSkeleton({
  variant = 'bar',
  width,
  height,
  className,
}: LoadingSkeletonProps) {
  const baseClass = 'skeleton-shimmer border border-zinc-700';

  const variantClasses: Record<SkeletonVariant, string> = {
    card: 'min-h-[120px]',
    text: 'h-4',
    circle: 'aspect-square w-12 h-12',
    bar: 'h-3',
  };

  const style: React.CSSProperties = {};
  if (width !== undefined)
    style.width = typeof width === 'number' ? `${width}px` : width;
  if (height !== undefined)
    style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={clsx(baseClass, variantClasses[variant], className)}
      style={style}
    />
  );
}
