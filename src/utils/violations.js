const LABELS = {
  "focus-lost": "Window focus lost or candidate switched applications",
  "fullscreen-exited": "Exited kiosk full-screen mode",
  "camera-lost": "Webcam video feed interrupted or disconnected",
  "extra-display": "Secondary monitor or external display connected",
  "app-restarted": "Assessment application closed and reopened unexpectedly",
};

export function describeViolation(type) {
  return LABELS[type] ?? "Unrecognized telemetry event";
}
