import { useEffect, useRef } from "react";
import { CloseIcon, ShieldIcon } from "./Icons";

const TOPICS = [
  {
    title: "Candidate Registration Credentials",
    body: [
      "Ensure candidate name and institution registration identifier match your official ID records.",
      "All session telemetry, timestamps, and surveillance snapshots are bound to this cryptographic profile.",
    ],
  },
  {
    title: "Video Feed & Peripheral Diagnostics",
    body: [
      "Ensure all third-party conferencing utilities (Zoom, Microsoft Teams, Discord, FaceTime) are completely terminated.",
      "macOS: System Settings › Privacy & Security › Camera › Authorize application.",
      "Windows: Settings › Privacy & Security › Camera › Enable Desktop App access.",
      "Verify camera is not obstructed and lighting is uniform across your face.",
    ],
  },
  {
    title: "Multi-Display Restrictions",
    body: [
      "Institutional policy requires a single physical video display.",
      "Disconnect external monitors, wireless casting dongles, and virtual display drivers.",
      "The pre-flight check automatically validates display hardware state.",
    ],
  },
  {
    title: "Kiosk Enforcement & Anti-Cheat Protocols",
    body: [
      "The assessment environment operates in a locked full-screen kiosk.",
      "Focus loss (blur), window minimizing, application switching (Alt+Tab / Cmd+Tab), and secondary screens trigger security violations.",
      "Exceeding the infraction quota results in immediate automatic examination termination.",
      "Continuous random and violation-triggered snapshots are preserved for proctor audit.",
    ],
  },
  {
    title: "Navigation & Auto-Save",
    body: [
      "Every response is immediately written to local resilient storage.",
      "Keyboard shortcuts: Use A–D / 1–4 to choose options, F to flag questions, and Arrow keys (← / →) for navigation.",
      "If the application experiences unexpected hardware failure, re-launching resumes from the exact state.",
    ],
  },
];

function HelpDialog({ open, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="help-dialog"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="help-dialog-inner">
        <div className="help-dialog-header">
          <div className="help-dialog-title">
            <ShieldIcon />
            <h2>System Diagnostics & Guidelines</h2>
          </div>

          <button
            type="button"
            className="icon-btn"
            aria-label="Close dialog"
            onClick={onClose}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="help-topics-list">
          {TOPICS.map((topic) => (
            <section key={topic.title} className="help-topic">
              <h3>{topic.title}</h3>
              {topic.body.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </section>
          ))}
        </div>
      </div>
    </dialog>
  );
}

export default HelpDialog;
