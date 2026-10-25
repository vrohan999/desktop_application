import { useState } from "react";
import { formatClock, formatDuration } from "../utils/time";
import { describeViolation } from "../utils/violations";
import { AlertIcon, CheckIcon, ShieldIcon } from "./Icons";

const REASON_TEXT = {
  manual: "Assessment successfully submitted. All responses and telemetry have been securely stored.",
  timeout: "Allocated testing window expired. Responses were finalized and submitted automatically.",
  violations:
    "Assessment was automatically terminated and submitted due to reaching the maximum proctoring violation limit.",
};

const FILTERS = [
  { id: "all", label: "All Questions", test: () => true },
  { id: "correct", label: "Correct", test: (item) => item.isCorrect },
  {
    id: "incorrect",
    label: "Incorrect",
    test: (item) => !item.isCorrect && item.selected !== null,
  },
  { id: "skipped", label: "Unanswered", test: (item) => item.selected === null },
  { id: "flagged", label: "Flagged", test: (item) => item.flagged },
];

function Results({ result }) {
  const [filter, setFilter] = useState("all");

  const percent = Math.round((result.score / result.total) * 100);
  const unanswered = result.total - result.answered;
  const activeFilter = FILTERS.find((f) => f.id === filter);
  const shownItems = result.review
    .map((item, index) => ({ item, number: index + 1 }))
    .filter(({ item }) => activeFilter.test(item));

  const isPassed = percent >= 50;

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <div className="page-header-pre">
          <ShieldIcon /> Session Evaluation Report
        </div>
        <h1>Assessment Concluded</h1>
        <p className="page-meta">
          Candidate: <strong>{result.student.name}</strong> · ID: <strong>{result.student.rollNumber}</strong>
        </p>
        <p className="page-lede">
          {REASON_TEXT[result.reason] ?? REASON_TEXT.manual}
        </p>
      </header>

      <section className="card results-summary">
        <div className="results-score-wrap">
          <div className="results-score">
            <span className="results-score-value">
              {result.score}
              <span className="results-score-total"> / {result.total}</span>
            </span>
            <div className={`results-score-badge ${isPassed ? "is-pass" : "is-fail"}`}>
              {percent}% {isPassed ? "Pass" : "Review"}
            </div>
          </div>
        </div>

        <dl className="results-stats">
          <div>
            <dt>Answered</dt>
            <dd>{result.answered}</dd>
          </div>
          <div>
            <dt>Unanswered</dt>
            <dd>{unanswered}</dd>
          </div>
          <div>
            <dt>Time Taken</dt>
            <dd>{formatDuration(result.durationMs)}</dd>
          </div>
          <div>
            <dt>Surveillance Captures</dt>
            <dd>{result.snapshotCount}</dd>
          </div>
          <div>
            <dt>Security Infractions</dt>
            <dd className={result.violations.length > 0 ? "stat-warn" : "stat-ok"}>
              {result.violations.length}
            </dd>
          </div>
        </dl>

        <div className="results-session">
          <p>
            Cryptographic Session Fingerprint: <code>{result.sessionId}</code>
          </p>

          <div className="results-files">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.electronAPI.openSnapshotsFolder()}
            >
              Open Captures Folder
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => window.electronAPI.showResultFile()}
            >
              Inspect Audit Log JSON
            </button>
          </div>
        </div>
      </section>

      {result.violations.length > 0 && (
        <section className="results-violations-section">
          <h2 className="section-heading">Proctoring Telemetry Events</h2>

          <ol className="card incident-list">
            {result.violations.map((violation, index) => (
              <li key={index} className="incident">
                <span className="incident-icon">
                  <AlertIcon />
                </span>
                <span className="incident-time">
                  +{formatClock(violation.at - result.startedAt)}
                </span>
                <span className="incident-desc">{describeViolation(violation.type)}</span>
                {violation.snapshot && (
                  <button
                    type="button"
                    className="btn btn-ghost incident-photo"
                    onClick={() =>
                      window.electronAPI.openWarningPhoto(index + 1)
                    }
                  >
                    View Snapshot Evidence
                  </button>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="results-review-section">
        <h2 className="section-heading">Detailed Response Audit</h2>

        <div className="filter-bar" role="group" aria-label="Filter questions">
          {FILTERS.map((f) => {
            const count = result.review.filter(f.test).length;
            if (f.id === "flagged" && count === 0) return null;

            return (
              <button
                key={f.id}
                type="button"
                className={`filter-chip ${filter === f.id ? "is-active" : ""}`}
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </div>

        {shownItems.length === 0 && (
          <p className="review-empty">No questions match the selected filter category.</p>
        )}

        <ol className="review-list">
          {shownItems.map(({ item, number }) => (
            <li
              key={item.id}
              className={`review-item ${item.isCorrect ? "is-correct" : "is-incorrect"}`}
            >
              <div className="review-item-head">
                <span className="review-number">#{number}</span>
                <p className="review-question">{item.question}</p>
                {item.flagged && (
                  <span className="badge badge-flag">Flagged</span>
                )}
                {item.isCorrect ? (
                  <span className="badge badge-ok">
                    <CheckIcon /> Correct
                  </span>
                ) : item.selected === null ? (
                  <span className="badge">Skipped</span>
                ) : (
                  <span className="badge badge-bad">Incorrect</span>
                )}
              </div>

              <div className="review-answer-grid">
                <p className="review-answer">
                  Your Answer:{" "}
                  <strong className={item.isCorrect ? "color-ok" : "color-bad"}>
                    {item.selected === null
                      ? "None (Unanswered)"
                      : item.options[item.selected]}
                  </strong>
                </p>

                {!item.isCorrect && (
                  <p className="review-answer">
                    Correct Answer:{" "}
                    <strong className="color-ok">{item.options[item.correct]}</strong>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <footer className="results-footer">
        <button
          type="button"
          className="btn btn-primary btn-large"
          onClick={() => window.electronAPI.quitApp()}
        >
          Exit Assessment System
        </button>
      </footer>
    </div>
  );
}

export default Results;
