import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Accessibility,
  Moon,
  Sun,
  Facebook,
  Instagram,
  Mail,
  Menu,
  MessageCircle,
  Phone,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { contactStatus, homeContent } from "@/lib/site-content";
import brandLogo from "@/assets/brandLogo.jpeg";
import styles from "./SiteFrame.module.css";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/quem-somos", label: "Quem Somos" },
  { to: "/galeria", label: "Galeria" },
  { to: "/apoiadores", label: "Apoiadores" },
];

export function SiteFrame({ children }) {
  const [highContrast, setHighContrast] = useState(false);
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    const contrast =
      window.localStorage.getItem("mafe-alto-contraste") === "true";
    setHighContrast(contrast);
    setDark(
      window.localStorage.getItem("mafe-modo-escuro") === "true" && !contrast,
    );
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.classList.toggle("high-contrast", highContrast);
    window.localStorage.setItem("mafe-modo-escuro", String(dark));
    window.localStorage.setItem("mafe-alto-contraste", String(highContrast));
  }, [ready, dark, highContrast]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);

  const toggleContrast = () => {
    setHighContrast((v) => !v);
    setDark(false);
  };

  const toggleDark = () => {
    setDark((v) => !v);
    setHighContrast(false);
  };

  return (
    <div className={styles.siteWrapper}>
      <a href="#conteudo" className={styles.skipLink}>
        Pular para o conteúdo
      </a>

      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link to="/" className={styles.brandLink}>
            <span className={styles.brandLogoBox}>
              <img
                src={brandLogo || "/favicon.png"}
                onError={(e) => {
                  e.currentTarget.src = "/favicon.png";
                }}
                alt="Escudo VOLLEYBALL do MAFE"
                className={styles.brandLogoImg}
              />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandSubtitle}>
                Equipe de Voleibol Adaptado
              </span>
              <span className={styles.brandTitle}>
                <span className={styles.brandHighlight}>MA</span>TURIDADE{" "}
                <span className={styles.brandHighlight}>FE</span>LIZ
                <span className={styles.brandDesktopOnly}> (MAFE)</span>
              </span>
            </span>
          </Link>

          <nav aria-label="Navegação principal" className={styles.navDesktop}>
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`.trim()}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleContrast}
            aria-pressed={highContrast}
            aria-label={
              highContrast ? "Usar contraste normal" : "Ativar alto contraste"
            }
            title="Alto contraste"
          >
            <Accessibility aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleDark}
            aria-pressed={dark}
            aria-label={dark ? "Usar modo claro" : "Ativar modo escuro"}
            title="Alternar tema"
          >
            {dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
          </Button>

          <Button
            variant="participate"
            className={styles.desktopParticipate}
            asChild
          >
            <a href={homeContent.whatsappUrl} target="_blank" rel="noreferrer">
              Participar
            </a>
          </Button>

          <Button
            variant="outline"
            size="icon"
            className={styles.mobileMenuBtn}
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="menu-celular"
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </Button>
        </div>

        {menuOpen && (
          <nav
            id="menu-celular"
            aria-label="Menu para celular"
            className={styles.mobileMenu}
          >
            {navItems.map((item) => {
              const isActive =
                item.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`${styles.mobileNavLink} ${isActive ? styles.mobileNavLinkActive : ""}`.trim()}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href={homeContent.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.mobileParticipateBtn}
              onClick={() => setMenuOpen(false)}
            >
              Participar
            </a>
          </nav>
        )}
      </header>

      <main id="conteudo" tabIndex={-1} className={styles.main}>
        {children}
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <a href="tel:+5511902439028" className={styles.footerLink}>
            <Phone aria-hidden="true" />
            <span>contato: {homeContent.footerPhone}</span>
          </a>

          <a
            href={`mailto:${contactStatus.email}`}
            className={`${styles.footerLink} ${styles.footerLinkCol1}`}
          >
            <Mail aria-hidden="true" />
            <span>Email: {contactStatus.email}</span>
          </a>

          <p className={styles.footerNote}>
            Deseja a remoção de alguma foto? Entre em contato via WhatsApp ou
            e-mail.
          </p>

          <div className={styles.footerSocials}>
            <Button
              asChild
              variant="ghost"
              size="icon"
              className={styles.socialBtnWhatsapp}
              title="WhatsApp"
            >
              <a
                href={homeContent.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Conversar pelo WhatsApp"
              >
                <MessageCircle aria-hidden="true" />
              </a>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled
              className={styles.socialBtnInstagram}
              aria-label="Instagram — endereço em atualização"
              title="Instagram — endereço em atualização"
            >
              <Instagram aria-hidden="true" />
            </Button>

            <Button
              asChild
              variant="ghost"
              size="icon"
              className={styles.socialBtnFacebook}
              title="Facebook"
            >
              <a
                href={homeContent.facebookUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Acessar Facebook"
              >
                <Facebook aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default SiteFrame;
