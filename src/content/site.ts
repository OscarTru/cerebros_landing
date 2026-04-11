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
  { label: "Blog", href: "/blog" },
]

export const hero = {
  eyebrow: "Educación en neurología · ES",
  titleTop: "Cerebros",
  titleBottom: "Esponjosos",
  subcopy:
    "Convertimos las Neurociencias en algo que puedas entender, recordar y aplicar.",
  ctaPrimary: { label: "Conócenos", target: "#nosotros" },
  ctaSecondary: { label: "Colaboraciones", href: "/media-kit" },
}

export const manifestoSegments: { text: string; italic: boolean }[] = [
  { text: "La neurociencia en palabras que entiendes.", italic: false },
  { text: "Dos residentes, una misión:", italic: true },
  { text: "convertir el trauma médico en curiosidad,", italic: false },
  { text: "la complejidad en historias,", italic: true },
  { text: "la ciencia en poder.", italic: false },
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
    "Aprende algo una vez por semana que no sabías que tu cerebro necesitaba.",
  placeholder: "hola@tucorreo.com",
  cta: "Suscribirse",
  finePrint: "Cero spam. Te puedes salir cuando quieras.",
  success: "Ya eres parte. Nos vemos el martes.",
}

export const footer = {
  tagline: "Entendiendo cómo funciona tu cerebro.",
  copyright: "© 2026 Steph & Oscar",
  columns: [
    {
      title: "Contenido",
      links: [
        { label: "Blog", href: "/blog" },
        { label: "Podcast", href: "/podcast" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Términos", href: "/terminos" },
        { label: "Privacidad", href: "/privacidad" },
        { label: "Cookies", href: "/cookies" },
        { label: "Disclaimer", href: "/disclaimer" },
      ],
    },
    {
      title: "Contacto",
      links: [
        {
          label: "contacto@cerebrosesponjosos.com",
          href: "mailto:contacto@cerebrosesponjosos.com",
        },
        { label: "Media Kit", href: "/media-kit" },
      ],
    },
  ],
}
