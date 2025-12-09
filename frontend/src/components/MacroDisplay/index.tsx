/**
 * MacroDisplay Component
 *
 * Shows daily macro totals with optional goal progress.
 */

interface MacroGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface MacroDisplayProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goals?: MacroGoals;
  compact?: boolean;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function getPercentage(value: number, goal: number): number {
  if (goal <= 0) return 0;
  return Math.round((value / goal) * 100);
}

interface MacroItemProps {
  label: string;
  value: number;
  goal?: number;
  unit?: string;
  testId: string;
}

function MacroItem({ label, value, goal, unit = 'g', testId }: MacroItemProps) {
  const percentage = goal ? getPercentage(value, goal) : undefined;
  const isOver = percentage !== undefined && percentage > 100;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs text-content-secondary uppercase tracking-wide">{label}</span>
      <span className="text-lg font-medium text-content">
        {formatNumber(value)}
        {goal && <span className="text-content-tertiary font-normal"> / {formatNumber(goal)}</span>}
        {unit && <span className="text-content-secondary text-sm ml-0.5">{unit}</span>}
      </span>
      {goal && (
        <>
          <div
            className="h-1 bg-surface-tertiary rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemax={goal}
            aria-label={`${label} progress`}
            data-testid={testId}
          >
            <div
              className={`h-full transition-all duration-300 ease-in-out ${isOver ? 'bg-error' : 'bg-primary'}`}
              style={{ width: `${Math.min(percentage!, 100)}%` }}
            />
          </div>
          <span className={`text-xs ${isOver ? 'text-error' : 'text-content-secondary'}`}>
            {percentage}%
          </span>
        </>
      )}
    </div>
  );
}

export default function MacroDisplay({
  calories,
  protein,
  carbs,
  fat,
  goals,
  compact = false,
}: MacroDisplayProps) {
  return (
    <div
      className={`bg-surface-secondary rounded-lg border border-border ${compact ? 'p-2' : 'p-4'}`}
      data-testid="macro-display"
      aria-label="Daily nutrition summary"
    >
      <div className={`mb-4 pb-4 border-b border-border ${compact ? 'mb-2 pb-2' : ''}`}>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-content-secondary uppercase tracking-wide">Calories</span>
          <span className="text-2xl font-semibold text-content">
            {formatNumber(calories)}
            {goals?.calories && <span className="text-content-tertiary font-normal text-xl"> / {formatNumber(goals.calories)}</span>}
          </span>
          {goals?.calories && (
            <>
              <div
                className="h-1 bg-surface-tertiary rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={calories}
                aria-valuemax={goals.calories}
                aria-label="Calories progress"
                data-testid="calories-progress"
              >
                <div
                  className={`h-full transition-all duration-300 ease-in-out ${
                    getPercentage(calories, goals.calories) > 100 ? 'bg-error' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(getPercentage(calories, goals.calories), 100)}%` }}
                />
              </div>
              <span className={`text-xs ${getPercentage(calories, goals.calories) > 100 ? 'text-error' : 'text-content-secondary'}`}>
                {getPercentage(calories, goals.calories)}%
              </span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-4">
        <MacroItem
          label="Protein"
          value={protein}
          goal={goals?.protein}
          testId="protein-progress"
        />
        <MacroItem
          label="Carbs"
          value={carbs}
          goal={goals?.carbs}
          testId="carbs-progress"
        />
        <MacroItem
          label="Fat"
          value={fat}
          goal={goals?.fat}
          testId="fat-progress"
        />
      </div>
    </div>
  );
}
