import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logOut } from "@/app/auth/actions";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pawva",
  description: "A dog-walk log with calorie estimates.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#2f5d3a" };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body>
        <header className="topbar">
          <Link href={user ? "/walks" : "/"} className="brand">
            🐕 Pawva
          </Link>
          {user ? (
            <nav className="nav">
              <Link href="/walks">Walks</Link>
              <Link href="/dogs">Dogs</Link>
              <form action={logOut}>
                <button type="submit" className="btn btn-ghost">
                  Log out
                </button>
              </form>
            </nav>
          ) : (
            <nav className="nav">
              <Link href="/login">Log in</Link>
              <Link href="/signup" className="btn btn-primary btn-sm">
                Sign up
              </Link>
            </nav>
          )}
        </header>
        {children}
      </body>
    </html>
  );
}
