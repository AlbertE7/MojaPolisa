/**
 * Szablony HTML email. Wszystkie używają inline-CSS aby działać poprawnie w Gmail/Outlook.
 * Brand: granat (#1e3a8a) + złoty (#f5b500).
 */

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
  color: #1f2937; line-height: 1.55;
`

export function shell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pl"><head><meta charset="utf-8" /><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;${BASE_STYLES}">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05)">
        <tr><td style="background:linear-gradient(135deg,#1e3a8a,#1a2870);padding:24px 32px;color:#fff">
          <div style="font-size:20px;font-weight:bold">MojaPolisa</div>
          <div style="font-size:12px;opacity:0.8;margin-top:2px">Ubezpieczenia Online · Finvita</div>
        </td></tr>
        <tr><td style="padding:32px">${body}</td></tr>
        <tr><td style="background:#f9fafb;padding:20px 32px;font-size:11px;color:#6b7280;border-top:1px solid #e5e7eb">
          Administrator danych: EPRO Sp. z o.o., ul. Mikołajska 25, 02-455 Warszawa.
          Kontakt z IOD: <a href="mailto:iod@epropolska.pl" style="color:#1e3a8a">iod@epropolska.pl</a><br>
          Nie odpowiadaj na ten email – jest wysyłany automatycznie. W razie pytań skontaktuj się z agentem.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function fieldRow(label: string, value: string | number | undefined | null): string {
  if (value === undefined || value === null || value === '') return ''
  return `<tr><td style="padding:6px 12px;background:#f9fafb;font-weight:600;color:#374151;width:40%;border-bottom:1px solid #e5e7eb">${label}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #e5e7eb">${String(value)}</td></tr>`
}

export function fieldTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin:8px 0">${rows}</table>`
}

export function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:#f5b500;border-radius:8px;padding:0">
    <a href="${href}" style="display:inline-block;padding:12px 24px;color:#1e3a8a;font-weight:700;text-decoration:none;font-size:14px">${label}</a>
  </td></tr></table>`
}
