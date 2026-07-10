"use client";

const MULHOUSE_INSEE = "68224";

/** Dimensions officielles `.widget_standard` (widget.css Atmo Grand Est) */
const WIDGET_STANDARD_WIDTH = 320;
const WIDGET_STANDARD_HEIGHT = 200;

/** Widget officiel Atmo Grand Est (iframe), en complément de la carte native */
export default function AtmoWidget() {
  return (
    <div
      className="glass-card overflow-hidden shrink-0 max-w-full leading-none"
      style={{ width: WIDGET_STANDARD_WIDTH }}
    >
      <iframe
        src={`https://services.atmo-grandest.eu/widget/standard/commune/${MULHOUSE_INSEE}`}
        title="Widget qualité de l'air Atmo Grand Est - Mulhouse"
        width={WIDGET_STANDARD_WIDTH}
        height={WIDGET_STANDARD_HEIGHT}
        frameBorder="0"
        scrolling="no"
        className="block"
        style={{ border: "none" }}
        loading="lazy"
      />
    </div>
  );
}
