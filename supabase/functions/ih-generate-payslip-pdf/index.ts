// Doc 4.2 §32–§38 — Generate per-staff payslip PDF, store privately,
// link via ih_payslips.pdf_path. Never throws (caller is fire-and-forget).
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";
import { authenticate, corsHeaders, jsonError } from "../_shared/auth.ts";

interface Body { payslip_id: string }

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return jsonError(405, "method_not_allowed");

  const auth = await authenticate(req);
  if (!auth.ok) return jsonError(auth.status, auth.error);

  let body: Body;
  try { body = await req.json(); } catch {
    return jsonError(400, "invalid_json");
  }
  if (!body.payslip_id) return jsonError(400, "missing_payslip_id");

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: ps, error: psErr } = await supabase
    .from("ih_payslips")
    .select("*")
    .eq("id", body.payslip_id)
    .maybeSingle();

  if (psErr || !ps) return jsonError(404, "payslip_not_found");

  // Allow admins/service callers; otherwise the caller must be the payslip owner.
  if (!auth.isAdmin && !auth.isService && ps.staff_id !== auth.userId) {
    return jsonError(403, "forbidden");
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
    draw("AIHQ", 40, y, { size: 14, bold: true }); y -= 18;
    draw(`Salary Statement for ${String(ps.month ?? '')}`, 40, y, { size: 18, bold: true }); y -= 20;
    draw("CONFIDENTIAL — Internal Use Only", 40, y, { size: 9, color: [0.6, 0, 0] }); y -= 24;

    // Staff Info
    draw("Staff Info", 40, y, { bold: true, size: 11 }); y -= 14;
    draw(`Name:`, 40, y); draw(String(ps.staff_name ?? ''), 160, y); y -= 14;
    draw(`Payroll Month:`, 40, y); draw(String(ps.month ?? ''), 160, y); y -= 14;
    draw(`Finalized:`, 40, y);
    draw(new Date(ps.finalized_at ?? ps.created_at ?? Date.now()).toLocaleDateString('en-MY'), 160, y);
    y -= 22;

    const hr = () => {
      page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 0.5, color: rgb(0.75, 0.75, 0.75) });
      y -= 14;
    };
    const section = (title: string) => {
      y -= 4;
      draw(title, 40, y, { bold: true, size: 11 }); y -= 6; hr();
    };
    const line = (label: string, amt: number, opts?: { bold?: boolean }) => {
      draw(label, 40, y, { bold: !!opts?.bold });
      draw(amt.toFixed(2), 460, y, { bold: !!opts?.bold });
      y -= 14;
    };

    const n = (v: unknown) => Number(v ?? 0);
    const basic = n(ps.base_salary);
    const claims = n(ps.claims_total);
    const training = n(ps.training_total);
    const bonus = n(ps.bonus_total);
    const other = n(ps.other_addition_total);
    const epf = n(ps.epf), socso = n(ps.socso), eis = n(ps.eis);
    const empDed = n(ps.total_employee_deductions) || (epf + socso + eis);
    const erEpf = n(ps.employer_epf), erSocso = n(ps.employer_socso), erEis = n(ps.employer_eis);
    const empCon = n(ps.total_employer_contribution) || (erEpf + erSocso + erEis);
    const additions = claims + training + bonus + other;
    const adj = (ps.adjustment as { amount?: number; reason?: string } | null);

    // Income
    section("Income");
    line("Basic Salary", basic);
    line("Total Income", basic, { bold: true });

    // Claims / Reimbursements / Bonus
    if (additions > 0) {
      section("Claims / Reimbursements / Bonus");
      if (claims > 0) line("Claim", claims);
      if (training > 0) line("Training Claim", training);
      if (bonus > 0) line("Bonus", bonus);
      if (other > 0) line("Other Reimbursement / Addition", other);
      line("Subtotal", additions, { bold: true });
    }

    // Employee Deductions
    section("Employee Deductions");
    line("EPF", -epf);
    line("SOCSO", -socso);
    line("EIS", -eis);
    line("Total Employee Deductions", -empDed, { bold: true });

    if (adj?.amount) {
      section("Manual Adjustment");
      line(`Adjustment (${adj.reason ?? ''})`, Number(adj.amount));
    }

    // Net Pay
    y -= 6;
    page.drawLine({ start: { x: 40, y }, end: { x: 555, y }, thickness: 1, color: rgb(0.2, 0.2, 0.2) });
    y -= 16;
    draw("Net Pay", 40, y, { bold: true, size: 13 });
    draw(Number(ps.net_pay ?? 0).toFixed(2), 460, y, { bold: true, size: 13 });
    y -= 22;

    // Employer Contributions
    section("Employer Contributions");
    line("Employer EPF", erEpf);
    line("Employer SOCSO", erSocso);
    line("Employer EIS", erEis);
    line("Total Employer Contribution", empCon, { bold: true });
    y -= 4;
    draw("Employer contributions are shown for transparency and do not reduce Net Pay.",
      40, y, { size: 8, color: [0.45, 0.45, 0.45] });

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
