import { useEffect, useRef, useState } from "react";
import CameraPreview from "./CameraPreview";
import { AlertIcon, ArrowLeftIcon, ArrowRightIcon, ClockIcon, FlagIcon } from "./Icons";
import { formatClock } from "../utils/time";
import { describeViolation } from "../utils/violations";

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];
const LOW_TIME_MS = 5 * 60 * 1000;
const TIME_ALERTS_MS = [5 * 60 * 1000, 60 * 1000];

function plural(count, word) {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

function MainExam({ examInfo, initialProgress, stream, timeLeftMs }) {
  const totalQuestions = examInfo.totalQuestions;

  const [questionId, setQuestionId] = useState(1);
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState(initialProgress.answers);
  const [flagged, setFlagged] = useState(() => new Set(initialProgress.flagged));
  const [submitting, setSubmitting] = useState(false);
  const [warning, setWarning] = useState(initialProgress.warning);
  const [dismissedAlert, setDismissedAlert] = useState(null);

  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function loadQuestion() {
      const data = await window.electronAPI.getQuestion(questionId);
      if (!cancelled) setQuestion(data);
    }

    loadQuestion();

    return () => {
      cancelled = true;
    };
  }, [questionId]);

  useEffect(() => {
    return window.electronAPI.onViolation((data) => {
      setWarning(data);
      if (data.limitReached) setSubmitting(true);
    });
  }, []);

  useEffect(() => {
    if (!stream) return;

    const tracks = stream.getVideoTracks();
    const onEnded = () => window.electronAPI.reportViolation("camera-lost");

    tracks.forEach((track) => track.addEventListener("ended", onEnded));
    return () =>
      tracks.forEach((track) => track.removeEventListener("ended", onEnded));
  }, [stream]);

  useEffect(() => {
    function onKeyDown(event) {
      if (submitting || !question) return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const key = event.key.toUpperCase();
      const onRadio = event.target instanceof HTMLInputElement;

      if (key === "ARROWRIGHT" && !onRadio && questionId < totalQuestions) {
        setQuestionId(questionId + 1);
        return;
      }

      if (key === "ARROWLEFT" && !onRadio && questionId > 1) {
        setQuestionId(questionId - 1);
        return;
      }

      let index = OPTION_LETTERS.indexOf(key);
      if (index === -1 && /^[1-9]$/.test(key)) index = Number(key) - 1;

      if (key === "F" && !event.repeat) {
        toggleFlag(question.id);
        return;
      }

      if (index >= 0 && index < question.options.length) {
        chooseAnswer(question.id, index);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [question, questionId, totalQuestions, submitting]);

  function chooseAnswer(id, index) {
    setAnswers((prev) => {
      const next = { ...prev };
      if (index === null) delete next[id];
      else next[id] = index;
      return next;
    });
    window.electronAPI.saveAnswer(id, index);
  }

  function toggleFlag(id) {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      window.electronAPI.setFlag(id, next.has(id));
      return next;
    });
  }

  function goTo(id) {
    if (id < 1 || id > totalQuestions) return;
    setQuestionId(id);
  }

  async function endTest() {
    const confirmed = await window.electronAPI.confirmEndTest();
    if (!confirmed || submittedRef.current) return;

    submittedRef.current = true;
    setSubmitting(true);
    await window.electronAPI.submitTest();
  }

  const answeredCount = Object.keys(answers).length;
  const selectedOption = answers[questionId] ?? null;
  const isFlagged = flagged.has(questionId);
  const isLastQuestion = questionId === totalQuestions;
  const isLowOnTime = timeLeftMs !== null && timeLeftMs < LOW_TIME_MS;
  const timeAlert =
    timeLeftMs > 0
      ? TIME_ALERTS_MS.filter(
          (ms) => timeLeftMs <= ms && ms < examInfo.durationMs,
        ).at(-1)
      : undefined;
  const showTimeAlert =
    timeAlert !== undefined && timeAlert !== dismissedAlert && !submitting;
  const shownQuestion = question?.id === questionId ? question : null;

  return (
    <div className="exam">
      <div className="exam-bar">
        <div className="exam-bar-info">
          <div className="exam-tag">Live Session</div>
          <h1 className="exam-title">{examInfo.title}</h1>
          <p className="exam-progress">
            <span>{answeredCount}</span> of {totalQuestions} answered
            {flagged.size > 0 && (
              <span className="exam-progress-flagged">
                {" "}· {flagged.size} flagged for review
              </span>
            )}
          </p>
        </div>

        <div className="exam-bar-end">
          <div className={`timer ${isLowOnTime ? "is-low" : ""}`}>
            <ClockIcon />
            <span aria-label="Time left">
              {timeLeftMs === null ? "--:--:--" : formatClock(timeLeftMs)}
            </span>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={endTest}
            disabled={submitting}
          >
            {submitting ? "Submitting…" : "Finish Exam"}
          </button>
        </div>
      </div>

      {warning && (
        <div className="exam-warning" role="alert">
          <div className="exam-warning-icon">
            <AlertIcon />
          </div>
          <div className="exam-warning-content">
            <p className="exam-warning-title">
              Integrity Alert: {describeViolation(warning.violation.type)}
            </p>
            <p className="exam-warning-detail">
              {warning.limitReached
                ? "Maximum infraction threshold reached. Auto-submitting assessment immediately."
                : `Infraction strike ${warning.count} of ${warning.max}. Upon reaching strike ${warning.max}, exam will auto-terminate.`}
            </p>
          </div>

          {!warning.limitReached && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setWarning(null)}
            >
              Acknowledge
            </button>
          )}
        </div>
      )}

      {showTimeAlert && (
        <div className="time-alert" role="status">
          <div className="time-alert-icon">
            <ClockIcon />
          </div>
          <p>
            <strong>{plural(timeAlert / 60000, "minute")} remaining.</strong>{" "}
            All answered responses will automatically lock and submit when the timer expires.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setDismissedAlert(timeAlert)}
          >
            Understood
          </button>
        </div>
      )}

      <div className="exam-body">
        <section className="question-card" aria-live="polite">
          {shownQuestion && (
            <>
              <div className="question-card-header">
                <span className="question-number">
                  Question {questionId} of {totalQuestions}
                </span>
                {isFlagged && (
                  <span className="badge badge-flag">Flagged for Review</span>
                )}
              </div>

              <h2 className="question-text">{shownQuestion.question}</h2>

              <div
                className="options"
                role="radiogroup"
                aria-label={`Options for question ${questionId}`}
              >
                {shownQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className={`option ${selectedOption === index ? "is-selected" : ""}`}
                  >
                    <input
                      type="radio"
                      className="visually-hidden"
                      name={`answer-${questionId}`}
                      checked={selectedOption === index}
                      onChange={() => chooseAnswer(questionId, index)}
                      disabled={submitting}
                    />
                    <span className="option-key">{OPTION_LETTERS[index]}</span>
                    <span className="option-text">{option}</span>
                  </label>
                ))}
              </div>

              <div className="question-tools">
                <button
                  type="button"
                  className={`btn btn-ghost flag-toggle ${isFlagged ? "is-on" : ""}`}
                  onClick={() => toggleFlag(questionId)}
                  aria-pressed={isFlagged}
                  disabled={submitting}
                >
                  <FlagIcon />
                  {isFlagged ? "Flagged for Review" : "Flag for Review"}
                </button>

                {selectedOption !== null && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => chooseAnswer(questionId, null)}
                    disabled={submitting}
                  >
                    Reset Selection
                  </button>
                )}
              </div>

              <div className="question-nav">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => goTo(questionId - 1)}
                  disabled={questionId === 1}
                >
                  <ArrowLeftIcon /> Previous
                </button>

                {isLastQuestion ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={endTest}
                    disabled={submitting}
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => goTo(questionId + 1)}
                  >
                    Next Question <ArrowRightIcon />
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        <aside className="exam-aside">
          <div className="aside-block">
            <div className="camera-frame">
              {stream && <CameraPreview stream={stream} />}
              <span className="recording">
                <span className="recording-dot" aria-hidden="true" />
                Live Feed
              </span>
            </div>
          </div>

          <div className="aside-block">
            <h2 className="aside-heading">Question Palette</h2>

            <div className="palette">
              {Array.from({ length: totalQuestions }, (_, i) => i + 1).map(
                (id) => (
                  <button
                    key={id}
                    type="button"
                    className={[
                      "palette-item",
                      id === questionId && "is-current",
                      answers[id] !== undefined && "is-answered",
                      flagged.has(id) && "is-flagged",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => goTo(id)}
                    aria-current={id === questionId ? "step" : undefined}
                    aria-label={`Question ${id}${answers[id] !== undefined ? ", answered" : ""}${flagged.has(id) ? ", marked for review" : ""}`}
                  >
                    {id}
                  </button>
                ),
              )}
            </div>

            <ul className="legend">
              <li>
                <span className="legend-swatch is-answered" /> Answered
              </li>
              <li>
                <span className="legend-swatch" /> Unanswered
              </li>
              <li>
                <span className="legend-swatch is-flagged" /> Flagged
              </li>
            </ul>
          </div>

          <div className="aside-block shortcut-hint">
            <strong>Key Shortcuts</strong>
            <p>
              <kbd>A</kbd>–<kbd>D</kbd> select answer<br />
              <kbd>F</kbd> toggle flag<br />
              <kbd>←</kbd> <kbd>→</kbd> switch question
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MainExam;
