export const PALETTE = {
  bg: "#F0EFED",
  dark: "#1a1a1a",
  surface: "#ffffff",
  surfaceAlt: "#F8F7F5",
  border: "#EBEBEB",
  borderSoft: "#F0F0F0",
  borderFooter: "#D0CECA",
  textPrimary: "#1a1a1a",
  textMuted: "#555555",
  textSubtle: "#666666",
  textFaint: "#AAAAAA",
  textVeryFaint: "#BBBBBB",
  textGhost: "#C4C4C4",
  accent: "#1a1a1a",
  darkOverlayBright: "rgba(255,255,255,0.6)",
  darkOverlayMuted: "rgba(255,255,255,0.45)",
  darkOverlayDim: "rgba(255,255,255,0.35)",
  darkOverlayFaint: "rgba(255,255,255,0.2)",
  darkOverlayLine: "rgba(255,255,255,0.1)",
}

// CSS base para emails.
// Usa Playfair Display para titulares y Inter para texto.
// Crítico: todos los <a> heredan el color del padre para evitar el azul por defecto.
export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Inter:wght@300;400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background-color: ${PALETTE.bg}; font-family: 'Inter', -apple-system, sans-serif; -webkit-font-smoothing: antialiased; color: ${PALETTE.textPrimary}; }
  a { color: inherit; text-decoration: none; }
  table { border-collapse: collapse; }
  img { border: 0; line-height: 100%; outline: none; text-decoration: none; }

  .wrapper { background-color: ${PALETTE.bg}; padding: 40px 20px 60px; }
  .container { max-width: 600px; margin: 0 auto; }

  .header-row { padding: 28px 0; border-bottom: 1px solid ${PALETTE.borderFooter}; }
  .header-date { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: ${PALETTE.textFaint}; }

  .cover { background-color: ${PALETTE.dark}; padding: 52px 48px 48px; }
  .cover-eyebrow { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: ${PALETTE.darkOverlayDim}; margin-bottom: 10px; }
  .cover-badge { display: inline-block; border: 1px solid ${PALETTE.darkOverlayFaint}; border-radius: 100px; padding: 5px 16px; font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: ${PALETTE.darkOverlayMuted}; margin-bottom: 32px; }
  .cover-headline { font-family: 'Playfair Display', Georgia, serif; font-size: 36px; font-weight: 400; line-height: 1.2; color: #ffffff; margin-bottom: 8px; }
  .cover-headline em { font-style: italic; color: ${PALETTE.darkOverlayMuted}; }
  .cover-divider { border: none; border-top: 1px solid ${PALETTE.darkOverlayLine}; margin: 28px 0; }
  .cover-intro { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: ${PALETTE.darkOverlayBright}; }

  .body-wrap { background-color: ${PALETTE.surface}; }

  .article-section { padding: 44px 48px 40px; border-bottom: 1px solid ${PALETTE.border}; }
  .section-tag { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: ${PALETTE.textVeryFaint}; margin-bottom: 18px; }
  .article-title { font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 400; line-height: 1.28; color: ${PALETTE.textPrimary}; margin-bottom: 18px; display: block; text-decoration: none; }
  .article-excerpt { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.8; color: ${PALETTE.textMuted}; margin-bottom: 10px; }
  .article-excerpt strong { font-weight: 500; color: ${PALETTE.textPrimary}; }
  .article-excerpt em { font-style: italic; }
  .article-meta { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: ${PALETTE.textVeryFaint}; margin-bottom: 24px; }
  .article-cta { display: inline-block; font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: ${PALETTE.textPrimary}; border-bottom: 1px solid ${PALETTE.textPrimary}; padding-bottom: 2px; letter-spacing: 0.02em; text-decoration: none; }

  .blog-promo { padding: 36px 48px; border-bottom: 1px solid ${PALETTE.border}; background-color: ${PALETTE.surface}; }
  .blog-title { display: block; font-family: 'Playfair Display', Georgia, serif; font-size: 21px; font-weight: 400; line-height: 1.3; color: ${PALETTE.textPrimary}; text-decoration: none; margin-bottom: 12px; }
  .blog-excerpt { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; line-height: 1.72; color: ${PALETTE.textSubtle}; margin-bottom: 20px; }

  .news-section { padding: 40px 48px; border-bottom: 1px solid ${PALETTE.border}; }
  .news-header { margin-bottom: 28px; }
  .news-count { font-family: 'Playfair Display', Georgia, serif; font-size: 13px; font-style: italic; color: #CCCCCC; }
  .news-item { padding: 20px 0; border-top: 1px solid ${PALETTE.borderSoft}; }
  .news-item:first-of-type { border-top: none; padding-top: 0; }
  .news-source { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: #C0C0C0; margin-bottom: 7px; }
  .news-title { font-family: 'Playfair Display', Georgia, serif; font-size: 17px; font-weight: 400; color: ${PALETTE.textPrimary}; line-height: 1.38; margin-bottom: 8px; display: block; text-decoration: none; }
  .news-text { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; line-height: 1.72; color: ${PALETTE.textSubtle}; }
  .news-text em { font-style: italic; }

  .cta-dark { padding: 40px 48px; border-bottom: 1px solid ${PALETTE.border}; background-color: ${PALETTE.dark}; }
  .cta-dark-eyebrow { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 16px; }
  .cta-dark-title { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 400; line-height: 1.25; color: #ffffff; margin-bottom: 10px; }
  .cta-dark-desc { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 300; line-height: 1.72; color: rgba(255,255,255,0.55); margin-bottom: 28px; }
  .cta-dark-btn { display: inline-block; background-color: #ffffff; color: ${PALETTE.textPrimary}; font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 14px 32px; text-decoration: none; }

  .idea-section { padding: 40px 48px; background-color: ${PALETTE.surfaceAlt}; border-bottom: 1px solid ${PALETTE.border}; }
  .idea-label { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.2em; text-transform: uppercase; color: ${PALETTE.textVeryFaint}; margin-bottom: 20px; }
  .idea-quote { font-family: 'Playfair Display', Georgia, serif; font-size: 19px; font-style: italic; font-weight: 400; line-height: 1.6; color: ${PALETTE.textPrimary}; border-left: 2px solid ${PALETTE.textPrimary}; padding-left: 20px; margin: 0; }

  .sign-section { padding: 40px 48px 44px; }
  .sign-text { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; color: ${PALETTE.textSubtle}; line-height: 1.78; margin-bottom: 24px; }
  .sign-name { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 400; color: ${PALETTE.textPrimary}; }
  .sign-role { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 300; color: ${PALETTE.textFaint}; margin-top: 3px; }

  .footer { padding: 32px 0 20px; text-align: center; border-top: 1px solid ${PALETTE.borderFooter}; }
  .footer-link { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 400; color: ${PALETTE.textFaint}; text-decoration: none; margin: 0 10px; }
  .footer-fine { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 300; color: ${PALETTE.textGhost}; line-height: 1.7; margin-top: 14px; }
  .footer-unsub { color: ${PALETTE.textGhost}; text-decoration: underline; }

  /* Free markdown section (from toolbar / markdown mode) — inherits dark text, no blue */
  .free-md { padding: 40px 48px; border-bottom: 1px solid ${PALETTE.border}; background-color: ${PALETTE.surface}; color: ${PALETTE.textPrimary}; }
  .free-md h2 { font-family: 'Playfair Display', Georgia, serif; font-size: 22px; font-weight: 400; color: ${PALETTE.textPrimary}; margin: 20px 0 12px; }
  .free-md p { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.78; color: ${PALETTE.textSubtle}; margin: 10px 0; }
  .free-md strong { font-weight: 500; color: ${PALETTE.textPrimary}; }
  .free-md em { font-style: italic; }
  .free-md a { color: ${PALETTE.textPrimary}; border-bottom: 1px solid ${PALETTE.textPrimary}; }
  .free-md ul { padding-left: 22px; margin: 10px 0; }
  .free-md li { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 300; line-height: 1.78; color: ${PALETTE.textSubtle}; margin: 6px 0; }

  @media only screen and (max-width: 480px) {
    .cover { padding: 40px 28px 36px; }
    .cover-headline { font-size: 28px; }
    .article-section, .news-section, .idea-section, .sign-section, .blog-promo, .cta-dark, .free-md { padding-left: 28px !important; padding-right: 28px !important; }
  }
`
