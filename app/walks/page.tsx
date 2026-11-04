import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Walks · Pawva" };

// Placeholder for the walk log (feature 3). For now it proves you're logged in.
export default async function WalksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Second layer of protection in case the proxy is ever bypassed.
  if (!user) redirect("/login");

  return (
    <main className="container">
      <section className="card">
        <h1>Your walks</h1>
        <p>
          Logged in as <strong>{user.email}</strong>.
        </p>
        <p className="muted">Walk logging arrives in a later feature. 🐾</p>
      </section>
    </main>
  );
}
