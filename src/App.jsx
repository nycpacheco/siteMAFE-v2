import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { SiteFrame } from "@/components/SiteFrame/SiteFrame";
import { HomePage } from "@/pages/Inicio/HomePage";
import { AboutPage } from "@/pages/QuemSomos/AboutPage";
import { GalleryPage } from "@/pages/Galeria/GalleryPage";
import { SupportersPage } from "@/pages/Apoiadores/SupportersPage";
import { NotFoundPage } from "@/pages/PaginaErro/NotFoundPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SiteFrame>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quem-somos" element={<AboutPage />} />
          <Route path="/galeria" element={<GalleryPage />} />
          <Route path="/apoiadores" element={<SupportersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </SiteFrame>
    </BrowserRouter>
  );
}
