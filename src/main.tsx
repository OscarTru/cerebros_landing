/* eslint-disable react-refresh/only-export-components */
import { StrictMode, lazy, Suspense } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"
import { CookieBanner } from "./components/CookieBanner.tsx"

const Blog = lazy(() => import("./pages/Blog.tsx").then((m) => ({ default: m.Blog })))
const Podcast = lazy(() => import("./pages/Podcast.tsx").then((m) => ({ default: m.Podcast })))
const BlogPostRoute = lazy(() => import("./pages/BlogPostRoute.tsx").then((m) => ({ default: m.BlogPostRoute })))
const MediaKit = lazy(() => import("./pages/MediaKit.tsx").then((m) => ({ default: m.MediaKit })))
const Terminos = lazy(() => import("./pages/Terminos.tsx").then((m) => ({ default: m.Terminos })))
const Privacidad = lazy(() => import("./pages/Privacidad.tsx").then((m) => ({ default: m.Privacidad })))
const Cookies = lazy(() => import("./pages/Cookies.tsx").then((m) => ({ default: m.Cookies })))
const Disclaimer = lazy(() => import("./pages/Disclaimer.tsx").then((m) => ({ default: m.Disclaimer })))
const SuscripcionConfirma = lazy(() => import("./pages/SuscripcionConfirma.tsx").then((m) => ({ default: m.SuscripcionConfirma })))
const SuscripcionBienvenida = lazy(() => import("./pages/SuscripcionBienvenida.tsx").then((m) => ({ default: m.SuscripcionBienvenida })))
const Baja = lazy(() => import("./pages/Baja.tsx").then((m) => ({ default: m.Baja })))

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <CookieBanner />
      <Suspense fallback={<div className="min-h-screen bg-[var(--c-bg)]" />}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/podcast" element={<Podcast />} />
          <Route path="/blog/:slug" element={<BlogPostRoute />} />
          <Route path="/media-kit" element={<MediaKit />} />
          <Route path="/terminos" element={<Terminos />} />
          <Route path="/privacidad" element={<Privacidad />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/suscripcion/confirma" element={<SuscripcionConfirma />} />
          <Route path="/suscripcion/bienvenida" element={<SuscripcionBienvenida />} />
          <Route path="/baja" element={<Baja />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </StrictMode>
)
