/**
 * ProgressBar.jsx
 * Shows which step the user is on in the multi-step form.
 * Props:
 *   currentStep: number (0-indexed)
 *   totalSteps: number
 *   stepLabels: string[]
 */
export default function ProgressBar({ currentStep, totalSteps, stepLabels }) {
  const percentage = ((currentStep) / (totalSteps - 1)) * 100;

  return (
    <div className="progress-bar-container">
      {/* Step labels row */}
      <div className="progress-steps-row">
        {stepLabels.map((label, i) => (
          <div
            key={i}
            className={`progress-step-dot ${
              i < currentStep ? "done" : i === currentStep ? "active" : ""
            }`}
            title={label}
          >
            <div className="dot-circle">
              {i < currentStep ? (
                <span className="dot-check">✓</span>
              ) : (
                <span className="dot-num">{i + 1}</span>
              )}
            </div>
            <span className="dot-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Progress track */}
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Text indicator */}
      <p className="progress-text">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
}
