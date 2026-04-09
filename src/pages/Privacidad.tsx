import { LegalLayout } from "./LegalLayout"

export function Privacidad() {
  return (
    <LegalLayout title="Política de Privacidad" updated="9 de abril de 2026">
      <Section title="1. Introducción">
        <p>
          En Cerebros Esponjosos ("nosotros") nos tomamos en serio tu
          privacidad. Esta política describe qué datos personales recopilamos,
          con qué fines los usamos, con quién los compartimos y qué derechos
          tienes sobre ellos. Aplica a usuarios de cualquier país, incluyendo
          residentes de la Unión Europea (GDPR), Reino Unido (UK GDPR),
          California (CCPA/CPRA), México (LFPDPPP) y demás jurisdicciones con
          leyes de protección de datos.
        </p>
      </Section>

      <Section title="2. Responsable del tratamiento">
        <p>
          El responsable del tratamiento de los datos es Cerebros Esponjosos,
          contactable a través de{" "}
          <a href="mailto:contacto@cerebrosesponjosos.com">
            contacto@cerebrosesponjosos.com
          </a>
          .
        </p>
      </Section>

      <Section title="3. Datos que recopilamos">
        <ul>
          <li>
            <b>Datos que tú nos das:</b> correo electrónico cuando te
            suscribes a nuestra newsletter; contenido de mensajes que nos
            envías.
          </li>
          <li>
            <b>Datos técnicos:</b> dirección IP, tipo de navegador, sistema
            operativo, páginas visitadas, fechas y horas de acceso
            (recopilados automáticamente por el hosting y analíticas).
          </li>
          <li>
            <b>Cookies y tecnologías similares:</b> ver nuestra{" "}
            <a href="/cookies">Política de Cookies</a>.
          </li>
        </ul>
      </Section>

      <Section title="4. Bases legales y finalidades">
        <p>Tratamos tus datos con base en:</p>
        <ul>
          <li>
            <b>Consentimiento</b> (art. 6.1.a GDPR): cuando te suscribes a la
            newsletter o aceptas cookies no esenciales.
          </li>
          <li>
            <b>Interés legítimo</b> (art. 6.1.f GDPR): para seguridad del
            Sitio, prevención de fraude y analítica agregada.
          </li>
          <li>
            <b>Cumplimiento de obligaciones legales</b> (art. 6.1.c GDPR):
            cuando sea requerido por autoridades competentes.
          </li>
        </ul>
        <p>Usamos tus datos para:</p>
        <ul>
          <li>Enviarte la newsletter y contenido relacionado (si te suscribes).</li>
          <li>Responder a tus consultas o solicitudes de colaboración.</li>
          <li>Mejorar el Sitio y entender cómo se usa.</li>
          <li>Cumplir con obligaciones legales.</li>
        </ul>
      </Section>

      <Section title="5. Conservación">
        <p>
          Conservamos tus datos únicamente durante el tiempo necesario para los
          fines descritos o mientras mantengas tu suscripción activa. Puedes
          darte de baja en cualquier momento desde el enlace en cada correo.
          Después conservamos logs mínimos por motivos legales y de seguridad
          durante un máximo de 12 meses.
        </p>
      </Section>

      <Section title="6. Compartición de datos">
        <p>
          No vendemos tus datos personales. Los compartimos únicamente con
          proveedores que nos ayudan a operar el Sitio, bajo contratos de
          encargo de tratamiento compatibles con el GDPR:
        </p>
        <ul>
          <li>
            <b>Hosting y despliegue:</b> Vercel Inc. (Estados Unidos).
          </li>
          <li>
            <b>Newsletter:</b> el proveedor de correo electrónico que usemos
            (Beehiiv, Substack, ConvertKit o similar).
          </li>
          <li>
            <b>Analíticas:</b> proveedor de analíticas si está habilitado
            (ej. Plausible, Google Analytics).
          </li>
          <li>
            <b>GitHub Inc.:</b> alojamiento del código fuente (sin datos
            personales de usuarios).
          </li>
        </ul>
        <p>
          Algunos de estos proveedores están ubicados fuera del Espacio
          Económico Europeo. Cuando ocurren transferencias internacionales, se
          realizan con las salvaguardas adecuadas (Cláusulas Contractuales
          Tipo de la Comisión Europea u otras bases legales aplicables).
        </p>
      </Section>

      <Section title="7. Tus derechos">
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a los datos que tengamos sobre ti.</li>
          <li>Rectificar datos inexactos.</li>
          <li>
            Solicitar la supresión ("derecho al olvido") cuando ya no sean
            necesarios.
          </li>
          <li>Oponerte al tratamiento o solicitar su limitación.</li>
          <li>Portabilidad de tus datos en formato estructurado.</li>
          <li>Retirar tu consentimiento en cualquier momento.</li>
          <li>
            Presentar una reclamación ante la autoridad de control de tu país
            (AEPD en España, CNIL en Francia, INAI en México, etc.).
          </li>
        </ul>
        <p>
          Para ejercer cualquiera de estos derechos, escríbenos a{" "}
          <a href="mailto:contacto@cerebrosesponjosos.com">
            contacto@cerebrosesponjosos.com
          </a>
          . Responderemos en un plazo máximo de 30 días.
        </p>
      </Section>

      <Section title="8. Usuarios de California (CCPA/CPRA)">
        <p>
          Si eres residente de California, tienes derechos adicionales:
          conocer qué información personal recopilamos, solicitar su
          eliminación, corregirla, saber si se "vende" o "comparte" (nosotros
          no lo hacemos) y no ser discriminado por ejercer estos derechos.
          Contáctanos en la dirección anterior para ejercerlos.
        </p>
      </Section>

      <Section title="9. Menores">
        <p>
          El Sitio no está dirigido a menores de 14 años. No recopilamos
          conscientemente datos personales de menores. Si crees que un menor
          nos ha proporcionado datos, contáctanos para eliminarlos.
        </p>
      </Section>

      <Section title="10. Seguridad">
        <p>
          Aplicamos medidas técnicas y organizativas razonables para proteger
          tus datos: cifrado en tránsito (HTTPS), acceso restringido a
          personal autorizado, y proveedores que cumplen con estándares
          reconocidos. Ningún sistema es 100% seguro, pero hacemos nuestro
          mejor esfuerzo.
        </p>
      </Section>

      <Section title="11. Cambios">
        <p>
          Podemos actualizar esta política en cualquier momento. Publicaremos
          la nueva versión en esta misma página con su fecha de
          actualización. Te recomendamos revisarla periódicamente.
        </p>
      </Section>

      <Section title="12. Contacto">
        <p>
          Para cualquier duda sobre privacidad:{" "}
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
