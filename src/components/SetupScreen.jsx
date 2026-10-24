import { useEffect, useState } from "react";
import CameraPreview from "./CameraPreview";
import HelpDialog from "./HelpDialog";
import { CheckIcon, ShieldIcon } from "./Icons";

function describeCameraError(error) {
  switch (error?.name) {
    case "NotAllowedError":
      return "Camera permission was denied. Please grant camera access in system settings and retry.";
    case "NotFoundError":
      return "No video input device detected. Please connect a working webcam.";
    case "NotReadableError":
      return "Camera is in use by another application. Please terminate other video apps.";
    default:
      return "Could not initialize video feed. Check hardware connections or consult Help.";
  }
}

function Step({ number, done, title, description, children }) {
  return (
    <li className={`step ${done ? "is-done" : ""}`}>
      <span className="step-marker" aria-hidden="true">
        {done ? <CheckIcon /> : number}
      </span>

      <div className="step-body">
        <div className="step-heading">
          <h3>{title}</h3>
          <span className={`badge ${done ? "badge-ok" : ""}`}>
            {done ? "Verified" : "Pending"}
          </span>
        </div>

        <p className="step-description">{description}</p>

        {children}
      </div>
    </li>
  );
}

function SetupScreen({ examInfo, stream, onCameraReady, onStart }) {
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [cameraError, setCameraError] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [starting, setStarting] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [displayCount, setDisplayCount] = useState(null);

  useEffect(() => {
    if (!examInfo.requireSingleDisplay) return;

    window.electronAPI.getDisplayCount().then(setDisplayCount);
    return window.electronAPI.onDisplaysChanged(setDisplayCount);
  }, [examInfo.requireSingleDisplay]);

  const detailsReady = name.trim().length >= 2 && rollNumber.trim().length >= 2;
  const cameraReady = stream !== null;
  const singleDisplay = displayCount === 1;
  const checks = [detailsReady, cameraReady, fullscreen, agreed];
  if (examInfo.requireSingleDisplay) checks.push(singleDisplay);
  const doneCount = checks.filter(Boolean).length;
  const canStart = doneCount === checks.length && !starting;
  const firstName = name.trim().split(" ")[0];
  const progressPercent = Math.round((doneCount / checks.length) * 100);

  async function requestCamera() {
    setCameraLoading(true);
    setCameraError(null);

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      onCameraReady(newStream);
    } catch (error) {
      setCameraError(describeCameraError(error));
    } finally {
      setCameraLoading(false);
    }
  }

  async function enterFullscreen() {
    const isOn = await window.electronAPI.setFullScreen();
    setFullscreen(Boolean(isOn));
  }

  async function start() {
    setStarting(true);

    const started = await onStart({
      name: name.trim(),
      rollNumber: rollNumber.trim(),
    });
    if (!started) setStarting(false);
  }

  const minutes = Math.round(examInfo.durationMs / 60000);

  return (
    <div className="page page-narrow">
      <header className="page-header">
        <div className="page-header-pre">
          <ShieldIcon /> Pre-Flight System Check
        </div>
        <h1>{examInfo.title}</h1>
        <p className="page-meta">
          {examInfo.totalQuestions} Questions · {minutes} Minutes Duration · Proctored Session
        </p>
        <p className="page-lede">
          {detailsReady ? `Welcome, ${firstName}! ` : ""}Please complete all {checks.length} compliance
          verifications below to activate the exam session.
        </p>

        <div className="setup-progress-track">
          <div
            className="setup-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      <ol className="steps">
        <Step
          number={1}
          done={detailsReady}
          title="Candidate Identification"
          description="Enter your official student credentials. These details are cryptographically associated with session telemetry."
        >
          <div className="fields">
            <label className="field">
              <span className="field-label">Full Name</span>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Alexander Vance"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={80}
                autoComplete="name"
                disabled={starting}
              />
            </label>

            <label className="field">
              <span className="field-label">Registration / Roll No.</span>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. CS-2026-904"
                value={rollNumber}
                onChange={(event) => setRollNumber(event.target.value)}
                maxLength={80}
                autoComplete="off"
                spellCheck={false}
                disabled={starting}
              />
            </label>
          </div>
        </Step>

        <Step
          number={2}
          done={cameraReady}
          title="Optical Surveillance Feed"
          description="Continuous visual monitoring is active throughout the test. Ensure face is centered and adequately illuminated."
        >
          {cameraReady ? (
            <CameraPreview stream={stream} className="setup-preview" />
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={requestCamera}
              disabled={cameraLoading}
            >
              {cameraLoading ? "Initializing feed…" : "Activate Camera Feed"}
            </button>
          )}

          {cameraError && (
            <p className="inline-error" role="alert">
              {cameraError}
            </p>
          )}
        </Step>

        <Step
          number={3}
          done={fullscreen}
          title="Dedicated Kiosk Mode"
          description="The application locks to full screen. Window blur, navigation, or app-switching triggers security warnings."
        >
          {!fullscreen && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={enterFullscreen}
            >
              Engage Full Screen
            </button>
          )}
        </Step>

        {examInfo.requireSingleDisplay && (
          <Step
            number={4}
            done={singleDisplay}
            title="Single Monitor Enforcement"
            description="External video feeds, split displays, or virtual monitors are prohibited during examination."
          >
            {displayCount > 1 && (
              <p className="inline-error" role="alert">
                Multiple displays ({displayCount}) detected. Disconnect secondary monitors or disable mirroring to proceed.
              </p>
            )}
          </Step>
        )}

        <Step
          number={examInfo.requireSingleDisplay ? 5 : 4}
          done={agreed}
          title="Honor Code & Protocols"
          description="Read and consent to the institutional code of integrity."
        >
          <ul className="rules">
            {examInfo.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(event) => setAgreed(event.target.checked)}
            />
            <span>I acknowledge the proctoring guidelines and agree to strictly abide by the rules.</span>
          </label>
        </Step>
      </ol>

      <footer className="setup-footer">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => setHelpOpen(true)}
        >
          System Diagnostics & FAQ
        </button>

        <div className="setup-footer-end">
          <span className="setup-progress">
            {doneCount} of {checks.length} verified ({progressPercent}%)
          </span>

          <button
            type="button"
            className="btn btn-primary btn-large"
            onClick={start}
            disabled={!canStart}
          >
            {starting ? "Starting Session…" : "Commence Exam"}
          </button>
        </div>
      </footer>

      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

export default SetupScreen;
