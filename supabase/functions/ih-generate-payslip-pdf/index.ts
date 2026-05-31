// Doc 4.2 §32–§38 — Generate per-staff payslip PDF, store privately,
// link via ih_payslips.pdf_path. Never throws (caller is fire-and-forget).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { authenticate, corsHeaders, jsonError } from "../_shared/auth.ts";

interface Body { payslip_id: string }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405, headers: corsHeaders });
  }

  let body: Body;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400, headers: corsHeaders });
  }
  if (!body.payslip_id) {
    return new Response(JSON.stringify({ error: "missing_payslip_id" }), { status: 400, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: ps, error: psErr } = await supabase
    .from("ih_payslips")
    .select("*")
    .eq("id", body.payslip_id)
    .maybeSingle();

  if (psErr || !ps) {
    return new Response(JSON.stringify({ error: "payslip_not_found" }), { status: 404, headers: corsHeaders });
  }

  try {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const draw = (txt: string, x: number, y: number, opts?: { size?: number; bold?: boolean; color?: [number, number, number] }) => {
      page.drawText(txt, {
        x, y,
        size: opts?.size ?? 11,
        font: opts?.bold ? bold : font,
        color: opts?.color ? rgb(...opts.color) : rgb(0.1, 0.1, 0.1),
      });
    };

    let y = 800;
    draw("AIHQ — Payslip", 40, y, { size: 20, bold: true }); y -= 22;
    draw("CONFIDENTIAL — Internal Use Only", 40, y, { size: 9, color: [0.6, 0, 0] }); y -= 28;

    draw(`Staff:`, 40, y, { bold: true }); draw(String(ps.staff_name ?? ''), 140, y); y -= 16;
    draw(`Period:`, 40, y, { bold: true }); draw(String(ps.month ?? ''), 140, y); y -= 16;
    draw(`Finalized:`, 40, y, { bold: true });
    draw(new Date(ps.finalized_at ?? ps.created_at ?? Date.now()).toLocaleDateString('en-MY'), 140, y);
    y -= 30;

    // Earnings / deductions table
    draw("Description", 40, y, { bold: true });
    draw("Amount (MYR)", 420, y, { bold: true });
    y -= 6;
    page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    y -= 16;

    const rows: Array<[string, number]> = [
      ["Base Salary", Number(ps.base_salary ?? 0)],
      ["Claims", Number(ps.claims_total ?? 0)],
      ["Training Claims", Number(ps.training_total ?? 0)],
      ["EPF (deduction)", -Number(ps.epf ?? 0)],
      ["SOCSO (deduction)", -Number(ps.socso ?? 0)],
    ];
    const adj = ps.adjustment as { amount?: number; reason?: string } | null;
    if (adj?.amount) rows.push([`Adjustment (${adj.reason ?? ''})`, Number(adj.amount)]);

    for (const [label, amt] of rows) {
      draw(label, 40, y);
      draw(amt.toFixed(2), 420, y);
      y -= 16;
    }
    y -= 6;
    page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
    y -= 18;
    draw("Net Pay", 40, y, { bold: true, size: 13 });
    draw(Number(ps.net_pay ?? 0).toFixed(2), 420, y, { bold: true, size: 13 });

    draw(`Generated ${new Date().toISOString()}`, 40, 40, { size: 8, color: [0.5, 0.5, 0.5] });
    draw(`AIHQ Staff Portal — system@theaihq.net`, 40, 28, { size: 8, color: [0.5, 0.5, 0.5] });

    const bytes = await pdf.save();
    const path = `${ps.staff_id}/${ps.id}.pdf`;

    const { error: upErr } = await supabase.storage
      .from("payslips")
      .upload(path, bytes, { contentType: "application/pdf", upsert: true });
    if (upErr) throw upErr;

    await supabase.from("ih_payslips").update({
      pdf_path: path,
      pdf_generated_at: new Date().toISOString(),
      pdf_error: null,
    }).eq("id", ps.id);

    return new Response(JSON.stringify({ ok: true, path }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await supabase.from("ih_payslips").update({
      pdf_error: msg.slice(0, 500),
    }).eq("id", ps.id);
    return new Response(JSON.stringify({ ok: false, error: msg }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
