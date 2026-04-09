import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import "./index.css"
import App from "./App.tsx"
import { MediaKit } from "./pages/MediaKit.tsx"
import { Terminos } from "./pages/Terminos.tsx"
import { Privacidad } from "./pages/Privacidad.tsx"
import { Cookies } from "./pages/Cookies.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/media-kit" element={<MediaKit />} />
        <Route path="/terminos" element={<Terminos />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
