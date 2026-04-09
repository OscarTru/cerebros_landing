import { LegalLayout } from "./LegalLayout"

export function Terminos() {
  return (
    <LegalLayout title="Términos y Condiciones" updated="9 de abril de 2026">
      <Section title="1. Aceptación">
        <p>
          Al acceder o usar el sitio web <b>cerebrosesponjosos.com</b> (en
          adelante, "el Sitio") y cualquier contenido, servicio o funcionalidad
          asociado, usted acepta estar legalmente obligado por estos Términos y
          Condiciones. Si no está de acuerdo con alguna parte, por favor no
          utilice el Sitio.
        </p>
      </Section>

      <Section title="2. Sobre nosotros">
        <p>
          Cerebros Esponjosos es un proyecto educativo sobre neurología creado
          por Oscar y Stephanie, residentes de neurología. Producimos y
          publicamos contenido en Instagram, YouTube, newsletter y el Sitio.
        </p>
      </Section>

      <Section title="3. Contenido educativo — no consejo médico">
        <p>
          Todo el contenido publicado en el Sitio y en nuestras redes sociales
          tiene un propósito exclusivamente <b>educativo e informativo</b>.{" "}
          <b>
            No constituye consejo médico, diagnóstico, tratamiento, ni sustituye
            la relación médico-paciente.
          </b>{" "}
          Si usted o un familiar presenta síntomas o dudas sobre su salud, debe
          consultar a un profesional de la salud calificado en su jurisdicción.
        </p>
        <p>
          No asumimos responsabilidad por decisiones tomadas con base en el
          contenido publicado.
        </p>
      </Section>

      <Section title="4. Propiedad intelectual">
        <p>
          Todos los textos, imágenes, videos, gráficos, logotipos y diseños del
          Sitio son propiedad de Cerebros Esponjosos o se usan bajo licencia.
          Queda prohibida la reproducción, modificación o distribución sin
          autorización escrita, salvo para uso personal no comercial y con
          atribución visible.
        </p>
      </Section>

      <Section title="5. Uso permitido">
        <p>Al usar el Sitio, usted se compromete a:</p>
        <ul>
          <li>No utilizarlo con fines ilícitos o fraudulentos.</li>
          <li>
            No intentar vulnerar su seguridad, ni acceder a datos que no estén
            destinados al público.
          </li>
          <li>
            No reproducir contenido para fines comerciales sin autorización
            expresa.
          </li>
          <li>
            No usar bots, scrapers ni herramientas automatizadas para extraer
            datos del Sitio.
          </li>
        </ul>
      </Section>

      <Section title="6. Enlaces a terceros">
        <p>
          El Sitio puede contener enlaces a plataformas externas (Instagram,
          YouTube, newsletter provider, etc.). No somos responsables del
          contenido, políticas ni prácticas de esos terceros. Usted accede bajo
          su propio riesgo.
        </p>
      </Section>

      <Section title="7. Colaboraciones patrocinadas">
        <p>
          Parte de nuestro contenido puede incluir menciones patrocinadas,
          colaboraciones pagadas o enlaces de afiliado. Cumplimos con las
          directrices de transparencia de la FTC, la UE y organismos
          equivalentes: todo contenido patrocinado se etiqueta claramente como
          tal.
        </p>
      </Section>

      <Section title="8. Limitación de responsabilidad">
        <p>
          En la máxima medida permitida por la ley aplicable, Cerebros
          Esponjosos no será responsable por daños directos, indirectos,
          incidentales o consecuentes derivados del uso del Sitio o del
          contenido publicado.
        </p>
      </Section>

      <Section title="9. Modificaciones">
        <p>
          Podemos actualizar estos Términos en cualquier momento. La versión
          vigente será la publicada en esta página con su fecha de última
          actualización. El uso continuado del Sitio tras una modificación
          implica aceptación de los nuevos Términos.
        </p>
      </Section>

      <Section title="10. Ley aplicable y jurisdicción">
        <p>
          Estos Términos se rigen por las leyes del país de residencia de los
          titulares del Sitio. Cualquier disputa será resuelta por los
          tribunales competentes de dicha jurisdicción, sin perjuicio de los
          derechos que la ley aplicable reconozca al usuario en su país de
          residencia (cuando sea consumidor).
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          Para cualquier consulta relacionada con estos Términos, escríbenos a{" "}
          <a
            href="mailto:contacto@cerebrosesponjosos.com"
            className="text-white underline decoration-zinc-600 hover:decoration-white"
          >
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
