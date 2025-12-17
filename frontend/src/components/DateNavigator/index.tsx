/**
 * DateNavigator Component
 *
 * Navigation for selecting diary dates.
 */
import { useMemo } from 'react';

interface DateNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function DateNavigator({ date, onDateChange }: DateNavigatorProps) {
  const today = useMemo(() => new Date(), []);
  const yesterday = useMemo(() => addDays(today, -1), [today]);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);

  const isToday = isSameDay(date, today);
  const isYesterday = isSameDay(date, yesterday);
  const isTomorrow = isSameDay(date, tomorrow);

  const dateLabel = useMemo(() => {
    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    if (isTomorrow) return 'Tomorrow';
    return formatDate(date);
  }, [date, isToday, isYesterday, isTomorrow]);

  const goToPrevious = () => {
    onDateChange(addDays(date, -1));
  };

  const goToNext = () => {
    onDateChange(addDays(date, 1));
  };

  const goToToday = () => {
    onDateChange(today);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goToNext();
    }
  };

  return (
    <div
      className="relative flex items-center justify-between px-4 py-3 bg-surface-secondary rounded-lg border border-border focus:outline-2 focus:outline-primary focus:outline-offset-2"
      data-testid="date-navigator"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label="Date navigation"
    >
      {/* Left arrow - far left */}
      <button
        className="w-9 h-9 min-w-[44px] min-h-[44px] text-xl text-content-secondary bg-surface-tertiary border-none rounded cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-surface hover:text-content"
        onClick={goToPrevious}
        aria-label="Previous day"
      >
        ←
      </button>

      {/* Date - absolutely centered */}
      <div className="absolute left-1/2 -translate-x-1/2 text-center" role="status" aria-label="Current date">
        <span className="block text-lg font-semibold text-content">{dateLabel}</span>
        <span className="block text-xs text-content-tertiary mt-0.5">{formatDate(date)}</span>
      </div>

      {/* Right group: Today button + Right arrow */}
      <div className="flex items-center gap-2">
        {!isToday && (
          <button
            className="px-4 py-2 text-sm font-medium text-primary bg-transparent border border-primary rounded cursor-pointer transition-all duration-200 hover:bg-primary/10 min-h-[44px]"
            onClick={goToToday}
            aria-label="Go to today"
          >
            Today
          </button>
        )}
        <button
          className="w-9 h-9 min-w-[44px] min-h-[44px] text-xl text-content-secondary bg-surface-tertiary border-none rounded cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-surface hover:text-content"
          onClick={goToNext}
          aria-label="Next day"
        >
          →
        </button>
      </div>
    </div>
  );
}
