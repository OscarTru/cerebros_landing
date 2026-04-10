import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { BlogPost } from "./pages/BlogPost.tsx"
import { MediaKit } from "./pages/MediaKit.tsx"
import { Terminos } from "./pages/Terminos.tsx"
import { Privacidad } from "./pages/Privacidad.tsx"
import { Cookies } from "./pages/Cookies.tsx"
import { Disclaimer } from "./pages/Disclaimer.tsx"
import { SuscripcionConfirma } from "./pages/SuscripcionConfirma.tsx"
import { SuscripcionBienvenida } from "./pages/SuscripcionBienvenida.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/media-kit" element={<MediaKit />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/disclaimer" element={<Disclaimer />} />
        <Route path="/suscripcion/confirma" element={<SuscripcionConfirma />} />
        <Route path="/suscripcion/bienvenida" element={<SuscripcionBienvenida />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
