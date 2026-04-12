import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { ScrollToTop } from "./components/ScrollToTop.tsx"
import { CookieBanner } from "./components/CookieBanner.tsx"
import { Blog } from "./pages/Blog.tsx"
import { Podcast } from "./pages/Podcast.tsx"
import { BlogPost } from "./pages/BlogPost.tsx"
import { MediaKit } from "./pages/MediaKit.tsx"
import { Terminos } from "./pages/Terminos.tsx"
import { Privacidad } from "./pages/Privacidad.tsx"
import { Cookies } from "./pages/Cookies.tsx"
import { Disclaimer } from "./pages/Disclaimer.tsx"
import { SuscripcionConfirma } from "./pages/SuscripcionConfirma.tsx"
import { SuscripcionBienvenida } from "./pages/SuscripcionBienvenida.tsx"
import { Baja } from "./pages/Baja.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <CookieBanner />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/podcast" element={<Podcast />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/media-kit" element={<MediaKit />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/suscripcion/confirma" element={<SuscripcionConfirma />} />
        <Route path="/suscripcion/bienvenida" element={<SuscripcionBienvenida />} />
        <Route path="/baja" element={<Baja />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
