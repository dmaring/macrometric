/**
 * MacroDisplay Component
 *
 * Shows daily macro totals with optional goal progress.
 */
import './MacroDisplay.css';

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
    <div className="macro-item">
      <span className="macro-label">{label}</span>
      <span className="macro-value">
        {formatNumber(value)}
        {goal && <span className="macro-goal"> / {formatNumber(goal)}</span>}
        {unit && <span className="macro-unit">{unit}</span>}
      </span>
      {goal && (
        <>
          <div
            className="progress-bar"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemax={goal}
            aria-label={`${label} progress`}
            data-testid={testId}
          >
            <div
              className={`progress-fill ${isOver ? 'over' : ''}`}
              style={{ width: `${Math.min(percentage!, 100)}%` }}
            />
          </div>
          <span className={`percentage ${isOver ? 'over' : ''}`}>
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
      className={`macro-display ${compact ? 'compact' : ''}`}
      data-testid="macro-display"
      aria-label="Daily nutrition summary"
    >
      <div className="calories-section">
        <MacroItem
          label="Calories"
          value={calories}
          goal={goals?.calories}
          unit=""
          testId="calories-progress"
        />
      </div>

      <div className="macros-section">
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
