import { layout } from "../layout"

export function renderWelcome(ctx: { email: string }): string {
  const body = `
    <span class="badge" style="margin-top:32px; display:inline-block;">· Esponjosos ·</span>
    <div class="hero">
      <h1>Bienvenido.</h1>
      <div class="italic" style="margin-top:4px;">Ya eres parte.</div>
    </div>
    <div class="card">
      <p class="label">Una nota personal</p>
      <p class="quote">Esto no es una newsletter de salud.<br>Es una conversación sobre tu cerebro.</p>
      <p class="p">Cada semana te mandamos una pieza larga — un artículo, un experimento, una idea que nos tiene pensando — y un par de noticias curadas para que tengas contexto real, no clickbait.</p>
      <p class="p">Si algo te rebota, nos contestas este correo. Lo leemos los dos.</p>
    </div>
    <div class="card">
      <p class="label">Qué encontrarás cada semana</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">01.</em> Un artículo de fondo sobre cerebro y comportamiento.</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">02.</em> Tres noticias curadas desde revistas científicas.</p>
      <p class="p"><em style="font-family:'Instrument Serif',serif;font-size:20px;">03.</em> Una idea para llevarte todo el día pensando.</p>
    </div>
    <p class="p" style="font-family:'Instrument Serif',serif;font-style:italic;font-size:16px;margin-top:32px;">— Oscar & Stephanie<br><span style="color:#71717a;">Cerebros Esponjosos</span></p>
    <div style="text-align:center;margin-top:32px;">
      <a href="https://cerebrosesponjosos.com" class="cta">Visitar la web →</a>
    </div>
  `
  return layout({
    title: "Bienvenido a Esponjosos",
    email: ctx.email,
    preheader: "Bienvenido a Cerebros Esponjosos — ya eres parte.",
    bodyHtml: body,
  })
}
