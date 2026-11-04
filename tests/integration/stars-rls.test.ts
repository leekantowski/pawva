/**
 * Feature 5 — stars privacy (runs against the REAL Supabase database, no mocks).
 *
 * Given User A has starred their own walk,
 * when User B logs in,
 * then User B can't see A's star, can't remove it, and can't star A's walk.
 * Also: the "Starred" view query only returns walks the user has starred.
 *
 * Same setup as walks-rls.test.ts: anon key + normal logins, so row-level security is what's tested.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const REQUIRED_ENV = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "RLS_TEST_A_EMAIL",
  "RLS_TEST_A_PASSWORD",
  "RLS_TEST_B_EMAIL",
  "RLS_TEST_B_PASSWORD",
] as const;

// Fail loudly (don't skip): a skipped privacy test would look like a pass.
const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
if (missing.length > 0) {
  throw new Error(`Missing env vars for the RLS test: ${missing.join(", ")}. See tests/integration/README.md.`);
}
const env = Object.fromEntries(REQUIRED_ENV.map((name) => [name, process.env[name]!])) as Record<
  (typeof REQUIRED_ENV)[number],
  string
>;

// Different from walks-rls.test.ts so the two files never clean up each other's data.
const TEST_DOG_NAME = "RLS Stars Test Dog";

function newClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function logIn(client: SupabaseClient, email: string, password: string) {
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error || !data.user) throw new Error(`Couldn't log in as ${email}: ${error?.message}`);
  return data.user.id;
}

describe("Stars: users only see and change their own stars (real Supabase RLS)", () => {
  const userA = newClient();
  const userB = newClient();
  let userAId = "";
  let userBId = "";
  let dogId = 0;
  let starredWalkId = 0;
  let plainWalkId = 0;

  beforeAll(async () => {
    userAId = await logIn(userA, env.RLS_TEST_A_EMAIL, env.RLS_TEST_A_PASSWORD);
    userBId = await logIn(userB, env.RLS_TEST_B_EMAIL, env.RLS_TEST_B_PASSWORD);

    // Clean up leftovers from a crashed run (deleting the dog cascades to its walks and their stars).
    await userA.from("dogs").delete().eq("name", TEST_DOG_NAME);

    const dog = await userA
      .from("dogs")
      .insert({ user_id: userAId, name: TEST_DOG_NAME, weight_lb: 65 })
      .select("id")
      .single();
    if (dog.error) throw new Error(`User A couldn't add a dog: ${dog.error.message}`);
    dogId = dog.data.id;

    const walks = await userA
      .from("walks")
      .insert([
        { user_id: userAId, dog_id: dogId, walked_on: "2026-11-02", distance_mi: 3, duration_min: 60, calories_est: 156, notes: "starred" },
        { user_id: userAId, dog_id: dogId, walked_on: "2026-11-03", distance_mi: 1, duration_min: 20, calories_est: 52, notes: "not starred" },
      ])
      .select("id, notes");
    if (walks.error) throw new Error(`User A couldn't log walks: ${walks.error.message}`);
    starredWalkId = walks.data.find((w) => w.notes === "starred")!.id;
    plainWalkId = walks.data.find((w) => w.notes === "not starred")!.id;

    // GIVEN: User A stars one of their walks.
    const star = await userA.from("stars").insert({ user_id: userAId, walk_id: starredWalkId });
    if (star.error) throw new Error(`User A couldn't star their walk: ${star.error.message}`);
  });

  afterAll(async () => {
    if (dogId) await userA.from("dogs").delete().eq("id", dogId);
    await userA.auth.signOut();
    await userB.auth.signOut();
  });

  it("sanity check: User A sees their own star", async () => {
    const { data, error } = await userA.from("stars").select("walk_id").eq("walk_id", starredWalkId);
    expect(error).toBeNull();
    expect(data).toEqual([{ walk_id: starredWalkId }]);
  });

  it("User A's Starred view shows only the starred walk", async () => {
    const { data, error } = await userA
      .from("walks")
      .select("id, stars!inner(walk_id)")
      .in("id", [starredWalkId, plainWalkId]);
    expect(error).toBeNull();
    expect(data?.map((w) => w.id)).toEqual([starredWalkId]);
  });

  it("starring the same walk twice is rejected (one star per user per walk)", async () => {
    const { error } = await userA.from("stars").insert({ user_id: userAId, walk_id: starredWalkId });
    expect(error?.code).toBe("23505"); // unique violation
  });

  it("User B can't see User A's star", async () => {
    const { data, error } = await userB.from("stars").select("walk_id, user_id").eq("walk_id", starredWalkId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("User B can't remove User A's star", async () => {
    const del = await userB.from("stars").delete().eq("walk_id", starredWalkId).select("walk_id");
    expect(del.data ?? []).toEqual([]);

    const { data } = await userA.from("stars").select("walk_id").eq("walk_id", starredWalkId);
    expect(data).toHaveLength(1); // still there
  });

  it("User B can't star User A's walk", async () => {
    const { error } = await userB.from("stars").insert({ user_id: userBId, walk_id: plainWalkId });
    expect(error).not.toBeNull(); // blocked by "Users can star their own walks"
  });

  it("User A can unstar their walk", async () => {
    const del = await userA.from("stars").delete().eq("walk_id", starredWalkId).select("walk_id");
    expect(del.data).toEqual([{ walk_id: starredWalkId }]);
  });
});
