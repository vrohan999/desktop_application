# SentinelProctor 🛡️

> A robust, cross-platform Electron desktop assessment and proctoring client engineered for high-stakes institutional examinations.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Electron](https://img.shields.io/badge/Electron-44.x-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

---

## 🌟 Overview

**SentinelProctor** transforms standard student workstations into secure, locked-down testing environments. Designed to prevent academic dishonesty while maintaining a fluid candidate experience, the application orchestrates continuous surveillance telemetry, multi-display restrictions, kiosk focus enforcement, and resilient local state recovery.

---

## 🚀 Key Features

### 🔒 Kiosk Lockdown & System Integrity
- **Frameless Window Lock**: Seamless edge-to-edge full screen window management preventing OS navigation shortcuts.
- **Single Display Enforcement**: Continuous detection of external monitors, HDMI mirroring, and virtual display drivers.
- **Focus & Blur Surveillance**: Real-time infraction reporting when the exam window loses active focus.

### 📷 Visual Proctoring & Telemetry
- **Hardware Pre-flight Checklist**: Automated camera readiness and display count verification prior to test commencement.
- **Periodic Snapshot Engine**: Silent, background webcam frame sampling saved locally per assessment session.
- **Violation Snapshot Capture**: Instant photographic evidence tagged directly to security alerts (e.g. lost camera, window blur).

### ⚡ Candidate Experience
- **Interactive Question Palette**: Instant jump navigation with status badges (`Answered`, `Unanswered`, `Flagged for Review`).
- **Rapid Keyboard Shortcuts**: Optimized for test takers (`A–D` for choices, `F` for flagging, `← / →` for pagination).
- **Crash Resilience**: Local JSON-backed session persistence that restores exact answers and remaining time even after power interruption.

### 📊 Comprehensive Review & Audit Trail
- **Granular Score Meter**: Instant pass/review breakdown with percentage metrics and question breakdown.
- **Response Filter Chips**: Group questions by correct, incorrect, skipped, and flagged states.
- **Exportable Audit Log**: Structured session telemetry and photographic snapshot bundle for invigilator review.

---

## 🛠️ Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   SentinelProctor                      │
├────────────────────────────┬───────────────────────────┤
│       Electron Core        │      React Renderer       │
├────────────────────────────┼───────────────────────────┤
│ • App Lifecycle & Kiosk    │ • React 19 + Hooks        │
│ • IPC State Synchronization│ • Custom Design Tokens    │
│ • Display Monitor Watcher  │ • Vector Icon Suite       │
│ • File System Persistence  │ • WebRTC MediaStream API  │
└────────────────────────────┴───────────────────────────┘
```

- **Runtime**: [Electron](https://electronjs.org/) (Node.js + Chromium)
- **UI Layer**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS Design System with dark mode tokens and HSL accent variables
- **IPC Interface**: Context-isolated secure preload bridge (`window.electronAPI`)

---

## 💻 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/vrohan999/desktop_application.git
cd desktop_application

# Install dependencies
npm install
```

### Development Mode

Run both the Vite renderer server and the Electron application concurrently:

```bash
npm run dev
```

### Packaging & Distribution

To build production bundles and DMG installers (macOS):

```bash
# Production Vite build
npm run build

# Package macOS DMG
npm run dist:mac
```

---

## 📁 Repository Structure

```
.
├── electron/
│   ├── main.js         # Electron main process, IPC handlers, proctoring rules
│   ├── preload.js      # Context isolation preload script
│   └── data/           # Questions dataset and exam templates
├── src/
│   ├── components/
│   │   ├── CameraPreview.jsx  # WebRTC camera mirror element
│   │   ├── HelpDialog.jsx     # Technical guidelines & troubleshooting
│   │   ├── Icons.jsx          # Vector stroke SVG icons
│   │   ├── MainExam.jsx       # Interactive exam environment
│   │   ├── Results.jsx        # Evaluation dashboard & audit trail
│   │   ├── SetupScreen.jsx    # Pre-flight candidate check
│   │   └── TitleBar.jsx       # Frameless window controls
│   ├── utils/
│   │   ├── time.js            # Timer formatters
│   │   └── violations.js      # Violation type labels
│   ├── App.css         # Component-level styling & animations
│   ├── index.css       # Design tokens, variables & typography
│   └── App.jsx         # Main application orchestrator
├── package.json
└── README.md
```

---

## ⚖️ License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with academic rigor by [vrohan999](https://github.com/vrohan999).**
