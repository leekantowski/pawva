import { possessive, type LifetimeTotals } from "@/lib/dashboard/lifetime";

/** "Luna’s lifetime totals": miles, estimated calories, estimated steps, walks. */
export default function LifetimeCard({ totals: t }: { totals: LifetimeTotals }) {
  const id = `lifetime-${t.dogId}`;
  return (
    <section className="card lifetime-card" aria-labelledby={id}>
      <h2 id={id} className="lifetime-title">
        🐾 {possessive(t.dogName)} lifetime totals
      </h2>
      <dl className="lifetime-grid">
        <div>
          <dt>Miles</dt>
          <dd>{t.miles.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Calories (est.)</dt>
          <dd>{t.calories.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Steps (est.)</dt>
          <dd>{t.steps.toLocaleString("en-US")}</dd>
        </div>
        <div>
          <dt>Walks</dt>
          <dd>{t.walks.toLocaleString("en-US")}</dd>
        </div>
      </dl>
    </section>
  );
}
