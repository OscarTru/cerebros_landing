"use client"
import { AlertTriangle, FileCode } from "lucide-react"
import { useConfirm } from "@/components/ui/ConfirmDialog"

interface Props {
  value: string
  onChange: (v: string) => void
}

// Plantilla "Esponjosos" completa, con placeholders:
//   {{unsubscribe_url}} → lo reemplaza el backend al enviar (renderCustom).
//   Links y textos los editas tú directamente en el HTML.
const EL_PRIVADO_TEMPLATE = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Esponjosos · Cerebros Esponjosos</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: #F0EFED; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; color: #1a1a1a; }
  a { color: inherit; text-decoration: none; }
  .wrapper { background-color: #F0EFED; padding: 40px 20px 60px; }
  .container { max-width: 600px; margin: 0 auto; }
  .cover { background-color: #1a1a1a; padding: 52px 48px 48px; }
  .cover-eyebrow { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 10px; }
  .cover-badge { display: inline-block; border: 1px solid rgba(255,255,255,0.2); border-radius: 100px; padding: 5px 16px; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 32px; }
  .cover-headline { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 400; line-height: 1.2; color: #ffffff; margin-bottom: 8px; }
  .cover-headline em { font-style: italic; color: rgba(255,255,255,0.45); }
  .cover-divider { border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 28px 0; }
  .cover-intro { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: rgba(255,255,255,0.6); }
  .body-wrap { background-color: #ffffff; }
  .article-section { padding: 44px 48px 40px; border-bottom: 1px solid #EBEBEB; }
  .section-tag { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #BBBBBB; margin-bottom: 18px; }
  .article-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.28; color: #1a1a1a; margin-bottom: 18px; display: block; }
  .article-excerpt { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: #555555; margin-bottom: 10px; }
  .article-excerpt strong { font-weight: 500; color: #1a1a1a; }
  .article-meta { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #BBBBBB; margin-bottom: 24px; }
  .article-cta { display: inline-block; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: #1a1a1a; border-bottom: 1px solid #1a1a1a; padding-bottom: 2px; letter-spacing: 0.02em; }
  .news-section { padding: 40px 48px; border-bottom: 1px solid #EBEBEB; }
  .news-item { padding: 20px 0; border-top: 1px solid #F0F0F0; }
  .news-item:first-of-type { border-top: none; padding-top: 0; }
  .news-source { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #C0C0C0; margin-bottom: 7px; }
  .news-title { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 400; color: #1a1a1a; line-height: 1.38; margin-bottom: 8px; display: block; }
  .news-text { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; line-height: 1.72; color: #666666; }
  .idea-section { padding: 40px 48px; background-color: #F8F7F5; border-bottom: 1px solid #EBEBEB; }
  .idea-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: #BBBBBB; margin-bottom: 20px; }
  .idea-quote { font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-style: italic; font-weight: 400; line-height: 1.6; color: #1a1a1a; border-left: 2px solid #1a1a1a; padding-left: 20px; margin: 0; }
  .sign-section { padding: 40px 48px 44px; }
  .sign-text { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; color: #666666; line-height: 1.78; margin-bottom: 24px; }
  .sign-name { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 400; color: #1a1a1a; }
  .sign-role { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 300; color: #AAAAAA; margin-top: 3px; }
  .footer { padding: 32px 0 20px; text-align: center; border-top: 1px solid #D0CECA; }
  .footer-link { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: #AAAAAA; text-decoration: none; margin: 0 10px; }
  .footer-fine { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: #C4C4C4; line-height: 1.7; margin-top: 14px; }
  .footer-unsub { color: #C4C4C4; text-decoration: underline; }
  @media only screen and (max-width: 480px) {
    .cover { padding: 40px 28px 36px; }
    .cover-headline { font-size: 28px; }
    .article-section, .news-section, .idea-section, .sign-section { padding-left: 28px; padding-right: 28px; }
  }
</style>
</head>
<body>
<div class="wrapper"><div class="container">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:28px 0; border-bottom:1px solid #D0CECA;">
    <tr>
      <td></td>
      <td style="text-align:right;"><span style="font-family:'Inter',sans-serif;font-size:11px;font-weight:300;color:#AAAAAA;">FECHA</span></td>
    </tr>
  </table>

  <div class="cover">
    <p class="cover-eyebrow">Edición N.º X</p>
    <div class="cover-badge">· Esponjosos ·</div>
    <h1 class="cover-headline">Tu titular principal<br/><em>en segunda línea en italic</em></h1>
    <hr class="cover-divider" />
    <p class="cover-intro">Breve resumen de lo que viene en esta edición.</p>
  </div>

  <div class="body-wrap">

    <div class="article-section">
      <p class="section-tag">Artículo de fondo</p>
      <a href="https://..." class="article-title" style="color:#1a1a1a;text-decoration:none;">Título del artículo</a>
      <p class="article-excerpt">Primer párrafo con contexto. Puedes usar <strong>negrita</strong> y <em>italic</em>.</p>
      <p class="article-excerpt">Segundo párrafo con más detalle.</p>
      <p class="article-meta">Por Oscar Trujillo &nbsp;·&nbsp; X min de lectura</p>
      <a href="https://..." class="article-cta" style="color:#1a1a1a;text-decoration:none;border-bottom:1px solid #1a1a1a;">Leer artículo completo →</a>
    </div>

    <div class="news-section">
      <p class="section-tag" style="margin-bottom:24px;">Lo que pasó esta semana</p>

      <div class="news-item">
        <p class="news-source">Fuente · Año</p>
        <a href="https://..." class="news-title" style="color:#1a1a1a;text-decoration:none;">Titular de la noticia</a>
        <p class="news-text">Descripción de 2-3 líneas.</p>
      </div>

      <div class="news-item">
        <p class="news-source">Fuente · Año</p>
        <a href="https://..." class="news-title" style="color:#1a1a1a;text-decoration:none;">Segundo titular</a>
        <p class="news-text">Descripción.</p>
      </div>

      <div class="news-item">
        <p class="news-source">Fuente · Año</p>
        <a href="https://..." class="news-title" style="color:#1a1a1a;text-decoration:none;">Tercer titular</a>
        <p class="news-text">Descripción.</p>
      </div>
    </div>

    <div class="idea-section">
      <p class="idea-label">Una idea para llevar</p>
      <blockquote class="idea-quote">Frase memorable que resume la edición.</blockquote>
    </div>

    <div class="sign-section">
      <p class="sign-text">Gracias por leer.<br/><br/>Hasta el próximo lunes.</p>
      <p class="sign-name">Oscar &amp; Stephanie</p>
      <p class="sign-role">Cerebros Esponjosos</p>
    </div>

  </div>

  <div class="footer">
    <div>
      <a href="https://www.cerebrosesponjosos.com" class="footer-link" style="color:#AAAAAA;text-decoration:none;">Web</a>
      <a href="https://www.cerebrosesponjosos.com/blog" class="footer-link" style="color:#AAAAAA;text-decoration:none;">Blog</a>
      <a href="https://instagram.com/cerebros.esponjosos" class="footer-link" style="color:#AAAAAA;text-decoration:none;">Instagram</a>
    </div>
    <p class="footer-fine">
      Recibiste este correo porque te suscribiste a Esponjosos.<br/>
      <a href="{{unsubscribe_url}}" class="footer-unsub" style="color:#C4C4C4;text-decoration:underline;">Darse de baja</a> &nbsp;·&nbsp; Cerebros Esponjosos
    </p>
  </div>

</div></div>
</body>
</html>`

export function HtmlEditor({ value, onChange }: Props) {
  const confirm = useConfirm()

  async function loadTemplate() {
    if (value.trim()) {
      const ok = await confirm({
        title: "Cargar plantilla Esponjosos",
        description: "Esto reemplaza tu HTML actual. Se perderá lo escrito en este modo.",
        confirmLabel: "Cargar plantilla",
      })
      if (!ok) return
    }
    onChange(EL_PRIVADO_TEMPLATE)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-[12px] text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
        <p>
          Modo avanzado: si tu HTML empieza con <code>&lt;html&gt;</code>, se envía tal cual (solo se reemplaza
          <code> {"{{unsubscribe_url}}"}</code> por el link real). Si es un fragmento, se envuelve con el layout estándar.
          Los links heredan color negro automáticamente.
        </p>
      </div>
      <div className="flex justify-end">
        <button
          onClick={loadTemplate}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-[var(--c-border)] bg-[var(--c-surface-2)] text-[12px] font-medium text-[var(--c-text-muted)] hover:bg-[var(--c-surface-3)]"
        >
          <FileCode className="h-3.5 w-3.5" />
          Usar plantilla &ldquo;Esponjosos&rdquo;
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={"<h1>Tu título</h1>\n<p>Tu HTML aquí...</p>"}
        className="w-full resize-y rounded-2xl border border-[var(--c-border)] bg-[var(--c-surface)] p-4 text-[12px] font-mono text-[var(--c-text)] placeholder:text-[var(--c-text-faint)] outline-none min-h-[420px]"
      />
    </div>
  )
}
