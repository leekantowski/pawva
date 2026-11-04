"use client";

import Link from "next/link";
import { useMemo, useState, useTransition, type ChangeEvent } from "react";
import { importGpxWalks, type ImportResult } from "@/app/walks/import/actions";
import { summarizeGpx } from "@/lib/gpx/parse";
import { buildPreviewRows, MAX_IMPORT_BATCH, type PreviewRow } from "@/lib/gpx/preview";
import { formatPace, formatWalkDate } from "@/lib/walks/form";

type Props = {
  dogs: { id: number; name: string }[];
  existingStartedAt: string[]; // start times of walks already in the database (for "Already imported")
};

/** Lets the browser repaint between files, so a big batch shows progress instead of freezing. */
const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));

export default function GpxImporter({ dogs, existingStartedAt }: Props) {
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [dogId, setDogId] = useState(String(dogs[0]?.id ?? ""));
  const [result, setResult] = useState<ImportResult | null>(null);
  const [saving, startSaving] = useTransition();
  const [imported, setImported] = useState<string[]>([]); // start times saved in this visit

  async function onFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    setResult(null);
    if (files.length === 0) return;

    // Parsed here in the browser: the GPX files are never uploaded, only their summary numbers.
    const parsed = [];
    for (const [i, file] of files.entries()) {
      setProgress(`Reading ${i + 1} of ${files.length}: ${file.name}`);
      await nextFrame();
      try {
        parsed.push({ name: file.name, result: summarizeGpx(await file.text()) });
      } catch {
        parsed.push({ name: file.name, result: { ok: false as const, error: "Couldn't open this file." } });
      }
    }
    parsed.sort((a, b) => sortKey(a.result) - sortKey(b.result)); // oldest workout first
    setRows(buildPreviewRows(parsed, [...existingStartedAt, ...imported]));
    setProgress(null);
  }

  const toggle = (id: string) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, checked: !r.checked } : r)));
  const setAll = (checked: boolean) =>
    setRows((rs) => rs.map((r) => (r.status === "ready" ? { ...r, checked } : r)));

  const selected = useMemo(() => rows.filter((r) => r.checked && r.summary), [rows]);
  const counts = useMemo(() => countBy(rows), [rows]);

  function onImport() {
    const items = selected.map((r) => ({
      startedAt: r.summary!.startedAt,
      distanceMi: r.summary!.distanceMi,
      durationMin: r.summary!.durationMin,
    }));
    startSaving(async () => {
      const res = await importGpxWalks(Number(dogId), items);
      setResult(res);
      if (res.ok) {
        const saved = items.map((i) => i.startedAt);
        setImported((prev) => [...prev, ...saved]);
        // Mark what was just saved, so importing again can't double-save it.
        setRows((rs) =>
          rs.map((r) =>
            r.checked && r.summary && saved.includes(r.summary.startedAt)
              ? { ...r, status: "duplicate", note: "Imported just now", checked: false }
              : r,
          ),
        );
      }
    });
  }

  if (dogs.length === 0) {
    return (
      <section className="card">
        <p>
          First, <Link href="/dogs">add your dog</Link> so imported walks can be tied to them and calories estimated.
        </p>
      </section>
    );
  }

  return (
    <div className="importer">
      <section className="card stack-form">
        <label htmlFor="gpx-files">
          GPX files
          <span className="hint">
            In your Apple Health export, open the <code>workout-routes</code> folder and select the files (you can pick
            many at once). They&apos;re read on this device; only the date, distance and duration are saved.
          </span>
          <input id="gpx-files" type="file" accept=".gpx,application/gpx+xml" multiple onChange={onFiles} />
        </label>
        {progress && (
          <p className="muted" role="status">
            {progress}
          </p>
        )}
      </section>

      {rows.length > 0 && (
        <section className="card">
          <div className="import-head">
            <h2 className="chart-title">Preview</h2>
            <p className="muted import-counts">
              {counts.ready} ready · {counts.duplicate} already imported · {counts.invalid + counts.error} can&apos;t import
            </p>
          </div>
          <p className="muted import-help">
            GPX files don&apos;t say whether a workout was a walk or a run. Untick anything that wasn&apos;t a dog walk.
          </p>

          <div className="table-scroll">
            <table className="import-table">
              <thead>
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      aria-label="Select all ready walks"
                      checked={counts.ready > 0 && rows.every((r) => r.status !== "ready" || r.checked)}
                      onChange={(e) => setAll(e.target.checked)}
                      disabled={counts.ready === 0}
                    />
                  </th>
                  <th scope="col">Date</th>
                  <th scope="col">Start</th>
                  <th scope="col" className="num">Distance</th>
                  <th scope="col" className="num">Duration</th>
                  <th scope="col" className="num">Pace</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className={r.status === "ready" ? "" : "row-muted"}>
                    <td>
                      <input
                        type="checkbox"
                        checked={r.checked}
                        disabled={r.status !== "ready"}
                        onChange={() => toggle(r.id)}
                        aria-label={`Import ${r.fileName}`}
                      />
                    </td>
                    {r.summary ? (
                      <>
                        <td>{formatWalkDate(r.summary.walkedOn)}</td>
                        <td>{r.summary.startTimeLabel}</td>
                        <td className="num">{r.summary.distanceMi} mi</td>
                        <td className="num">{r.summary.durationMin} min</td>
                        <td className="num">{formatPace(r.summary.distanceMi, r.summary.durationMin)}</td>
                      </>
                    ) : (
                      <td colSpan={5} className="file-name">
                        {r.fileName}
                      </td>
                    )}
                    <td>
                      {r.status === "ready" ? (
                        <span className="badge badge-ready">Ready</span>
                      ) : r.status === "duplicate" ? (
                        <span className="badge">{r.note}</span>
                      ) : (
                        <span className="field-error">{r.note}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="import-actions">
            <label htmlFor="import-dog">
              Dog
              <select id="import-dog" value={dogId} onChange={(e) => setDogId(e.target.value)}>
                {dogs.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onImport}
              disabled={saving || selected.length === 0 || selected.length > MAX_IMPORT_BATCH}
            >
              {saving ? "Importing…" : `Import ${selected.length} ${selected.length === 1 ? "walk" : "walks"}`}
            </button>
          </div>
          {selected.length > MAX_IMPORT_BATCH && (
            <p className="field-error">Please select at most {MAX_IMPORT_BATCH} walks at a time.</p>
          )}
        </section>
      )}

      {result && (
        <section className={result.ok ? "success" : "error"} role="status">
          {result.ok ? (
            <>
              Imported {result.imported} {result.imported === 1 ? "walk" : "walks"} 🐾
              {result.skipped > 0 && ` (${result.skipped} skipped as already imported)`}.{" "}
              <Link href="/walks">See your walks</Link>
            </>
          ) : (
            result.error
          )}
        </section>
      )}
    </div>
  );
}

function sortKey(result: ReturnType<typeof summarizeGpx>) {
  return result.ok ? Date.parse(result.summary.startedAt) : Number.MAX_SAFE_INTEGER;
}

function countBy(rows: PreviewRow[]) {
  const counts = { ready: 0, duplicate: 0, invalid: 0, error: 0 };
  for (const r of rows) counts[r.status]++;
  return counts;
}
