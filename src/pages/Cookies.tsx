import { LegalLayout } from "./LegalLayout"

const CONTACT = "hola@cerebrosesponjosos.com"

export function Cookies() {
  return (
    <LegalLayout title="Política de Cookies" updated="12 de abril de 2026">
      <Section title="1. ¿Qué son las cookies?">
        <p>
          Las <b>cookies</b> son pequeños archivos de texto que se guardan en tu navegador cuando visitas un sitio web. Permiten que el sitio recuerde información sobre ti (preferencias, comportamiento) en futuras visitas.
        </p>
        <p>
          Este sitio también utiliza <b>almacenamiento local</b> (<i>localStorage</i>), que funciona de manera similar a las cookies pero se queda exclusivamente en tu dispositivo y no se envía al servidor en cada solicitud.
        </p>
      </Section>

      <Section title="2. Almacenamiento técnico necesario (sin consentimiento)">
        <p>
          Usamos <i>localStorage</i> para recordar tus preferencias de navegación. Estos datos nunca se envían a terceros y son estrictamente necesarios para que el sitio funcione correctamente.
        </p>
        <Table
          headers={["Clave", "Propósito", "Duración", "Origen"]}
          rows={[
            ["theme", "Recordar si prefieres modo claro u oscuro", "Indefinida (hasta que borres datos)", "Cerebros Esponjosos"],
            ["ce_cookie_consent", "Guardar tus preferencias de consentimiento de cookies", "Indefinida (hasta que borres datos)", "Cerebros Esponjosos"],
          ]}
        />
        <p>
          <b>Base legal:</b> RGPD Art. 6(1)(f) — interés legítimo en funcionalidad básica del sitio.
        </p>
      </Section>

      <Section title="3. Cookies analíticas (requieren consentimiento)">
        <p>
          Si aceptas las cookies analíticas, cargamos <b>Google Analytics 4</b> (ID: G-2FGB8YCMLX), un servicio de Google LLC (EE.UU.). Este servicio coloca las siguientes cookies:
        </p>
        <Table
          headers={["Cookie", "Propósito", "Duración", "Tercero"]}
          rows={[
            ["_ga", "Distinguir usuarios únicos", "2 años", "Google LLC (EE.UU.)"],
            ["_ga_2FGB8YCMLX", "Mantener el estado de sesión en GA4", "2 años", "Google LLC (EE.UU.)"],
          ]}
        />
        <p>
          <b>Datos recopilados por Google Analytics:</b>
        </p>
        <ul>
          <li>Páginas visitadas y tiempo en cada página</li>
          <li>Tipo de dispositivo y navegador</li>
          <li>Ubicación aproximada (país/ciudad, nunca dirección exacta)</li>
          <li>Fuente de tráfico (búsqueda, redes sociales, acceso directo)</li>
        </ul>
        <p>
          Los datos se procesan en servidores de Google en EE.UU. bajo el marco EU-U.S. Data Privacy Framework.
        </p>
        <p>
          <b>Base legal:</b> RGPD Art. 6(1)(a) — consentimiento explícito.
          <br />
          <b>Política de privacidad de Google:</b>{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            policies.google.com/privacy
          </a>
          <br />
          <b>Opt-out global de Google Analytics:</b>{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
            tools.google.com/dlpage/gaoptout
          </a>
        </p>
        <p>
          Google Analytics <b>solo se carga si aceptas</b> las cookies analíticas en el banner de consentimiento. Si rechazas o cierras el banner, ningún script de Google se ejecuta en tu navegador.
        </p>
      </Section>

      <Section title="4. Newsletter — Resend y Supabase">
        <p>
          Si te suscribes a nuestro newsletter, tu dirección de email se almacena de la siguiente manera:
        </p>
        <Table
          headers={["Servicio", "Propósito", "Datos almacenados", "Ubicación"]}
          rows={[
            ["Supabase", "Base de datos de suscriptores", "Email, fecha de suscripción", "Servidores en EE.UU. (AWS us-east-1)"],
            ["Resend", "Envío de emails transaccionales y newsletter", "Email, estado de suscripción", "Servidores en EE.UU."],
          ]}
        />
        <p>
          <b>Importante:</b> La suscripción al newsletter <b>no utiliza cookies</b>. Tu email se guarda directamente en nuestra base de datos cuando completas el formulario y das tu consentimiento explícito.
        </p>
        <p>
          Los emails pueden incluir un <b>pixel de seguimiento</b> (imagen invisible) que nos permite saber si el email fue abierto. Puedes desactivar la carga automática de imágenes en tu cliente de email para evitar esto.
        </p>
        <p>
          <b>Base legal:</b> RGPD Art. 6(1)(a) — consentimiento al suscribirse.
          <br />
          Puedes darte de baja en cualquier momento usando el enlace al final de cada email o escribiéndonos a{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
        <p>
          <b>Política de Resend:</b>{" "}
          <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">
            resend.com/legal/privacy-policy
          </a>
          <br />
          <b>Política de Supabase:</b>{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            supabase.com/privacy
          </a>
        </p>
      </Section>

      <Section title="5. Contenido de terceros (Instagram)">
        <p>
          Mostramos enlaces a contenido de <b>Instagram</b>. El sitio no incrusta iframes de Instagram — solo enlazamos a publicaciones externas, por lo que Instagram no coloca cookies en tu navegador al visitar esta página.
        </p>
        <p>
          Si haces clic en un enlace y visitas Instagram, se aplica la política de cookies de Meta:{" "}
          <a href="https://help.instagram.com/519522125107165" target="_blank" rel="noopener noreferrer">
            help.instagram.com/519522125107165
          </a>
        </p>
      </Section>

      <Section title="6. Tu consentimiento y cómo gestionarlo">
        <p>
          Al entrar al sitio por primera vez, aparece un banner que te permite:
        </p>
        <ul>
          <li><b>Aceptar todas</b> — Habilitas almacenamiento técnico y Google Analytics</li>
          <li><b>Personalizar</b> — Eliges qué categorías aceptas</li>
          <li><b>Rechazar</b> — Solo almacenamiento técnico necesario (tema y preferencias de cookies)</li>
        </ul>
        <p>
          Tu elección se guarda en <i>localStorage</i> bajo la clave <code>ce_cookie_consent</code>. Para cambiar tu elección, borra los datos del sitio en tu navegador:
        </p>
        <ul>
          <li><b>Chrome:</b> Configuración → Privacidad → Configuración del sitio → cerebrosesponjosos.com → Borrar datos</li>
          <li><b>Firefox:</b> Preferencias → Privacidad → Cookies y datos del sitio → Gestionar datos</li>
          <li><b>Safari:</b> Preferencias → Privacidad → Gestionar datos del sitio web</li>
          <li><b>Edge:</b> Configuración → Privacidad → Cookies → Ver todas las cookies</li>
        </ul>
        <p>Al borrar los datos, el banner de consentimiento aparecerá de nuevo.</p>
      </Section>

      <Section title="7. ¿Qué pasa si rechazas las cookies?">
        <p>El sitio funciona con total normalidad. Puedes leer artículos, suscribirte al newsletter y usar todas las funciones. La única diferencia es que no recopilamos datos de Google Analytics sobre tu visita.</p>
        <p><b>No penalizamos el rechazo.</b></p>
      </Section>

      <Section title="8. Cambios en esta política">
        <p>
          Si cambiamos los servicios que usamos o la forma en que procesamos datos, actualizaremos esta página. Cambios significativos se comunicarán por email a los suscriptores.
        </p>
      </Section>

      <Section title="9. Contacto">
        <p>Para cualquier pregunta sobre cookies o privacidad:</p>
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
          <b>Versión:</b> 2.0 · <b>Efectiva desde:</b> 12 de abril de 2026 ·{" "}
          <b>Próxima revisión:</b> 12 de octubre de 2026
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
