import React, { useState } from "react";
import { ExternalLink, MessageCircle, Search } from "lucide-react";
import { PageBanner } from "@/components/PageBanner/PageBanner";
import { Button } from "@/components/ui/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog/Dialog";
import { homeContent, supporters } from "@/lib/site-content";
import styles from "./SupportersPage.module.css";

export function SupportersPage() {
  const [coordinationOpen, setCoordinationOpen] = useState(false);

  return (
    <>
      <PageBanner
        eyebrow="Quem torna isso possível"
        title="Apoiadores"
        text="Toque em um apoiador para ver os detalhes."
      />

      <section className={styles.sectionSpace}>
        <div className={styles.pageShell}>
          <ul
            className={styles.supportersList}
            aria-label="Lista de apoiadores"
          >
            {supporters.map((s) => (
              <li key={s.id}>
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Ver mais sobre ${s.name}`}
                      className={styles.supporterCard}
                    >
                      <span className={styles.logoWrapper}>
                        <img
                          src={s.logo}
                          alt=""
                          width={816}
                          height={816}
                          loading="lazy"
                          className={styles.logoImg}
                        />
                      </span>
                      <span className={styles.cardContent}>
                        <span className={styles.cardName}>{s.name}</span>
                        <span className={styles.cardSummary}>{s.summary}</span>
                        <span className={styles.cardAction}>
                          <Search aria-hidden="true" /> Ver mais
                        </span>
                      </span>
                    </button>
                  </DialogTrigger>

                  <DialogContent className={styles.dialogContentSupporter}>
                    <div className={styles.dialogGrid}>
                      <img
                        src={s.logo}
                        alt={`Logotipo de ${s.name}`}
                        width={816}
                        height={816}
                        className={styles.dialogLogo}
                      />
                      <div className={styles.dialogBody}>
                        <DialogHeader>
                          <DialogTitle className={styles.dialogTitle}>
                            {s.name}
                          </DialogTitle>
                          <DialogDescription
                            className={styles.dialogDescription}
                          >
                            {s.description}
                          </DialogDescription>
                        </DialogHeader>

                        <Button
                          variant="participate"
                          size="lg"
                          className={styles.dialogActionBtn}
                          disabled={!s.url}
                          asChild={!!s.url}
                        >
                          {s.url ? (
                            <a href={s.url} target="_blank" rel="noreferrer">
                              Acessar site <ExternalLink aria-hidden="true" />
                            </a>
                          ) : (
                            <span>Site em atualização</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
            ))}
          </ul>

          <div className={styles.ctaCard}>
            <p className={styles.ctaTitle}>Quer apoiar o MAFE?</p>
            <p className={styles.ctaText}>
              Empresas e parceiros podem entrar em contato para apoiar o grupo.
            </p>
            <Button
              variant="participate"
              size="lg"
              className={styles.ctaButton}
              onClick={() => setCoordinationOpen(true)}
            >
              <MessageCircle aria-hidden="true" /> Falar com a Coordenação
            </Button>
          </div>
        </div>
      </section>

      <Dialog open={coordinationOpen} onOpenChange={setCoordinationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contato com a Coordenação</DialogTitle>
            <DialogDescription>
              O número oficial direto da coordenadora ainda precisa ser
              informado pela coordenação. Você já pode conversar através do
              WhatsApp geral da equipe!
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
            <Button asChild variant="participate" size="lg">
              <a
                href={homeContent.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle aria-hidden="true" /> Abrir WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCoordinationOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default SupportersPage;
