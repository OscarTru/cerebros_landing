import type { Metadata } from "next"
import { LegalLayout } from "@/layouts/LegalLayout"

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad de Cerebros Esponjosos, conforme al RGPD y legislación latinoamericana.",
}

const CONTACT = "contacto@cerebrosesponjosos.com"

export default function PrivacidadPage() {
  return (
    <LegalLayout
      title="Política de Privacidad"
      updated="9 de abril de 2026"
    >
      <p className="text-sm text-[var(--c-text-subtle)]">
        Aplicable a www.cerebrosesponjosos.com y canales relacionados.
      </p>

      <Section title="1. Responsable de Datos">
        <p>
          <b>Cerebros Esponjosos</b>
          <br />
          Ubicación legal: Alemania
          <br />
          Contacto de privacidad:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
        <p>
          Conforme al RGPD (UE 2016/679), Ley de Protección de Datos de
          México (LPDP), y Ley de Protección de Datos Personales de Colombia,
          Cerebros Esponjosos es el <b>Responsable del Tratamiento</b> de tus
          Datos Personales.
        </p>
      </Section>

      <Section title="2. Qué Datos Recopilamos y Por Qué">
        <SubSection title="2.1 Formulario de Contacto / Solicitud de Colaboración">
          <p>
            <b>Datos recopilados:</b>
          </p>
          <ul>
            <li>Nombre completo</li>
            <li>Email</li>
            <li>Teléfono (opcional)</li>
            <li>Nombre de empresa/marca</li>
            <li>Descripción del proyecto o solicitud</li>
            <li>País/ubicación</li>
          </ul>
          <p>
            <b>Propósito:</b>
          </p>
          <ul>
            <li>Responder tu consulta</li>
            <li>Enviar propuesta personalizada</li>
            <li>Facturación y contratación</li>
            <li>Contacto de seguimiento</li>
          </ul>
          <p>
            <b>Base legal:</b>
          </p>
          <ul>
            <li>RGPD Art. 6(1)(b): necesario para ejecutar contrato</li>
            <li>
              RGPD Art. 6(1)(f): interés legítimo de responder consultas
            </li>
            <li>LPDP México: consentimiento explícito en el formulario</li>
            <li>LPDP Colombia: consentimiento explícito en el formulario</li>
          </ul>
          <p>
            <b>Duración:</b> Hasta 3 años después de finalizada la relación
            comercial (para fines contables/legales).
          </p>
        </SubSection>

        <SubSection title="2.2 Newsletter / Email Marketing">
          <p>
            <b>Datos recopilados:</b>
          </p>
          <ul>
            <li>Email (obligatorio)</li>
            <li>Nombre (opcional)</li>
            <li>Preferencias de contenido (opcional)</li>
            <li>Historial de aperturas y clicks (vía email tool)</li>
          </ul>
          <p>
            <b>Propósito:</b>
          </p>
          <ul>
            <li>
              Enviar contenido educativo, tips, updates de Cerebros
              Esponjosos
            </li>
            <li>Analizar qué temas interesan a la audiencia</li>
            <li>Invitar a colaboraciones relevantes</li>
          </ul>
          <p>
            <b>Base legal:</b>
          </p>
          <ul>
            <li>RGPD Art. 6(1)(a): consentimiento explícito (opt-in)</li>
            <li>
              Ley ePrivacy: consentimiento previo para email marketing
            </li>
            <li>
              LPDP México/Colombia: consentimiento en formulario de
              suscripción
            </li>
          </ul>
          <p>
            <b>Duración:</b> Mientras permanezcas suscrito. Puedes
            desuscribirte en cualquier momento.
          </p>
        </SubSection>

        <SubSection title="2.3 Google Analytics">
          <p>
            <b>Datos recopilados:</b>
          </p>
          <ul>
            <li>Dirección IP (anonimizada automáticamente)</li>
            <li>Tipo de navegador, sistema operativo, idioma</li>
            <li>País/ciudad (aproximada)</li>
            <li>Páginas visitadas, tiempo en página, tasas de rebote</li>
            <li>Fuente de tráfico (¿cómo llegaste al sitio?)</li>
            <li>Eventos (clicks, descargas, si aplica)</li>
          </ul>
          <p>
            <b>Propósito:</b>
          </p>
          <ul>
            <li>Entender cómo los visitantes usan el sitio</li>
            <li>Identificar contenido más popular</li>
            <li>Mejorar experiencia del usuario</li>
            <li>Diagnóstico técnico</li>
          </ul>
          <p>
            <b>Base legal:</b>
          </p>
          <ul>
            <li>RGPD Art. 6(1)(f): interés legítimo en analítica web</li>
            <li>Consentimiento de cookies (banner RGPD)</li>
          </ul>
          <p>
            <b>Herramienta:</b> Google Analytics (Google LLC, EE.UU.). Datos
            transferidos a servidores de Google en EE.UU. Cláusula de
            Asociado de Datos (DPA) ejecutada. Política de privacidad de
            Google:{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              policies.google.com/privacy
            </a>
            .
          </p>
          <p>
            <b>Duración:</b> 26 meses (retención automática de Google).
          </p>
          <p>
            <b>Cómo optar por no participar:</b> puedes instalar la extensión
            de navegador "Google Analytics Opt-out":{" "}
            <a
              href="https://tools.google.com/dlpage/gaoptout"
              target="_blank"
              rel="noopener noreferrer"
            >
              tools.google.com/dlpage/gaoptout
            </a>
            .
          </p>
        </SubSection>

        <SubSection title="2.4 Cookies Técnicas (Sitio Web)">
          <p>
            <b>Datos:</b> session ID, preferencias de idioma, historial de
            navegación.
          </p>
          <p>
            <b>Propósito:</b>
          </p>
          <ul>
            <li>Mantener tu sesión activa</li>
            <li>Recordar preferencias (idioma, tema oscuro, etc.)</li>
            <li>Protección contra spam/bots</li>
          </ul>
          <p>
            <b>Base legal:</b> RGPD Art. 6(1)(f) — interés legítimo en
            funcionalidad del sitio. No requiere consentimiento (técnicamente
            necesarias).
          </p>
          <p>
            <b>Duración:</b> sesión (hasta cerrar navegador) o máximo 1 año.
          </p>
        </SubSection>

        <SubSection title="2.5 Redes Sociales (Instagram, TikTok)">
          <p>
            <b>Datos:</b> si comentas, das like, o compartes, las plataformas
            recopilan tus datos.
          </p>
          <p>
            <b>Nota importante:</b> Cerebros Esponjosos no controla qué datos
            recopilan Instagram/TikTok. Lee sus políticas de privacidad:
          </p>
          <ul>
            <li>
              Instagram:{" "}
              <a
                href="https://help.instagram.com/519522125107165"
                target="_blank"
                rel="noopener noreferrer"
              >
                help.instagram.com/519522125107165
              </a>
            </li>
            <li>
              TikTok:{" "}
              <a
                href="https://www.tiktok.com/legal/page/global/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
              >
                tiktok.com/legal/page/global/privacy-policy
              </a>
            </li>
          </ul>
        </SubSection>
      </Section>

      <Section title="3. Con Quién Compartimos Tus Datos">
        <SubSection title="3.1 Procesadores de Datos">
          <p>
            Terceros que trabajan con nosotros bajo acuerdos de tratamiento
            (DPA) y cumplen RGPD:
          </p>
          <ul>
            <li>
              <b>Google (Analytics)</b> — IP, navegación, comportamiento.
              Análisis web. EE.UU.
            </li>
            <li>
              <b>Email tool (Mailchimp/ConvertKit)</b> — email, nombre,
              historial. Email marketing. EE.UU.
            </li>
            <li>
              <b>Stripe / Mercado Pago</b> — información de pago (si
              aplica). Procesamiento de pago. EE.UU. / región.
            </li>
            <li>
              <b>Hosting (servidor web)</b> — logs de servidor (IP, request
              URL). Mantener sitio online. Alemania / UE.
            </li>
          </ul>
        </SubSection>

        <SubSection title="3.2 Comparticiones Requeridas Legalmente">
          <ul>
            <li>
              <b>Autoridades fiscales/legales:</b> si lo requiere la ley
              (cumplimiento de obligaciones legales).
            </li>
            <li>
              <b>Abogados/consultores:</b> solo si es necesario para resolver
              disputas.
            </li>
          </ul>
        </SubSection>
      </Section>

      <Section title="4. Transferencias Internacionales de Datos">
        <p>
          Algunos datos se transfieren a <b>EE.UU.</b> (Google Analytics,
          email tool):
        </p>
        <ul>
          <li>
            <b>Google Analytics:</b> Acuerdo de Cláusulas Contractuales
            Estándar (SCC) firmado.
          </li>
          <li>
            <b>Email tool:</b> Acuerdo SCC o Privacy Shield Adequacy.
          </li>
        </ul>
        <p>
          Aunque no existe equivalencia perfecta de protección, aplicamos:
        </p>
        <ul>
          <li>Cifrado en tránsito (HTTPS)</li>
          <li>Anonimización donde es posible</li>
          <li>Limitación mínima de datos</li>
        </ul>
        <p>
          Si no aceptas transferencias a EE.UU., puedes contactarnos para
          opciones alternativas.
        </p>
      </Section>

      <Section title="5. Tus Derechos (RGPD, LPDP México, LPDP Colombia)">
        <p>Tienes derecho a:</p>
        <SubSection title="5.1 Acceso (Art. 15 RGPD / Art. 9 LPDP)">
          <p>Solicitar copias de tus Datos Personales que tenemos.</p>
        </SubSection>
        <SubSection title="5.2 Rectificación (Art. 16 RGPD / Art. 12 LPDP)">
          <p>Corregir datos inexactos o incompletos.</p>
        </SubSection>
        <SubSection title="5.3 Eliminación (Art. 17 RGPD / Art. 8 LPDP)">
          <p>
            Solicitar la eliminación de tus datos ("Derecho al Olvido"),
            salvo obligaciones legales (ej: retención fiscal).
          </p>
        </SubSection>
        <SubSection title="5.4 Restricción (Art. 18 RGPD)">
          <p>
            Limitación del procesamiento de tus datos mientras verificas su
            exactitud.
          </p>
        </SubSection>
        <SubSection title="5.5 Portabilidad (Art. 20 RGPD)">
          <p>
            Recibir tus datos en formato estructurado (ej: CSV) para
            transferir a otro servicio.
          </p>
        </SubSection>
        <SubSection title="5.6 Objeción (Art. 21 RGPD)">
          <p>Oponerte contra:</p>
          <ul>
            <li>Email marketing (puedes darte de baja en cada email)</li>
            <li>Cookies analíticas (puedes optar por no participar)</li>
          </ul>
        </SubSection>
        <SubSection title="5.7 No estar sujeto a decisiones automatizadas (Art. 22 RGPD)">
          <p>
            No tomamos decisiones sobre ti basadas solo en procesamiento
            automático.
          </p>
        </SubSection>
      </Section>

      <Section title="6. Cómo Ejercer Tus Derechos">
        <p>
          Contacta a:{" "}
          <a href={`mailto:${CONTACT}`}>
            <b>{CONTACT}</b>
          </a>
        </p>
        <p>Incluye:</p>
        <ul>
          <li>Tu nombre completo</li>
          <li>Email(s) asociado(s)</li>
          <li>
            Derechos que solicitas (acceso, eliminación, rectificación, etc.)
          </li>
          <li>Evidencia de identidad (si es necesario)</li>
        </ul>
        <p>
          <b>Plazo de respuesta:</b> 30 días hábiles (RGPD, LPDP México).
          Extensibles 60 días si es complejo.
        </p>
        <p>
          Si no estás satisfecho con nuestra respuesta, tienes derecho a
          presentar reclamación ante:
        </p>
        <ul>
          <li>
            <b>Alemania:</b> Agencia Federal de Protección de Datos (BfDI) —{" "}
            <a
              href="https://www.bfdi.bund.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              bfdi.bund.de
            </a>
          </li>
          <li>
            <b>México:</b> INAI —{" "}
            <a
              href="https://www.gob.mx/inai"
              target="_blank"
              rel="noopener noreferrer"
            >
              gob.mx/inai
            </a>
          </li>
          <li>
            <b>Colombia:</b> SISPRO —{" "}
            <a
              href="https://www.sispro.gov.co"
              target="_blank"
              rel="noopener noreferrer"
            >
              sispro.gov.co
            </a>{" "}
            (o supervisora territorial)
          </li>
        </ul>
      </Section>

      <Section title="7. Seguridad de Datos">
        <p>Implementamos:</p>
        <ul>
          <li>
            <b>HTTPS</b> en todo el sitio (cifrado en tránsito)
          </li>
          <li>
            <b>Autenticación</b> segura (contraseñas hash, 2FA si aplica)
          </li>
          <li>
            <b>Firewalls</b> y protección contra intrusiones
          </li>
          <li>
            <b>Acceso limitado</b> — solo empleados autorizados
          </li>
          <li>
            <b>Auditorías regulares</b> de seguridad
          </li>
        </ul>
        <p>
          <b>Limitación:</b> no podemos garantizar seguridad 100%. Si
          sospechas una brecha, contacta inmediatamente a{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
        </p>
      </Section>

      <Section title="8. Retención de Datos">
        <ul>
          <li>
            <b>Formulario de contacto:</b> 3 años — cumplimiento fiscal
          </li>
          <li>
            <b>Newsletter:</b> mientras suscrito — función de servicio
          </li>
          <li>
            <b>Google Analytics:</b> 26 meses — retención de Google
          </li>
          <li>
            <b>Cookies de sesión:</b> sesión activa — funcionalidad
          </li>
          <li>
            <b>Logs de servidor:</b> 7 días — seguridad/debugging
          </li>
        </ul>
        <p>
          Después del período, los datos se eliminan de manera segura o se
          anonimizan.
        </p>
      </Section>

      <Section title="9. Cambios a Esta Política">
        <p>
          Podemos actualizar esta Política de Privacidad. Cambios importantes
          se notificarán vía email. El uso continuado del sitio implica
          aceptación de cambios.
        </p>
      </Section>

      <Section title="10. Contacto">
        <p>Para preguntas sobre privacidad:</p>
        <ul>
          <li>
            <b>Email:</b>{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
          </li>
          <li>
            <b>Web:</b> www.cerebrosesponjosos.com
          </li>
          <li>
            <b>Responsable:</b> Data Privacy Officer, Cerebros Esponjosos,
            Alemania
          </li>
        </ul>
      </Section>

      <div className="pt-6 border-t border-[var(--c-border)] text-xs font-mono uppercase tracking-[0.15em] text-[var(--c-text-subtle)] space-y-1">
        <p>Versión: 1.0</p>
        <p>Efectiva desde: 9 de abril de 2026</p>
        <p>Próxima revisión: 9 de octubre de 2026</p>
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

function SubSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mt-5">
      <h3 className="text-base font-medium text-[var(--c-text)] mb-2">
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
