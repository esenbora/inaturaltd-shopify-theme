import { StatusBadge } from "@/components/dashboard/shell";
import {
  LONG_WINDOW_DAYS,
  WINDOW_DAYS,
  type ChangeMeasurement,
  type SeoChange,
  type Stage,
} from "@/lib/seo-changes";
import { BaselineLine, ComparisonTable } from "./comparison-table";
import { seoDate } from "./format";

/**
 * Why there are no figures for an entry, when the whole measurement is
 * missing rather than just not yet due.
 */
export type FiguresUnavailable = "not-connected" | "unreachable";

function stageBadge(stage: Stage) {
  switch (stage.kind) {
    case "superseded":
      return <StatusBadge kind="wait">Superseded</StatusBadge>;
    case "collecting":
      return (
        <StatusBadge kind="wait">
          Collecting data ({stage.days}/{WINDOW_DAYS} days)
        </StatusBadge>
      );
    case "four-week":
      return <StatusBadge kind="ok">4-week result</StatusBadge>;
    case "twelve-week":
      return <StatusBadge kind="ok">12-week result</StatusBadge>;
  }
}

function FieldRows({ change }: { change: SeoChange }) {
  const fields = [
    { label: "Title", value: change.title },
    { label: "Description", value: change.description },
  ].filter((field) => field.value !== undefined);

  return (
    <dl className="grid gap-x-4 gap-y-1.5 text-sm sm:grid-cols-[7.5rem_minmax(0,1fr)]">
      {fields.map(({ label, value }) => (
        <div key={label} className="contents">
          <dt className="pt-1 text-xs text-muted sm:pt-0.5">{label} before</dt>
          <dd className="text-muted">
            {value!.before === null
              ? "Not recorded"
              : value!.before === ""
                ? "(empty)"
                : value!.before}
          </dd>
          <dt className="pt-1 text-xs text-muted sm:pt-0.5">{label} after</dt>
          <dd className="text-ink">{value!.after}</dd>
        </div>
      ))}
    </dl>
  );
}

function Measurement({ entry }: { entry: ChangeMeasurement }) {
  const { stage } = entry;

  if (stage.kind === "superseded") {
    return (
      <p className="text-sm text-muted">
        Not measured. A later change on {seoDate(stage.byDate)} landed inside
        this one&rsquo;s {WINDOW_DAYS} days, so the two cannot be told apart.
        The measurement restarted from that entry.
      </p>
    );
  }

  if (stage.kind === "collecting") {
    return (
      <div className="space-y-2">
        <p className="text-sm text-muted">
          {stage.days} of {WINDOW_DAYS} days published. The window closes on{" "}
          {seoDate(stage.windowEnds)}, and Search Console publishes a few days
          after that, so the result is not a reading yet.
        </p>
        {entry.short.figures && <BaselineLine figures={entry.short.figures} />}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entry.short.figures && (
        <ComparisonTable figures={entry.short.figures} days={WINDOW_DAYS} />
      )}
      {stage.kind === "four-week" &&
        (stage.longSupersededBy ? (
          <p className="text-xs text-muted">
            No 12-week result: a later change on{" "}
            {seoDate(stage.longSupersededBy)} falls inside the{" "}
            {LONG_WINDOW_DAYS} days.
          </p>
        ) : (
          <p className="text-xs text-muted">
            12-week result: {stage.longDays} of {LONG_WINDOW_DAYS} days
            published, window closes {seoDate(stage.longWindowEnds)}.
          </p>
        ))}
      {stage.kind === "twelve-week" && entry.long.figures && (
        <ComparisonTable figures={entry.long.figures} days={LONG_WINDOW_DAYS} />
      )}
      {stage.kind === "twelve-week" && entry.overlaps.long && (
        <p className="text-xs text-muted">
          The {LONG_WINDOW_DAYS} days before include the change of{" "}
          {seoDate(entry.overlaps.long)}, so the 12-week &ldquo;before&rdquo;
          is partly that version.
        </p>
      )}
    </div>
  );
}

/** One logged change: what, when, by whom, why, and what it did. */
export function ChangeEntry({
  change,
  entry,
  unavailable,
}: {
  change: SeoChange;
  /** Null when the measurement could not be read. */
  entry: ChangeMeasurement | null;
  unavailable: FiguresUnavailable | null;
}) {
  const overlap = entry?.stage.kind !== "superseded" ? entry?.overlaps.short : null;

  return (
    <li className="py-5 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1.5">
        <h3 className="min-w-0 text-sm font-medium text-ink">
          {change.product}
          <span className="block text-xs font-normal text-muted">
            {seoDate(change.date)} · by {change.by}
          </span>
        </h3>
        {entry ? (
          stageBadge(entry.stage)
        ) : (
          <StatusBadge kind="wait">Not measured</StatusBadge>
        )}
      </div>

      <p className="mt-2 max-w-prose text-sm text-muted">{change.reason}</p>

      <div className="mt-3">
        <FieldRows change={change} />
      </div>

      {change.note && (
        <p className="mt-2 text-xs italic text-muted">{change.note}</p>
      )}
      {overlap && (
        <p className="mt-2 text-xs text-muted">
          The {WINDOW_DAYS} days before include the change of {seoDate(overlap)},
          so &ldquo;before&rdquo; is partly that version.
        </p>
      )}

      <div className="mt-4 rounded-lg border border-line bg-cream/60 px-4 py-3">
        {entry ? (
          <Measurement entry={entry} />
        ) : (
          <p className="text-sm text-muted">
            {unavailable === "not-connected"
              ? "Search Console is not connected, so no figures can be measured."
              : "Search Console could not be reached, so the figures are missing for now. The record above is unaffected."}
          </p>
        )}
      </div>
    </li>
  );
}
