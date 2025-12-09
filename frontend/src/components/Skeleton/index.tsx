/**
 * Skeleton Loading Component
 *
 * Provides placeholder loading states for content.
 */

interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'full';
}

export function Skeleton({ className = '', width, height, rounded = 'md' }: SkeletonProps) {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  }[rounded];

  const style = {
    ...(width && { width }),
    ...(height && { height }),
  };

  return (
    <div
      className={`animate-pulse bg-surface-tertiary ${roundedClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/**
 * Skeleton for MacroDisplay component
 */
export function MacroDisplaySkeleton() {
  return (
    <div
      className="bg-surface-secondary rounded-lg border border-border p-4"
      aria-label="Loading nutrition data"
    >
      {/* Calories section */}
      <div className="mb-4 pb-4 border-b border-border">
        <Skeleton width="60px" height="12px" className="mb-2" />
        <Skeleton width="120px" height="32px" className="mb-2" />
        <Skeleton width="100%" height="4px" rounded="full" className="mb-1" />
        <Skeleton width="40px" height="12px" />
      </div>

      {/* Macros grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-1">
            <Skeleton width="50px" height="12px" />
            <Skeleton width="80px" height="20px" className="mb-1" />
            <Skeleton width="100%" height="4px" rounded="full" className="mb-1" />
            <Skeleton width="35px" height="12px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for MealCategory component
 */
export function MealCategorySkeleton() {
  return (
    <div className="bg-surface-secondary rounded-lg overflow-hidden border border-border">
      <div className="flex flex-wrap items-center gap-4 px-4 py-3 bg-surface-tertiary">
        <Skeleton width="120px" height="20px" />
        <Skeleton width="60px" height="20px" className="ml-auto" />
        <div className="flex gap-2">
          <Skeleton width="100px" height="40px" />
          <Skeleton width="100px" height="40px" />
        </div>
      </div>
      <div className="px-4 py-6 text-center">
        <Skeleton width="200px" height="16px" className="mx-auto" />
      </div>
    </div>
  );
}

/**
 * Complete Diary page skeleton
 */
export function DiaryPageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-6">
      {/* Date Navigator Skeleton */}
      <div className="bg-surface-secondary rounded-lg px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton width="44px" height="44px" />
          <div className="flex flex-col items-center gap-1">
            <Skeleton width="60px" height="20px" />
            <Skeleton width="100px" height="16px" />
          </div>
          <Skeleton width="44px" height="44px" />
          <Skeleton width="80px" height="44px" className="hidden sm:block" />
        </div>
      </div>

      {/* MacroDisplay Skeleton */}
      <MacroDisplaySkeleton />

      {/* Meal Categories Skeleton */}
      <div className="flex flex-col gap-4">
        <MealCategorySkeleton />
        <MealCategorySkeleton />
        <MealCategorySkeleton />
      </div>
    </div>
  );
}

export default Skeleton;
