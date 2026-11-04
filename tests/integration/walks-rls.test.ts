/**
 * PLAN.md §4, Test 1 — Data isolation (runs against the REAL Supabase database, no mocks).
 *
 * Given User A has logged a 2.0-mile walk with Luna,
 * when User B logs in and loads the walks list (and requests User A's walk by ID),
 * then User B sees zero walks and the direct request returns nothing.
 *
 * Uses only the public anon key + normal logins, exactly like the browser does,
 * so row-level security is what's being tested. Never use the service-role key here:
 * it bypasses RLS and would make this test meaningless.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { estimateCalories } from "@/lib/calories";

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

const TEST_DOG_NAME = "RLS Test Dog (Luna)";

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

describe("Data isolation: User B can't see User A's walks (real Supabase RLS)", () => {
  const userA = newClient();
  const userB = newClient();
  let userBId = "";
  let walkId = 0;
  let dogId = 0;

  beforeAll(async () => {
    const userAId = await logIn(userA, env.RLS_TEST_A_EMAIL, env.RLS_TEST_A_PASSWORD);
    userBId = await logIn(userB, env.RLS_TEST_B_EMAIL, env.RLS_TEST_B_PASSWORD);
    expect(userAId).not.toBe(userBId);

    // Clean up anything left behind by an earlier run that crashed (deleting the dog cascades to its walks).
    await userA.from("dogs").delete().eq("name", TEST_DOG_NAME);

    // GIVEN: User A has a 65 lb dog and has logged a 2.0-mile walk with her.
    const dog = await userA
      .from("dogs")
      .insert({ user_id: userAId, name: TEST_DOG_NAME, breed: "German Shepherd", weight_lb: 65 })
      .select("id")
      .single();
    if (dog.error) throw new Error(`User A couldn't add a dog: ${dog.error.message}`);
    dogId = dog.data.id;

    const walk = await userA
      .from("walks")
      .insert({
        user_id: userAId,
        dog_id: dogId,
        walked_on: "2026-11-01",
        distance_mi: 2.0,
        duration_min: 40,
        calories_est: estimateCalories(65, 2.0),
        notes: "RLS isolation test walk",
        source: "manual",
      })
      .select("id")
      .single();
    if (walk.error) throw new Error(`User A couldn't log a walk: ${walk.error.message}`);
    walkId = walk.data.id;
  });

  afterAll(async () => {
    // User A cleans up their own test data (deleting the dog also deletes its walks).
    if (dogId) await userA.from("dogs").delete().eq("id", dogId);
    await userA.auth.signOut();
    await userB.auth.signOut();
  });

  it("sanity check: User A can see their own walk (so the test can't pass by accident)", async () => {
    const { data, error } = await userA.from("walks").select("id, distance_mi").eq("id", walkId);
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(Number(data![0].distance_mi)).toBe(2);
  });

  it("User B's walks list is empty", async () => {
    const { data, error } = await userB.from("walks").select("id, user_id");
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("User B requesting User A's walk by ID gets nothing", async () => {
    const { data, error } = await userB.from("walks").select("*").eq("id", walkId).maybeSingle();
    expect(error).toBeNull();
    expect(data).toBeNull();
  });

  it("User B can't see User A's dog either", async () => {
    const { data, error } = await userB.from("dogs").select("id").eq("id", dogId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it("User B can't edit or delete User A's walk", async () => {
    const update = await userB.from("walks").update({ notes: "changed by B" }).eq("id", walkId).select("id");
    expect(update.data ?? []).toEqual([]);

    const del = await userB.from("walks").delete().eq("id", walkId).select("id");
    expect(del.data ?? []).toEqual([]);

    // Confirm from User A's side that the walk is untouched.
    const { data } = await userA.from("walks").select("notes").eq("id", walkId).single();
    expect(data?.notes).toBe("RLS isolation test walk");
  });

  it("User B can't log a walk against User A's dog", async () => {
    const { error } = await userB.from("walks").insert({
      user_id: userBId,
      dog_id: dogId,
      walked_on: "2026-11-01",
      distance_mi: 1,
      duration_min: 20,
      calories_est: 52,
      source: "manual",
    });
    expect(error).not.toBeNull(); // blocked by the "walks for their own dogs" policy
  });
});
