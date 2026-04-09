import { LegalLayout } from "./LegalLayout"

export function Cookies() {
  return (
    <LegalLayout title="Política de Cookies" updated="9 de abril de 2026">
      <Section title="1. ¿Qué son las cookies?">
        <p>
          Las cookies son pequeños archivos de texto que un sitio web guarda
          en tu dispositivo cuando lo visitas. Sirven para recordar
          preferencias, mantener sesiones iniciadas, medir audiencia o
          personalizar experiencias.
        </p>
      </Section>

      <Section title="2. Cookies que usamos">
        <p>
          Cerebros Esponjosos utiliza un número mínimo de cookies. Las
          clasificamos así:
        </p>
        <ul>
          <li>
            <b>Estrictamente necesarias:</b> imprescindibles para que el
            Sitio funcione (ej. seguridad, balanceo de carga del hosting).
            No requieren consentimiento.
          </li>
          <li>
            <b>Analíticas:</b> nos permiten entender cómo se usa el Sitio de
            forma agregada y anónima (ej. Plausible Analytics, Google
            Analytics si está activo). Solo se instalan si aceptas.
          </li>
          <li>
            <b>Funcionales:</b> recuerdan preferencias como el idioma o el
            tema. Solo se instalan si aceptas.
          </li>
        </ul>
        <p>
          Actualmente <b>no utilizamos cookies publicitarias ni de
          rastreo entre sitios</b> (tracking de terceros para anuncios).
        </p>
      </Section>

      <Section title="3. Cookies de terceros">
        <p>
          Al incrustar contenido de plataformas externas (YouTube,
          Instagram), estos servicios pueden instalar sus propias cookies
          cuando interactúas con su contenido. Te recomendamos revisar sus
          políticas:
        </p>
        <ul>
          <li>
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google / YouTube
            </a>
          </li>
          <li>
            <a
              href="https://privacycenter.instagram.com/policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta / Instagram
            </a>
          </li>
        </ul>
      </Section>

      <Section title="4. Cómo gestionar tus cookies">
        <p>
          Puedes aceptar o rechazar cookies desde el banner que aparece la
          primera vez que visitas el Sitio (si está activado). Además, puedes
          bloquearlas o eliminarlas desde la configuración de tu navegador:
        </p>
        <ul>
          <li>Chrome: Configuración → Privacidad y seguridad → Cookies.</li>
          <li>Safari: Preferencias → Privacidad.</li>
          <li>Firefox: Ajustes → Privacidad y seguridad.</li>
          <li>Edge: Configuración → Cookies y permisos del sitio.</li>
        </ul>
        <p>
          Ten en cuenta que bloquear cookies estrictamente necesarias puede
          afectar el funcionamiento del Sitio.
        </p>
      </Section>

      <Section title="5. Base legal">
        <p>
          El uso de cookies no esenciales se basa en tu{" "}
          <b>consentimiento previo, libre, específico e informado</b>,
          conforme al GDPR (art. 6.1.a), la Directiva ePrivacy (2002/58/CE)
          y las leyes locales aplicables. Puedes retirar tu consentimiento
          en cualquier momento modificando tus preferencias en el
          navegador.
        </p>
      </Section>

      <Section title="6. Cambios">
        <p>
          Podemos actualizar esta política cuando incorporemos nuevas
          herramientas. La versión vigente siempre será la publicada en
          esta página.
        </p>
      </Section>

      <Section title="7. Contacto">
        <p>
          Dudas sobre cookies:{" "}
          <a href="mailto:contacto@cerebrosesponjosos.com">
            contacto@cerebrosesponjosos.com
          </a>
          .
        </p>
      </Section>
    </LegalLayout>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-medium text-white mb-3">{title}</h2>
      <div className="text-zinc-400 space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_a]:underline">
        {children}
      </div>
    </section>
  )
}
