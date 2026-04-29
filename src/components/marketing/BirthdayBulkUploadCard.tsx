import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Download, Loader2, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  onUploaded?: () => void;
}

interface ParsedRow {
  name: string;
  email: string;
  nric_number: string;
  phone: string | null;
  birth_date: string; // YYYY-MM-DD
  birth_mmdd: string; // MM-DD
  program_name: string;
  key_skills: string | null;
  derived_from_nric?: boolean;
  mismatch_warning?: string;
}

interface RowError {
  row: number;
  reason: string;
  data: any;
}

const REQUIRED = ['name', 'email', 'nric_number', 'program_name'];
const TEMPLATE_HEADERS = ['name', 'email', 'nric_number', 'phone', 'birth_date', 'program_name', 'key_skills'];

const pad = (n: number) => n.toString().padStart(2, '0');

function deriveBirthFromNRIC(nric: string): string | null {
  const digits = (nric || '').replace(/\D/g, '');
  if (digits.length < 6) return null;
  const yy = parseInt(digits.slice(0, 2), 10);
  const mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);
  if (isNaN(yy) || isNaN(mm) || isNaN(dd)) return null;
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const candidates = [1900 + yy, 2000 + yy];
  const valid: number[] = [];
  for (const yyyy of candidates) {
    const d = new Date(yyyy, mm - 1, dd);
    if (
      d.getFullYear() === yyyy &&
      d.getMonth() === mm - 1 &&
      d.getDate() === dd
    ) {
      const age = currentYear - yyyy;
      if (age >= 0 && age <= 100 && d.getTime() <= today.getTime()) {
        valid.push(yyyy);
      }
    }
  }
  if (!valid.length) return null;
  // Prefer 19YY when both valid (typical working age)
  const chosen = valid.includes(1900 + yy) ? 1900 + yy : valid[0];
  return `${chosen}-${pad(mm)}-${pad(dd)}`;
}

function normalizeDate(input: any): string | null {
  if (input == null || input === '') return null;
  // Excel serial number
  if (typeof input === 'number') {
    const d = XLSX.SSF.parse_date_code(input);
    if (!d) return null;
    return `${d.y}-${pad(d.m)}-${pad(d.d)}`;
  }
  const s = String(input).trim();
  // YYYY-MM-DD
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  // DD/MM/YYYY or D/M/YYYY
  m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${pad(+m[2])}-${pad(+m[1])}`;
  // YYYY/MM/DD
  m = s.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (m) return `${m[1]}-${pad(+m[2])}-${pad(+m[3])}`;
  // Fallback Date parse
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`;
  }
  return null;
}

