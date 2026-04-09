import { LegalLayout } from "./LegalLayout"

const CONTACT = "contacto@cerebrosesponjosos.com"

export function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer de Contenido Educativo" updated="9 de abril de 2026">
      <div className="mb-8 p-5 border border-[var(--c-border-strong)] bg-[var(--c-surface-2)] rounded-lg">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--c-text-subtle)] mb-2">
          Importante — Lee antes de consumir contenido
        </p>
        <p className="text-[var(--c-text)]">
          Cerebros Esponjosos produce <b>contenido educativo</b> sobre
          neurociencia, psicología y bienestar.{" "}
          <b>Este no es consejo médico profesional.</b>
        </p>
      </div>

      <Section title="1. Lo Que Este Contenido ES">
        <ul>
          <li>
            Explicaciones de mecanismos neurobiológicos basadas en
            investigación publicada
          </li>
          <li>Información sobre cómo funciona el cerebro</li>
          <li>Tips de estilo de vida respaldados por evidencia científica</li>
          <li>Educación para entender tu propia biología</li>
          <li>
            Contenido producido por un Médico Residente en Neurología (con
            perspectiva clínica)
          </li>
        </ul>
      </Section>

      <Section title="2. Lo Que Este Contenido NO ES">
        <ul>
          <li>Consejo médico personal o diagnóstico</li>
          <li>
            Reemplazo de evaluación clínica por un profesional de salud
          </li>
          <li>
            Prescripción de tratamientos, medicinas, o intervenciones
          </li>
          <li>
            Recomendación para iniciar/detener/cambiar medicinas
          </li>
          <li>Tratamiento para condiciones médicas específicas</li>
        </ul>
      </Section>

      <Section title="3. Limitaciones de Responsabilidad">
        <p>
          <b>
            Cerebros Esponjosos y su creador NO son responsables por:
          </b>
        </p>
        <ol>
          <li>
            <b>Decisiones médicas personales</b> — Si cambias tu tratamiento
            basándote en este contenido sin consultar a tu médico, esa es tu
            decisión personal.
          </li>
          <li>
            <b>Diagnósticos auto-atribuidos</b> — Algunos síntomas pueden
            parecer similares en múltiples condiciones. Un diagnóstico
            requiere evaluación profesional.
          </li>
          <li>
            <b>Reacciones adversas o efectos secundarios</b> — Si
            experimentas efectos secundarios por implementar tips de este
            contenido, consulta a un profesional inmediatamente.
          </li>
          <li>
            <b>Daño indirecto</b> — Pérdida de ingresos, tiempo,
            oportunidades causadas por decisiones basadas en este contenido.
          </li>
          <li>
            <b>Información desactualizada</b> — La neurociencia evoluciona.
            Contenido antiguo puede ser superado por nuevas investigaciones.
          </li>
          <li>
            <b>Variabilidad individual</b> — Aunque una estrategia está
            respaldada por investigación, no todos responden igual. Tu
            respuesta puede diferir.
          </li>
        </ol>
      </Section>

      <Section title="4. Cuándo DEBES Consultar a un Profesional">
        <p>
          Consulta inmediatamente a un{" "}
          <b>médico, psiquiatra, psicólogo o neurólogo</b> si:
        </p>
        <ul>
          <li>
            Experimentas síntomas nuevos o crecientes (dolores de cabeza,
            confusión, cambios de memoria)
          </li>
          <li>
            Tienes una condición neurológica o psiquiátrica diagnosticada
          </li>
          <li>Tomas medicinas psicotrópicas y quieres cambiarlas</li>
          <li>Tienes pensamientos de autolesión o suicidio</li>
          <li>
            Experimentas cambios de humor o comportamiento persistentes
          </li>
          <li>
            Planeas un cambio importante en tu dieta, sueño o rutina (si
            tienes condiciones médicas)
          </li>
          <li>Cualquier síntoma te preocupa</li>
        </ul>
        <p>
          <b>
            No hay vergüenza en buscar ayuda profesional. Es la opción
            correcta.
          </b>
        </p>
      </Section>

      <Section title="5. Base de Evidencia">
        <p>Nuestro contenido cita investigación de:</p>
        <ul>
          <li>PubMed Central (National Library of Medicine, EE.UU.)</li>
          <li>Scopus (Elsevier, base de datos académica)</li>
          <li>
            Revistas peer-reviewed: <i>Nature</i>, <i>Neuron</i>,{" "}
            <i>JAMA Psychiatry</i>, <i>Lancet Neurology</i>, etc.
          </li>
          <li>
            Instituciones: NIH, Max Planck Institute, universidades
            reconocidas
          </li>
        </ul>
        <p>
          <b>Estándar:</b> Preferimos studies in vivo, estudios clínicos,
          metaanálisis. Evitamos especulación no respaldada.
        </p>
        <p>
          <b>Limitación:</b> Aunque citamos investigación, los estudios
          pueden ser pequeños, tener conflictos de interés, o ser
          contradichos por estudios posteriores. La ciencia avanza por
          iteración.
        </p>
      </Section>

      <Section title="6. Información para Poblaciones Específicas">
        <SubSection title="Embarazo y Lactancia">
          <p>
            <b>Algunos tips no aplican durante embarazo/lactancia.</b>{" "}
            Consulta a tu obstetra/ginecólogo antes de implementar cambios
            significativos en dieta, ejercicio, suplementos o medicinas.
          </p>
        </SubSection>

        <SubSection title="Niños y Adolescentes">
          <p>
            Este contenido es principalmente para adultos. Si tienes
            menores, algunos tips pueden no ser apropiados para su edad.{" "}
            <b>
              Consulta a su pediatra o psicólogo antes de aplicar contenido
              a menores.
            </b>
          </p>
        </SubSection>

        <SubSection title="Condiciones Neurológicas Preexistentes">
          <p>Si tienes:</p>
          <ul>
            <li>Epilepsia, convulsiones</li>
            <li>Tumor cerebral, lesión cerebral traumática</li>
            <li>Parkinson, Alzheimer, u otra neurodegeneración</li>
            <li>Accidente cerebrovascular previo</li>
          </ul>
          <p>
            <b>Consulta a tu neurólogo antes de cambios.</b> Algunos tips
            pueden interactuar con tus condiciones.
          </p>
        </SubSection>

        <SubSection title="Trastornos de Salud Mental">
          <p>
            Si tienes depresión, ansiedad, TOC, trastorno bipolar,
            esquizofrenia, u otro trastorno:
          </p>
          <p>
            <b>Este contenido NO reemplaza terapia o medicinas.</b> Puede
            complementar, pero no sustituye. Mantente en contacto con tu
            psiquiatra/psicólogo.
          </p>
        </SubSection>
      </Section>

      <Section title="7. Disclaimer de Suplementos">
        <p>
          Si mencionamos suplementos (vitaminas, herbales, nootrópicos):
        </p>
        <ul>
          <li>
            <b>No están regulados como medicinas</b> (en muchos países)
          </li>
          <li>
            <b>
              Pueden tener efectos secundarios, interacciones con medicinas
            </b>
          </li>
          <li>
            <b>Calidad y pureza varían</b> por marca
          </li>
          <li>
            <b>No son apropiados para todos</b>
          </li>
        </ul>
        <p>
          <b>
            Siempre consulta a tu médico o farmacéutico antes de tomar
            suplementos nuevos
          </b>
          , especialmente si:
        </p>
        <ul>
          <li>Tomas medicinas prescritas</li>
          <li>Estás embarazada/amamantando</li>
          <li>Tienes condiciones médicas</li>
          <li>Tienes alergias conocidas</li>
        </ul>
      </Section>

      <Section title="8. Variabilidad Genética e Individual">
        <p>
          Aunque la neurociencia es universal, <b>tu cerebro es único.</b>{" "}
          Factores que afectan respuesta:
        </p>
        <ul>
          <li>
            <b>Genética</b> — Alelos que cambian sensibilidad a
            neurotransmisores, estrés, etc.
          </li>
          <li>
            <b>Edad</b> — Plasticidad cerebral cambia con edad
          </li>
          <li>
            <b>Experiencias previas</b> — Tu historia moldea tu respuesta
          </li>
          <li>
            <b>Circunstancias actuales</b> — Estrés, sueño, salud física
          </li>
          <li>
            <b>Medicinas o drogas</b> — Interfieren con neurotransmisores
          </li>
        </ul>
        <p>
          <b>Resultado:</b> Si algo funcionó para alguien más no significa
          que funcione igual para ti.
        </p>
      </Section>

      <Section title="9. Cambios de Opinión y Correcciones">
        <p>Nos comprometemos a:</p>
        <ul>
          <li>Actualizar contenido si nueva evidencia lo supera</li>
          <li>
            Publicar correcciones claramente si identificamos errores
          </li>
          <li>Citar fuentes primarias siempre que sea posible</li>
          <li>
            Distinguir entre "establecido" y "emergente/especulativo"
          </li>
          <li>Admitir limitaciones de nuestro conocimiento</li>
        </ul>
        <p>
          Si identificas un error, contacta a:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </Section>

      <Section title="10. Uso de Contenido en Colaboraciones Patrocinadas">
        <p>Si una marca patrocina contenido sobre su producto:</p>
        <ul>
          <li>El contenido sigue siendo educativo y riguroso</li>
          <li>
            <b>Declaramos explícitamente la naturaleza patrocinada</b> (#ad,
            #sponsored)
          </li>
          <li>
            El contenido no está sesgado para favorecer al patrocinador
            (mantenemos independencia editorial)
          </li>
          <li>Si hay conflicto potencial, lo divulgamos</li>
        </ul>
      </Section>

      <Section title="11. Datos Epidemiológicos y Generalizaciones">
        <p>Cuando decimos cosas como "el 70% de adultos sufren de...":</p>
        <ul>
          <li>
            Esa estadística es válida <b>en la población estudiada</b>
          </li>
          <li>Puede no aplicar a ti, tu región, o tu grupo</li>
          <li>
            Las muestras de investigación suelen ser WEIRD (Western,
            Educated, Industrialized, Rich, Democratic)
          </li>
          <li>Existe sesgo de representación</li>
        </ul>
        <p>
          <b>Conclusión:</b> Las estadísticas son aproximadas, no certezas
          personales.
        </p>
      </Section>

      <Section title="12. Contacto Médico de Emergencia">
        <p>
          <b>
            Si experimentas una emergencia médica, llama a emergencias, no a
            Cerebros Esponjosos.
          </b>
        </p>
        <ul>
          <li>
            <b>Alemania:</b> 112
          </li>
          <li>
            <b>México:</b> 911
          </li>
          <li>
            <b>Colombia:</b> 123 (Policía/Emergencia)
          </li>
        </ul>
      </Section>

      <Section title="13. Política de Privacidad de Salud">
        <p>Aunque producimos contenido sobre salud:</p>
        <ul>
          <li>
            <b>No solicitamos información médica personal en formularios</b>
          </li>
          <li>
            <b>No diagnosticamos basándonos en comentarios</b>
          </li>
          <li>
            <b>No brindamos consejo personalizado por email/DM</b>
          </li>
        </ul>
        <p>
          Si tienes preguntas médicas personales, consulta a un profesional.
          No responderemos queries médicas directas por razones de
          responsabilidad.
        </p>
      </Section>

      <Section title="14. Modificaciones a Este Disclaimer">
        <p>
          Podemos actualizar este disclaimer. Cambios importantes se
          comunican vía email a suscriptores.
        </p>
      </Section>

      <Section title="15. Consentimiento al Usar el Sitio">
        <p>
          Al consumir contenido de Cerebros Esponjosos, aceptas que:
        </p>
        <ol>
          <li>
            Entiendes la diferencia entre contenido educativo y consejo
            médico
          </li>
          <li>
            No usarás este contenido como sustituto de evaluación
            profesional
          </li>
          <li>
            Consultarás a un profesional para decisiones médicas personales
          </li>
          <li>
            Aceptas las limitaciones de responsabilidad arriba descritas
          </li>
        </ol>
      </Section>

      <Section title="16. Preguntas Frecuentes">
        <SubSection title="¿Eres doctor?">
          <p>
            Soy Médico Residente en Neurología, lo que significa tengo
            formación médica y experiencia clínica, pero aún estoy
            completando especialización. Mis credenciales permiten
            perspectiva clínica, pero cada decisión médica debe ser
            discutida con el profesional que te atiende.
          </p>
        </SubSection>

        <SubSection title="¿Puedo usar tu contenido como referencia para mi doctor?">
          <p>
            Sí, es excelente. Si ves algo interesante, comparte la fuente
            con tu médico. Ellos pueden evaluar si es relevante a tu caso
            específico.
          </p>
        </SubSection>

        <SubSection title="¿Qué pasa si algo en tu contenido me causó un problema?">
          <p>
            Lamentamos cualquier daño. Contacta a{" "}
            <a href={`mailto:${CONTACT}`}>{CONTACT}</a> con detalles. Ten en
            cuenta que no tenemos responsabilidad legal por seguir
            recomendaciones sin consultar profesionales.
          </p>
        </SubSection>

        <SubSection title="¿Puedo traducir/compartir tu contenido?">
          <p>
            Puedes compartir con crédito ("Visto en Cerebros Esponjosos").
            Pero no traduzcas sin permiso explícito — la precisión
            científica puede perderse en traducción.
          </p>
        </SubSection>
      </Section>

      <Section title="17. Contacto">
        <p>
          Para preguntas sobre este disclaimer:{" "}
          <a href={`mailto:${CONTACT}`}>{CONTACT}</a>
        </p>
      </Section>

      <div className="mt-16 pt-8 border-t border-[var(--c-border)] text-sm text-[var(--c-text-faint)]">
        <p>
          <b>Versión:</b> 1.0 · <b>Efectivo desde:</b> 9 de abril de 2026 ·{" "}
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
