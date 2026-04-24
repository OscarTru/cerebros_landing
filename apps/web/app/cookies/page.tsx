import type { Metadata } from "next"
import { LegalLayout } from "@/layouts/LegalLayout"

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Política de cookies de Cerebros Esponjosos, conforme al RGPD.",
}

const CONTACT = "contacto@cerebrosesponjosos.com"

export default function CookiesPage() {
  return (
    <LegalLayout title="Política de Cookies" updated="9 de abril de 2026">
      <Section title="1. ¿Qué son las Cookies?">
        <p>
          Las <b>cookies</b> son pequeños archivos de texto que se guardan en
          tu navegador cuando visitas un sitio web. Permiten que el sitio
          recuerde información sobre ti (preferencias, login, comportamiento)
          en futuras visitas.
        </p>
        <p>Tipos de cookies:</p>
        <Table
          headers={["Tipo", "Duración", "Propósito", "Requiere consentimiento"]}
          rows={[
            ["Sesión", "Hasta cerrar navegador", "Mantener login, carrito", "No (técnicamente necesarias)"],
            ["Persistentes", "Días/meses/años", "Recordar preferencias", "Depende del propósito"],
            ["Primera parte", "Variable", "Creadas por el sitio", "No si son técnicas"],
            ["Terceros", "Variable", "Analytics, publicidad", "Sí (RGPD)"],
          ]}
        />
      </Section>

      <Section title="2. Cookies Usadas en Cerebros Esponjosos">
        <SubSection title="2.1 Cookies Técnicas (NECESARIAS — sin consentimiento)">
          <p>Estas permiten que el sitio funcione:</p>
          <Table
            headers={["Cookie", "Propósito", "Duración", "Origen"]}
            rows={[
              ["session_id", "Mantener tu sesión activa", "1 hora", "Cerebros Esponjosos"],
              ["language_preference", "Recordar tu idioma (ES/EN)", "1 año", "Cerebros Esponjosos"],
              ["theme_mode", "Recordar tema (claro/oscuro)", "1 año", "Cerebros Esponjosos"],
              ["csrf_token", "Protección contra ataques", "1 sesión", "Cerebros Esponjosos"],
            ]}
          />
          <p>
            <b>Base legal:</b> RGPD Art. 6(1)(f) — interés legítimo en
            seguridad y funcionalidad.
            <br />
            <b>Ubicación:</b> Almacenadas en tu navegador (no enviadas a
            terceros).
          </p>
        </SubSection>

        <SubSection title="2.2 Cookies Analíticas (OPCIONAL — requiere consentimiento RGPD)">
          <p>Utilizadas para entender cómo interactúas con el sitio:</p>
          <Table
            headers={["Cookie", "Propósito", "Duración", "Tercero"]}
            rows={[
              ["_ga", "Identificar usuario único en Google Analytics", "2 años", "Google LLC (EE.UU.)"],
              ["_ga_XXXXXXXXXX", "Rastrear sesión en GA", "2 años", "Google LLC (EE.UU.)"],
              ["_gid", "Identificar sesión diaria en GA", "24 horas", "Google LLC (EE.UU.)"],
              ["_gat", "Regular frecuencia de solicitudes a GA", "1 minuto", "Google LLC (EE.UU.)"],
            ]}
          />
          <p>
            <b>Datos compartidos:</b>
          </p>
          <ul>
            <li>Páginas visitadas</li>
            <li>Tiempo en página</li>
            <li>Dispositivo (móvil/desktop)</li>
            <li>Ubicación aproximada (país/ciudad)</li>
            <li>Fuente de tráfico (Google/Instagram/directo)</li>
            <li>Eventos (clicks, scroll depth)</li>
          </ul>
          <p>
            <b>Base legal:</b> RGPD Art. 6(1)(a) — consentimiento explícito.
            <br />
            <b>Política de Google:</b>{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/privacy
            </a>
          </p>
        </SubSection>

        <SubSection title="2.3 Cookies de Email Marketing (OPCIONAL)">
          <p>Si te suscribes a nuestro newsletter:</p>
          <Table
            headers={["Cookie", "Propósito", "Duración", "Tercero"]}
            rows={[
              ["email_consent", "Recordar que aceptaste newsletter", "2 años", "Cerebros Esponjosos"],
              ["mailchimp_id / convertkit_id", "Vincular email a tu perfil", "2 años", "Mailchimp / ConvertKit (EE.UU.)"],
              ["Email tracking pixel", "Saber si abriste/clickeaste email", "1 sesión", "Mailchimp / ConvertKit"],
            ]}
          />
          <p>
            <b>Nota:</b> El "pixel de rastreo" es una imagen invisible en
            emails que detecta si los abriste. Puedes desactivar esto en tu
            navegador.
          </p>
          <p>
            <b>Base legal:</b> RGPD Art. 6(1)(a) — consentimiento al
            suscribirse.
          </p>
        </SubSection>
      </Section>

      <Section title="3. Cookies de Terceros (Redes Sociales)">
        <p>
          Si interactúas con contenido de <b>Instagram</b> o <b>TikTok</b>{" "}
          (comentarios, likes, shares):
        </p>
        <ul>
          <li>Instagram/TikTok colocan sus propias cookies</li>
          <li>Nosotros no controlamos esas cookies</li>
          <li>
            Lee la política de Instagram:{" "}
            <a
              href="https://help.instagram.com/519522125107165"
              target="_blank"
              rel="noopener noreferrer"
            >
              help.instagram.com/519522125107165
            </a>
          </li>
          <li>
            Lee la política de TikTok:{" "}
            <a
              href="https://www.tiktok.com/legal/page/global/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              tiktok.com/legal/page/global/privacy-policy
            </a>
          </li>
        </ul>
      </Section>

      <Section title="4. Banner de Consentimiento RGPD">
        <p>Al entrar al sitio, ves un banner que permite:</p>
        <ul>
          <li>
            <b>Aceptar todas</b> — Habilitas cookies técnicas + analíticas +
            email
          </li>
          <li>
            <b>Personalizar</b> — Escoges qué tipos aceptas
          </li>
          <li>
            <b>Rechazar</b> — Solo cookies técnicas (necesarias), nada más
          </li>
        </ul>
        <p>
          <b>Cómo funciona:</b>
        </p>
        <ol>
          <li>Tu elección se guarda en una cookie de consentimiento</li>
          <li>No vuelves a ver el banner (a menos que borres cookies)</li>
          <li>Puedes cambiar tu elección en cualquier momento (ver abajo)</li>
        </ol>
      </Section>

      <Section title="5. Cómo Gestionar Tus Cookies">
        <SubSection title="5.1 En Nuestro Sitio">
          <ol>
            <li>
              Ve a <b>Configuración de Privacidad</b> (pie de página o
              ajustes)
            </li>
            <li>Selecciona qué cookies deseas</li>
            <li>
              Haz clic en <b>"Guardar preferencias"</b>
            </li>
          </ol>
          <p>Tu elección se respeta inmediatamente.</p>
        </SubSection>

        <SubSection title="5.2 En Tu Navegador">
          <ul>
            <li>
              <b>Google Chrome:</b> Menú → Configuración → Privacidad →
              Cookies. Puedes ver, buscar y borrar cookies específicas.
            </li>
            <li>
              <b>Firefox:</b> Menú → Preferencias → Privacidad → Cookies.
              Opción: "Eliminar cookies al cerrar Firefox".
            </li>
            <li>
              <b>Safari (Mac):</b> Preferencias → Privacidad → Administrar
              datos del sitio web.
            </li>
            <li>
              <b>Edge:</b> Configuración → Privacidad → Borrar datos de
              exploración.
            </li>
          </ul>
        </SubSection>

        <SubSection title="5.3 Optar por No Participar en Google Analytics">
          <p>
            Instala la extensión de Google:{" "}
            <b>Google Analytics Opt-out Browser Add-on</b>
            <br />
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
          </p>
          <p>
            Esto impide que Google Analytics recopile tus datos en cualquier
            sitio.
          </p>
        </SubSection>
      </Section>

      <Section title="6. ¿Qué Pasa si Rechazas las Cookies?">
        <ul>
          <li>El sitio funcionará normalmente</li>
          <li>
            Puedes navegar, rellenar formularios, suscribirte a newsletter
          </li>
          <li>
            No usaremos Google Analytics (no veremos qué páginas visitas)
          </li>
          <li>Algunas recomendaciones personalizadas serán limitadas</li>
        </ul>
        <p>
          <b>No penalizamos el rechazo.</b> Los usuarios que rechazan
          analytics tienen exactamente la misma experiencia.
        </p>
      </Section>

      <Section title="7. Cookies Persistentes vs. De Sesión">
        <Table
          headers={["Sesión", "Persistente"]}
          rows={[
            ["Se borran al cerrar navegador", "Se guardan después de cerrar"],
            ["Duran 30 min - 1 hora", "Duran días, meses o años"],
            ["Menos privado", "Más cómodo (no reingresas)"],
            ["Ejemplos: login, carrito", "Ejemplos: tema oscuro, idioma"],
          ]}
        />
        <p>
          <b>Nuestra práctica:</b> Usamos cookies persistentes solo para
          comodidad (idioma, tema) y análisis (si aceptas).
        </p>
      </Section>

      <Section title="8. Cambios en Esta Política">
        <p>
          Si Google Analytics, Mailchimp, o ConvertKit cambian sus políticas,
          actualizaremos aquí. Cambios importantes se comunicarán vía email a
          suscriptores.
        </p>
      </Section>

      <Section title="9. Contacto">
        <p>Preguntas sobre cookies:</p>
        <ul>
          <li>
            <b>Email:</b>{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </li>
          <li>
            <b>Web:</b> www.cerebrosesponjosos.com
          </li>
        </ul>
      </Section>

      <div className="mt-16 pt-8 border-t border-[var(--c-border)] text-sm text-[var(--c-text-faint)]">
        <p>
          <b>Versión:</b> 1.0 · <b>Efectiva desde:</b> 9 de abril de 2026 ·{" "}
          <b>Próxima revisión:</b> 9 de octubre de 2026
        </p>
      </div>
    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-medium text-[var(--c-text)] mb-3">{title}</h2>
      <div className="text-[var(--c-text-muted)] space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_a]:underline">
        {children}
      </div>
    </section>
  )
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-medium text-[var(--c-text)] mb-2">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-[var(--c-border)]">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-2 pr-4 font-medium text-[var(--c-text)]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-[var(--c-border)]/50">
              {row.map((cell, j) => (
                <td key={j} className="py-2 pr-4 align-top">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
