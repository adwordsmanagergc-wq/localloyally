const cell = (v: unknown) => {
  let s = v == null ? '' : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // stop spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export function csvResponse(filename: string, head: string[], rows: unknown[][]) {
  const csv = [head.join(','), ...rows.map((r) => r.map(cell).join(','))].join('\n');
  return new Response(csv, {
    headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${filename}"` },
  });
}
