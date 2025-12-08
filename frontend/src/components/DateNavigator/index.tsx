/**
 * DateNavigator Component
 *
 * Navigation for selecting diary dates.
 */
import { useMemo } from 'react';
import './DateNavigator.css';

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
      className="date-navigator"
      data-testid="date-navigator"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="group"
      aria-label="Date navigation"
    >
      <button
        className="nav-button"
        onClick={goToPrevious}
        aria-label="Previous day"
      >
        ←
      </button>

      <div className="date-display" role="status" aria-label="Current date">
        <span className="date-label">{dateLabel}</span>
        {!isToday && !isYesterday && !isTomorrow && (
          <span className="date-full">{formatDate(date)}</span>
        )}
        {(isToday || isYesterday || isTomorrow) && (
          <span className="date-full">{formatDate(date)}</span>
        )}
      </div>

      <button
        className="nav-button"
        onClick={goToNext}
        aria-label="Next day"
      >
        →
      </button>

      <button
        className="today-button"
        onClick={goToToday}
        disabled={isToday}
        aria-label="Go to today"
      >
        Today
      </button>
    </div>
  );
}
