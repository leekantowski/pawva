import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/walks");

  return (
    <main className="container narrow">
      <section className="card hero">
        <p className="eyebrow">🐕 Luna Miles</p>
        <h1>Every walk counts.</h1>
        <p>Log your dog&apos;s walks and see an estimate of the calories they burned.</p>
        <div className="actions">
          <Link href="/signup" className="btn btn-primary">
            Sign up
          </Link>
          <Link href="/login" className="btn btn-secondary">
            Log in
          </Link>
        </div>
      </section>
    </main>
  );
}
