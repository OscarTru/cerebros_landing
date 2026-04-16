import type { Metadata } from "next"
import { LegalLayout } from "@/layouts/LegalLayout"

export const metadata: Metadata = {
  title: "Términos y Condiciones",
  description: "Términos y condiciones para colaboraciones con marcas de Cerebros Esponjosos.",
}

export default function TerminosPage() {
  return (
    <LegalLayout
      title="Términos y Condiciones — Colaboraciones con Marcas"
      updated="9 de abril de 2026"
    >
      <Section title="1. Definiciones">
        <p>
          <b>"Cerebros Esponjosos"</b> o <b>"Nosotros/Nuestro"</b> — refiere a
          Cerebros Esponjosos, su equipo y plataformas (@cerebros.esponjosos
          en Instagram y TikTok).
        </p>
        <p>
          <b>"Colaboración"</b> — cualquier acuerdo de contenido pagado,
          patrocinio, mención de marca o integración entre una marca y
          Cerebros Esponjosos.
        </p>
        <p>
          <b>"Contenido"</b> — material audiovisual (Reels, posts, historias)
          producido en el contexto de la Colaboración.
        </p>
        <p>
          <b>"Marca"</b> o <b>"Cliente"</b> — la empresa, producto o servicio
          que solicita una Colaboración con Cerebros Esponjosos.
        </p>
        <p>
          <b>"Datos Personales"</b> — cualquier información que identifica o
          puede identificar a un individuo, conforme al RGPD (Reglamento
          General de Protección de Datos).
        </p>
      </Section>

      <Section title="2. Aceptación de Términos">
        <p>
          Al completar el formulario de contacto o solicitar una Colaboración,
          la Marca acepta íntegramente estos Términos y Condiciones. Si no
          estás de acuerdo, no procedes.
        </p>
        <p>
          La Marca declara que tiene capacidad legal y autoridad para celebrar
          acuerdos en nombre de su organización.
        </p>
      </Section>

      <Section title="3. Solicitud de Colaboración y Presupuesto">
        <ol>
          <li>
            <b>Proceso:</b> Las marcas interesadas completan el formulario de
            contacto con detalles del producto/servicio, objetivos, y
            preferencias de contenido.
          </li>
          <li>
            <b>Respuesta:</b> Cerebros Esponjosos responde con una propuesta
            personalizada dentro de 5 días hábiles. La propuesta incluye
            descripción de deliverables, cronograma, términos de pago y
            cualquier restricción creativa identificada.
          </li>
          <li>
            <b>No vinculante:</b> El envío de una propuesta no constituye una
            oferta vinculante. La Colaboración entra en vigor únicamente
            cuando ambas partes firman o aceptan explícitamente los términos
            específicos.
          </li>
          <li>
            <b>Validez:</b> Las propuestas son válidas por 15 días. Cambios en
            los términos después de ese plazo requerirán una nueva propuesta.
          </li>
        </ol>
      </Section>

      <Section title="4. Contenido y Creatividad">
        <ol>
          <li>
            <b>Autonomía creativa:</b> Cerebros Esponjosos retiene autoridad
            creativa total sobre el contenido. Las sugerencias de la Marca se
            consideran, pero no son vinculantes.
          </li>
          <li>
            <b>Congruencia editorial:</b> Cerebros Esponjosos rechaza
            Colaboraciones que:
            <ul>
              <li>
                Contradicen hechos médicos o divulgan información inexacta
              </li>
              <li>
                Promueven productos no comprobados o claims médicas no
                validadas
              </li>
              <li>
                Generan conflictos de interés clínicos o científicos
              </li>
              <li>
                Deterioran la identidad de marca de Cerebros Esponjosos
              </li>
            </ul>
          </li>
          <li>
            <b>Revisiones:</b> Se incluyen hasta 2 revisiones en el scope de
            la Colaboración. Revisiones adicionales se facturan por separado.
          </li>
          <li>
            <b>Plazo de aprobación:</b> La Marca tiene 3 días hábiles para
            aprobar el contenido. Silencio = aprobación. Cambios solicitados
            después de la aprobación están fuera de scope.
          </li>
        </ol>
      </Section>

      <Section title="5. Derechos de Propiedad Intelectual">
        <ol>
          <li>
            <b>Propiedad del contenido:</b> Cerebros Esponjosos retiene toda
            propiedad intelectual, derechos de autor y derechos morales sobre
            el Contenido producido.
          </li>
          <li>
            <b>Licencia a la Marca:</b> Se otorga una licencia{" "}
            <b>no exclusiva</b>, <b>no transferible</b>,{" "}
            <b>limitada al período de la Colaboración</b>, para que la Marca
            use el Contenido en sus canales propios (sitio web, redes
            sociales, materiales de marketing), con mención de crédito visible
            a @cerebros.esponjosos.
          </li>
          <li>
            <b>Duración de la licencia:</b>
            <ul>
              <li>Mención/Integración simple: 90 días</li>
              <li>Serie o contenido extenso: 180 días</li>
              <li>Custom: según términos específicos del contrato</li>
            </ul>
          </li>
          <li>
            <b>Prohibiciones:</b> La Marca <b>no puede</b>:
            <ul>
              <li>Modificar, editar o remezcar el Contenido sin autorización</li>
              <li>Registrar marca o copyright sobre el Contenido</li>
              <li>Transferir derechos a terceros</li>
              <li>
                Usar el Contenido para propósitos que no sean marketing de la
                Marca (ej: venderlo, licenciarlo)
              </li>
              <li>Crear obras derivadas</li>
            </ul>
          </li>
          <li>
            <b>Marca de agua:</b> Todo Contenido puede incluir la marca de
            agua de Cerebros Esponjosos.
          </li>
        </ol>
      </Section>

      <Section title="6. Términos de Pago">
        <ol>
          <li>
            <b>Estructura:</b> Las tarifas se detallan en la propuesta según
            el tier de Colaboración seleccionado.
          </li>
          <li>
            <b>Método:</b> Pago bancario internacional (transferencia SEPA o
            equivalente) a la cuenta proporcionada por Cerebros Esponjosos.
          </li>
          <li>
            <b>Timing:</b>
            <ul>
              <li>
                <b>50% de anticipo</b> antes de iniciar la producción de
                Contenido
              </li>
              <li>
                <b>50% restante</b> dentro de 7 días de entrega del Contenido
                aprobado
              </li>
            </ul>
          </li>
          <li>
            <b>Moneda:</b> EUR (euros). Cambio a otra moneda a cargo de la
            Marca.
          </li>
          <li>
            <b>Impuestos:</b> La Marca es responsable de cualquier impuesto,
            IVA o tarifa regulatoria en su jurisdicción. Si es aplicable,
            Cerebros Esponjosos proporcionará factura.
          </li>
          <li>
            <b>Retrasos de pago:</b> Pagos no recibidos dentro de 7 días del
            vencimiento incurren en interés del 1.5% mensual. Atrasos mayores
            a 30 días anulan la Colaboración y el Contenido puede no
            publicarse.
          </li>
        </ol>
      </Section>

      <Section title="7. Publicación y Divulgación">
        <ol>
          <li>
            <b>Transparencia:</b> Todo Contenido de Colaboración incluye una
            declaración clara de naturaleza patrocinada:
            <ul>
              <li>
                En Instagram: hashtag #ad, #sponsored o disclaimer visual
              </li>
              <li>En TikTok: etiqueta de "Brand Partnership"</li>
              <li>
                En descripción/caption: mención explícita de la naturaleza
                comercial
              </li>
            </ul>
          </li>
          <li>
            <b>Cumplimiento:</b> Cerebros Esponjosos cumple con todas
            regulaciones de publicidad y divulgación de plataformas,
            incluyendo FTC (EE.UU.), IAB (Europa), y directrices de
            AEPD/plataformas.
          </li>
          <li>
            <b>Timing de publicación:</b> Las fechas exactas se confirman en
            el contrato. Cambios de última hora pueden no ser posibles.
          </li>
          <li>
            <b>Cobertura:</b> Cerebros Esponjosos <b>no garantiza</b> alcance,
            visualizaciones, engagement, o conversiones específicas. El
            Contenido se publica de buena fe en el horario especificado.
          </li>
        </ol>
      </Section>

      <Section title="8. Responsabilidades de la Marca">
        <ol>
          <li>
            <b>Información exacta:</b> La Marca proporciona información veraz
            y no engañosa sobre el producto/servicio.
          </li>
          <li>
            <b>Cumplimiento legal:</b> La Marca asegura que el
            producto/servicio:
            <ul>
              <li>Cumple todas leyes y regulaciones aplicables</li>
              <li>No viola derechos de terceros</li>
              <li>No contiene contenido ilegal, ofensivo o peligroso</li>
            </ul>
          </li>
          <li>
            <b>Seguro de producto:</b> La Marca es responsable de cualquier
            reclamo, litigio, o daño derivado de su producto/servicio.
            Cerebros Esponjosos no es responsable por seguridad, efectividad,
            o legalidad del producto.
          </li>
          <li>
            <b>Reclamaciones médicas:</b> Si se trata de un producto de salud
            o bienestar, la Marca debe proporcionar evidencia científica o
            disclaimer legal que Cerebros Esponjosos incorporará en el
            Contenido.
          </li>
        </ol>
      </Section>

      <Section title="9. Limitación de Responsabilidad">
        <ol>
          <li>
            <b>Exención:</b> Cerebros Esponjosos no es responsable por:
            <ul>
              <li>
                Daño a la reputación, pérdida de ventas, o ROI insatisfecho
              </li>
              <li>
                Cambios en algoritmos de plataformas que afecten alcance
              </li>
              <li>
                Comentarios negativos, crítica pública, o reacciones de
                audiencia
              </li>
              <li>
                Cambios en regulaciones de publicidad post-publicación
              </li>
              <li>
                Acciones de plataformas (eliminación de contenido, suspensión
                de cuenta)
              </li>
            </ul>
          </li>
          <li>
            <b>Límite total:</b> Si existiera responsabilidad de Cerebros
            Esponjosos, estaría limitada al monto total pagado por la
            Colaboración en cuestión.
          </li>
          <li>
            <b>No garantías:</b> El Contenido se proporciona "tal cual". No
            hay garantías implícitas de comerciabilidad, idoneidad para un
            propósito particular, o resultados específicos.
          </li>
        </ol>
      </Section>

      <Section title="10. Cancelación y Rescisión">
        <ol>
          <li>
            <b>Por la Marca:</b>
            <ul>
              <li>
                Antes de publicación: reembolso del 50% del anticipo menos
                gastos incurridos
              </li>
              <li>
                Después de publicación: sin reembolso; Contenido permanece
                como es
              </li>
            </ul>
          </li>
          <li>
            <b>Por Cerebros Esponjosos:</b>
            <ul>
              <li>Si la Marca incumple pagos por más de 7 días</li>
              <li>Si la información proporcionada es falsa o ilegal</li>
              <li>
                Si surge conflicto de interés no divulgado previamente
              </li>
              <li>
                Por fuerza mayor (enfermedad, evento catastrófico) —
                reembolso prorrateado
              </li>
            </ul>
          </li>
          <li>
            <b>Rescisión unilateral:</b> Cerebros Esponjosos se reserva el
            derecho a rechazar Colaboraciones sin necesidad de justificación.
          </li>
        </ol>
      </Section>

      <Section title="11. Confidencialidad">
        <ol>
          <li>
            <b>Secretos comerciales:</b> La Marca puede compartir información
            confidencial (planes de producto, pricing interno, estrategia)
            bajo NDA separado si es necesario.
          </li>
          <li>
            <b>Sin NDA:</b> Información compartida en el formulario o
            comunicaciones normales <b>no es confidencial</b>. Cerebros
            Esponjosos puede usarla para análisis de mercado interno o
            considerarla para contenido futuro (siempre con divulgación).
          </li>
          <li>
            <b>Información pública:</b> Cualquier información divulgada
            públicamente en el Contenido es pública y no sujeta a
            confidencialidad.
          </li>
        </ol>
      </Section>

      <Section title="12. Protección de Datos y RGPD">
        <ol>
          <li>
            <b>Responsable de datos:</b> Cerebros Esponjosos es responsable de
            los Datos Personales recopilados a través del formulario de
            contacto conforme al RGPD (Reglamento General de Protección de
            Datos, UE 2016/679).
          </li>
          <li>
            <b>Uso de datos:</b>
            <ul>
              <li>
                Nombre, email, teléfono: para contacto, seguimiento de
                propuesta, facturación
              </li>
              <li>
                Datos de la Marca: para análisis interno, métricas de
                Colaboración
              </li>
              <li>
                Analíticos de redes (engagement, alcance): agregado, nunca
                personal
              </li>
            </ul>
          </li>
          <li>
            <b>Duración:</b> Los datos se conservan mientras la relación
            comercial esté activa + 3 años para fines contables/legales.
            Luego se eliminan o anonimizan.
          </li>
          <li>
            <b>Derechos:</b> La Marca tiene derecho a acceso, rectificación,
            eliminación, y portabilidad de sus Datos Personales. Contactar a{" "}
            <a href="mailto:contacto@cerebrosesponjosos.com">
              contacto@cerebrosesponjosos.com
            </a>
            .
          </li>
          <li>
            <b>Terceros:</b> Datos compartidos únicamente con proveedores
            técnicos necesarios (Stripe para pagos, Google Analytics,
            plataformas de redes). Sin venta a terceros.
          </li>
          <li>
            <b>Seguridad:</b> Cerebros Esponjosos implementa medidas estándar
            de seguridad (HTTPS, autenticación). No se garantiza seguridad
            absoluta en transmisiones por internet.
          </li>
        </ol>
      </Section>

      <Section title="13. Links y Contenido de Terceros">
        <ol>
          <li>
            <b>Links:</b> Si el Contenido incluye links a sitio web de la
            Marca, Cerebros Esponjosos no es responsable del contenido,
            privacidad, o legalidad de ese sitio.
          </li>
          <li>
            <b>Reivindicación de marcas:</b> Si el Contenido se reclama o
            reporta por infracción de derechos (copyright, marca registrada),
            la Marca indemniza a Cerebros Esponjosos y se hace cargo de
            cualquier costo legal.
          </li>
        </ol>
      </Section>

      <Section title="14. Modificaciones de Términos">
        <p>
          Cerebros Esponjosos puede modificar estos Términos en cualquier
          momento. Las modificaciones aplican a nuevas Colaboraciones. Para
          Colaboraciones existentes, los términos originales aplican hasta
          completion.
        </p>
        <p>
          Cambios mayores serán notificados 30 días antes de entrar en
          vigencia.
        </p>
      </Section>

      <Section title="15. Ley Aplicable y Jurisdicción">
        <ol>
          <li>
            <b>Ley:</b> Estos Términos se rigen por las leyes de{" "}
            <b>Alemania</b> y la <b>Unión Europea</b> (especialmente RGPD).
          </li>
          <li>
            <b>Jurisdicción:</b> Cualquier disputa se resuelve bajo las cortes
            competentes de Alemania, a menos que una solución alternativa sea
            acordada por ambas partes.
          </li>
          <li>
            <b>Arbitraje:</b> Para disputas menores (&lt;€5,000), ambas partes
            acuerdan intentar mediación antes de litigio.
          </li>
        </ol>
      </Section>

      <Section title="16. Disposiciones Generales">
        <ol>
          <li>
            <b>Acuerdo completo:</b> Estos Términos constituyen el acuerdo
            completo. Cualquier comunicación previa (email, mensajes) es
            supercedida.
          </li>
          <li>
            <b>Severabilidad:</b> Si alguna disposición es inválida, el resto
            permanece en vigor.
          </li>
          <li>
            <b>Ausencia de renuncia:</b> Incumplimiento de Cerebros
            Esponjosos de hacer valer un derecho no es renuncia a ese
            derecho.
          </li>
          <li>
            <b>Asignación:</b> La Marca no puede asignar derechos bajo estos
            Términos sin consentimiento escrito. Cerebros Esponjosos puede
            subcontratar producción sin aviso.
          </li>
          <li>
            <b>Contacto legal:</b> Para consultas legales o disputas,
            contactar a:{" "}
            <a href="mailto:contacto@cerebrosesponjosos.com">
              <b>contacto@cerebrosesponjosos.com</b>
            </a>
          </li>
        </ol>
      </Section>

      <Section title="17. Contacto">
        <p>
          Para preguntas sobre estos Términos o para iniciar una Colaboración:
        </p>
        <ul>
          <li>
            <b>Email:</b>{" "}
            <a href="mailto:contacto@cerebrosesponjosos.com">
              contacto@cerebrosesponjosos.com
            </a>
          </li>
          <li>
            <b>Web:</b> www.cerebrosesponjosos.com
          </li>
          <li>
            <b>Instagram:</b>{" "}
            <a
              href="https://instagram.com/cerebros.esponjosos"
              target="_blank"
              rel="noopener noreferrer"
            >
              @cerebros.esponjosos
            </a>
          </li>
          <li>
            <b>TikTok:</b>{" "}
            <a
              href="https://www.tiktok.com/@cerebros.esponjosos"
              target="_blank"
              rel="noopener noreferrer"
            >
              @cerebros.esponjosos
            </a>
          </li>
        </ul>
      </Section>

      <Section title="18. Anexo: Formulario de Contacto — Consentimiento Adicional">
        <p>
          Al completar el formulario de contacto, además de aceptar estos
          Términos, la Marca <b>también consiente a</b>:
        </p>
        <ul>
          <li>Recibir emails de seguimiento sobre la propuesta.</li>
          <li>
            Recibir contenido educativo/newsletter ocasional de Cerebros
            Esponjosos (desuscribirse en cualquier momento).
          </li>
          <li>
            Que Cerebros Esponjosos publique un caso de estudio o referencia
            posterior (sin revelar términos de pago).
          </li>
        </ul>
        <p>
          <i>
            Estos consentimientos pueden revocarse en cualquier momento
            respondiendo "Desuscribir" a cualquier email.
          </i>
        </p>
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