const BirthdayBulkUploadCard: React.FC<Props> = ({ onUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<RowError[]>([]);
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const sample = [
      TEMPLATE_HEADERS,
      ['Jane Doe', 'jane@example.com', '900101-01-5555', '0123456789', '1990-01-01', 'Sample Program', 'Marketing'],
      ['Ali Bin Ahmad', 'ali@example.com', '880315085123', '0198887777', '', 'Sample Program', 'Operations'],
    ];
    const csv = sample.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'birthday_upload_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setParsing(true);
    setRows([]);
    setErrors([]);
    try {
      const buf = await f.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array', cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<any>(ws, { defval: '' });

      if (json.length === 0) throw new Error('No rows found');
      const headers = Object.keys(json[0]).map(h => h.trim().toLowerCase());
      const missing = REQUIRED.filter(c => !headers.includes(c));
      if (missing.length) throw new Error(`Missing columns: ${missing.join(', ')}`);

      const valid: ParsedRow[] = [];
      const errs: RowError[] = [];

      json.forEach((raw, i) => {
        const r: any = {};
        Object.keys(raw).forEach(k => { r[k.trim().toLowerCase()] = raw[k]; });
        const rowNum = i + 2; // +2 for header + 1-index

        const name = String(r.name ?? '').trim();
        const email = String(r.email ?? '').trim();
        const nric = String(r.nric_number ?? '').trim();
        const programName = String(r.program_name ?? '').trim();
        const explicitDate = normalizeDate(r.birth_date);
        const nricDate = nric ? deriveBirthFromNRIC(nric) : null;
        const dateStr = explicitDate || nricDate;
        const derivedFromNric = !explicitDate && !!nricDate;
        const mismatch =
          explicitDate && nricDate && explicitDate !== nricDate
            ? `birth_date (${explicitDate}) differs from NRIC-derived (${nricDate})`
            : undefined;

        if (!name) return errs.push({ row: rowNum, reason: 'Missing name', data: raw });
        if (!email || !email.includes('@')) return errs.push({ row: rowNum, reason: 'Invalid email', data: raw });
        if (!nric) return errs.push({ row: rowNum, reason: 'Missing nric_number', data: raw });
        if (!programName) return errs.push({ row: rowNum, reason: 'Missing program_name', data: raw });
        if (!dateStr) return errs.push({ row: rowNum, reason: 'birth_date missing and could not derive from NRIC', data: raw });

        const [, mm, dd] = dateStr.split('-');
        valid.push({
          name,
          email: email.toLowerCase(),
          nric_number: nric,
          phone: r.phone ? String(r.phone).trim() : null,
          birth_date: dateStr,
          birth_mmdd: `${mm}-${dd}`,
          program_name: programName,
          key_skills: r.key_skills ? String(r.key_skills).trim() : null,
          derived_from_nric: derivedFromNric,
          mismatch_warning: mismatch,
        });
      });

      setRows(valid);
      setErrors(errs);
      const derivedCount = valid.filter(v => v.derived_from_nric).length;
      toast({
        title: 'File parsed',
        description: `${valid.length} valid${derivedCount ? ` (${derivedCount} auto-derived from NRIC)` : ''}, ${errs.length} errors`,
      });
    } catch (err: any) {
      toast({ title: 'Parse failed', description: err.message, variant: 'destructive' });
      setFile(null);
    } finally {
      setParsing(false);
    }
  };

  const downloadErrors = () => {
    const header = ['row', 'reason', ...TEMPLATE_HEADERS];
    const lines = [header.join(',')];
    errors.forEach(e => {
      const data = e.data || {};
      const cells = [e.row, e.reason, ...TEMPLATE_HEADERS.map(h => data[h] ?? '')];
      lines.push(cells.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','));
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'birthday_upload_errors.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const resolveProgramId = async (programName: string, cache: Map<string, string>) => {
    if (cache.has(programName)) return cache.get(programName)!;
    const { data: existing } = await supabase
      .from('programs')
      .select('id')
      .eq('title', programName)
      .maybeSingle();
    if (existing?.id) { cache.set(programName, existing.id); return existing.id; }
    const { data: created, error } = await supabase
      .from('programs')
      .insert({ title: programName })
      .select('id')
      .single();
    if (error) throw error;
    cache.set(programName, created.id);
    return created.id;
  };

  const handleUpload = async () => {
    if (!rows.length) return;
    setUploading(true);
    try {
      // Duplicate check by (email, birth_mmdd)
      const emails = Array.from(new Set(rows.map(r => r.email)));
      const { data: existing } = await supabase
        .from('participants_bday_duplicate')
        .select('email, birth_mmdd')
        .in('email', emails);
      const existingSet = new Set((existing || []).map((r: any) => `${r.email}|${r.birth_mmdd}`));

      const cache = new Map<string, string>();
      const toInsert: any[] = [];
      let skipped = 0;

      for (const r of rows) {
        const key = `${r.email}|${r.birth_mmdd}`;
        if (existingSet.has(key)) { skipped++; continue; }
        existingSet.add(key);
        const program_id = await resolveProgramId(r.program_name, cache);
        toInsert.push({
          name: r.name,
          email: r.email,
          nric_number: r.nric_number,
          phone: r.phone,
          birth_date: r.birth_date,
          birth_mmdd: r.birth_mmdd,
          program_name: r.program_name,
          program_id,
          key_skills: r.key_skills,
          email_sent: false,
        });
      }

      let inserted = 0;
      const insertErrors: string[] = [];
      const BATCH = 200;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const chunk = toInsert.slice(i, i + BATCH);
        const { error } = await supabase.from('participants_bday_duplicate').insert(chunk);
        if (error) { insertErrors.push(error.message); }
        else { inserted += chunk.length; }
      }

      toast({
        title: 'Upload complete',
        description: `Inserted ${inserted}, skipped ${skipped} duplicates${insertErrors.length ? `, ${insertErrors.length} batch errors` : ''}`,
        variant: insertErrors.length ? 'destructive' : 'default',
      });

      setFile(null); setRows([]); setErrors([]);
      const input = document.getElementById('birthday-bulk-file') as HTMLInputElement | null;
      if (input) input.value = '';
      onUploaded?.();
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Bulk Upload Birthday List
        </CardTitle>
        <CardDescription>
          Upload a CSV/XLSX file. Records sync directly with the birthday backend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-1" /> Download Template
          </Button>
        </div>

        <div>
          <Label htmlFor="birthday-bulk-file">File (.csv, .xlsx, .xls)</Label>
          <Input
            id="birthday-bulk-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFile}
            disabled={parsing || uploading}
          />
        </div>

        <div className="rounded-md border border-border bg-muted/40 p-3 text-xs space-y-1">
          <p className="font-medium">Required columns:</p>
          <p className="text-muted-foreground">
            name, email, nric_number, phone, <strong>birth_date</strong> (YYYY-MM-DD), program_name, key_skills
          </p>
          <p className="text-muted-foreground">
            Duplicate check uses email + birthday. New programs are auto-created.
          </p>
        </div>

        {file && (
          <div className="text-sm">
            <p><strong>{file.name}</strong></p>
            <p className="text-muted-foreground">
              {rows.length} valid · {errors.length} errors
            </p>
            {rows.slice(0, 3).map((r, i) => (
              <p key={i} className="text-xs text-muted-foreground truncate">
                • {r.name} — {r.email} — {r.birth_date} — {r.program_name}
              </p>
            ))}
            {errors.length > 0 && (
              <Button type="button" variant="link" size="sm" className="px-0 h-auto" onClick={downloadErrors}>
                Download error report
              </Button>
            )}
          </div>
        )}

        <Button
          type="button"
          onClick={handleUpload}
          disabled={!rows.length || uploading || parsing}
          className="w-full"
        >
          {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
          Upload {rows.length > 0 ? `${rows.length} records` : ''}
        </Button>
      </CardContent>
    </Card>
  );
};

export default BirthdayBulkUploadCard;
