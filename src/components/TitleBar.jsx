import { CloseIcon, MinimizeIcon, ShieldIcon } from "./Icons";

// Custom frameless draggable titlebar with brand styling and native controls
function TitleBar({ subtitle, showControls }) {
  return (
    <header className="titlebar">
      <div className="titlebar-brand-wrap">
        <span className="titlebar-icon">
          <ShieldIcon />
        </span>
        <span className="titlebar-brand">SentinelProctor</span>
        <span className="titlebar-badge">Secure</span>
      </div>

      {subtitle && <span className="titlebar-subtitle">{subtitle}</span>}

      {showControls && (
        <div className="titlebar-controls">
          <button
            type="button"
            aria-label="Minimize"
            title="Minimize"
            onClick={() => window.electronAPI.minimizeWindow()}
          >
            <MinimizeIcon />
          </button>

          <button
            type="button"
            aria-label="Close"
            title="Close"
            className="titlebar-close"
            onClick={() => window.electronAPI.quitApp()}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </header>
  );
}

export default TitleBar;
