import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { buildEventPayload, buildSummary } from "./index.ts";

Deno.test("summary uses staff name and type label only", () => {
  assertEquals(buildSummary("Aisha Tan", "leave"), "Aisha Tan — Leave");
  assertEquals(buildSummary("Aisha Tan", "mc"), "Aisha Tan — MC");
});

Deno.test("full-day event uses date (no time) and exclusive end", () => {
  const ev = buildEventPayload(
    { type: "leave", start_date: "2026-06-01", end_date: "2026-06-03", half_day_slot: null },
    "Aisha Tan",
  );
  assertEquals((ev as any).start.date, "2026-06-01");
  assertEquals((ev as any).end.date, "2026-06-04"); // exclusive
});

Deno.test("half-day morning event uses 09:00-13:00 MYT", () => {
  const ev = buildEventPayload(
    { type: "leave", start_date: "2026-06-01", half_day_slot: "morning" },
    "Aisha Tan",
  );
  assertEquals((ev as any).start.dateTime, "2026-06-01T09:00:00");
  assertEquals((ev as any).end.dateTime, "2026-06-01T13:00:00");
});

Deno.test("payload never leaks reason / medical / attachments", () => {
  const ev = buildEventPayload(
    {
      type: "mc",
      start_date: "2026-06-01",
      end_date: "2026-06-01",
      reason: "flu and fever",
      notes: "medical certificate from Dr X",
      attachments: ["https://example.com/mc.pdf"],
    },
    "Aisha Tan",
  );
  const json = JSON.stringify(ev).toLowerCase();
  assert(!json.includes("reason"));
  assert(!json.includes("medical"));
  assert(!json.includes("flu"));
  assert(!json.includes("dr x"));
  assert(!json.includes("mc.pdf"));
  // description must not be present
  assert(!("description" in (ev as any)));
});
