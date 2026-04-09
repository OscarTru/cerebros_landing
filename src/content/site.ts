export interface Founder {
  id: string
  name: string
  role: string
  photo: string
  bio: string
  orderLabel: string
}

export interface NavLink {
  label: string
  href: string
}

export const navLinks: NavLink[] = [
  { label: "Manifiesto", href: "#manifiesto" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contenido", href: "#contenido" },
  { label: "Newsletter", href: "#newsletter" },
]

export const hero = {
  eyebrow: "Educación en neurología · ES",
  titleTop: "Cerebros",
  titleBottom: "Esponjosos",
  subcopy:
    "Convertimos la neurología en algo que puedes entender, recordar y aplicar.",
  ctaPrimary: { label: "Conócenos", target: "#nosotros" },
  ctaSecondary: { label: "Colaboraciones", href: "/media-kit" },
}

export const manifestoText =
  "Ciencia y vida real. Medicina y narrativa. Dos residentes pensando en voz alta para que la neurología deje de sentirse como un idioma ajeno."

export const manifestoItalicWords = [
  "Ciencia",
  "vida",
  "real.",
  "narrativa.",
]

export const founders: Founder[] = [
  {
    id: "stephanie",
    name: "Stephanie",
    role: "Médica Residente · Co-Fundadora",
    photo: "/assets/stephanie.png",
    orderLabel: "01 — Co-fundadora",
    bio: "Al igual que Oscar, soy residente de neurología. Ambos compartimos una visión clara: la medicina y la ciencia suelen comunicarse de forma elitista y difícil. En este proyecto somos dos pilares de igual importancia. Mi rol es anclar nuestra conversación clínica en la empatía, aportando la perspectiva humana y asegurando que cada diagnóstico tenga sentido en la vida real.",
  },
  {
    id: "oscar",
    name: "Oscar",
    role: "Médico Residente · Co-Fundador",
    photo: "/assets/oscar.png",
    orderLabel: "02 — Co-fundador",
    bio: "Junto a Steph, navego las guardias y los libros sabiendo que la ciencia necesita una nueva voz. Nos frustra la divulgación innecesariamente compleja; por eso, nos dedicamos a desmenuzar y traducir. Cerebros Esponjosos es un proyecto de mutuo esfuerzo donde ninguno es más grande que el otro: somos dos residentes pensando en voz alta, complementándonos en tiempo real.",
  },
]

export const newsletter = {
  eyebrow: "El Privado",
  titleA: "La gente no solo aprende.",
  titleB: "Se queda por cómo lo contamos.",
  subcopy:
    "Una vez a la semana. Sin ruido. Solo lo que de verdad vale la pena recordar.",
  placeholder: "hola@tucorreo.com",
  cta: "Suscribirse",
  finePrint: "Cero spam. Te puedes salir cuando quieras.",
  success: "Ya eres parte. Nos vemos el martes.",
}

export const footer = {
  tagline: "Hecho con cuidado desde la residencia de neurología.",
  copyright: "© 2026 Steph & Oscar",
  columns: [
    {
      title: "Contenido",
      links: [
        { label: "YouTube", href: "#" },
        { label: "Podcast", href: "#" },
        { label: "Instagram", href: "#" },
        { label: "Blog", href: "#" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos", href: "#" },
        { label: "Privacidad", href: "#" },
      ],
    },
    {
      title: "Contacto",
      links: [{ label: "hola@cerebrosesponjosos.com", href: "mailto:hola@cerebrosesponjosos.com" }],
    },
  ],
}
