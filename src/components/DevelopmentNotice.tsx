import { siteConfig } from "../lib/siteConfig";

export default function DevelopmentNotice() {
  const { label, message, supporting } = siteConfig.developmentNotice;

  return (
    <aside
      className="development-notice"
      role="note"
      aria-label={siteConfig.accessibility.developmentNoticeLabel}
    >
      <div className="portal-container development-notice__inner">
        <span className="development-notice__label">{label}</span>
        <p className="development-notice__message">
          {message} <span className="development-notice__supporting">{supporting}</span>
        </p>
      </div>
    </aside>
  );
}
