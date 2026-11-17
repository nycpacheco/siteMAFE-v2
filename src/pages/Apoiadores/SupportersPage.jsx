import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ExternalLink,
  Eye,
  HeartHandshake,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { PageBanner } from "@/components/PageBanner/PageBanner";
import { Button } from "@/components/ui/Button/Button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { useSupportersData } from "@/hooks/useSiteContent";
import { sanitizeExternalUrl } from "@/lib/media-utils";
import { homeContent } from "@/lib/site-content";
import { registrarVisualizacaoApoiador } from "@/services/api";
import styles from "./SupportersPage.module.css";

function SupporterLogo({ logoUrl, name, className }) {
  const [failed, setFailed] = useState(false);

  if (!logoUrl || failed) {
    return (
      <div className={styles.logoFallback}>
        <HeartHandshake size={42} aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={`Logotipo de ${name}`}
      loading="lazy"
      className={className}
      onError={() => setFailed(true)}
    />
  );
}

export function SupportersPage() {
  const { supporters, loading, error, refresh, updateSupporterViews } =
    useSupportersData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedSupporter, setSelectedSupporter] = useState(null);
  const [coordinationOpen, setCoordinationOpen] = useState(false);
  const [highlightedId, setHighlightedId] = useState(null);
  const [missingNotice, setMissingNotice] = useState(false);

  const handledDeepLinkRef = useRef(null);
  const inFlightViewRef = useRef(new Set());

  const targetSupporterParam = searchParams.get("apoiador");

  useEffect(() => {
    if (loading || error || !targetSupporterParam) return;
    if (handledDeepLinkRef.current === targetSupporterParam) return;

    const targetId = Number(targetSupporterParam);
    const exists =
      Number.isInteger(targetId) && supporters.some((s) => s.id === targetId);

    handledDeepLinkRef.current = targetSupporterParam;

    if (!exists) {
      setMissingNotice(true);
      setHighlightedId(null);
      return;
    }

    setMissingNotice(false);
    setHighlightedId(targetId);

    const scrollTimer = window.setTimeout(() => {
      const el = document.querySelector(`[data-supporter-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [loading, error, targetSupporterParam, supporters]);

  const handleOpenSupporter = async (supporter) => {
    setSelectedSupporter(supporter);

    if (inFlightViewRef.current.has(supporter.id)) return;
    inFlightViewRef.current.add(supporter.id);

    try {
      const updated = await registrarVisualizacaoApoiador(supporter.id);
      updateSupporterViews(supporter.id, updated.visualizacoes);
      setSelectedSupporter((prev) =>
        prev && prev.id === supporter.id
          ? { ...prev, visualizacoes: updated.visualizacoes }
          : prev
      );
    } catch (err) {
      console.warn(
        "[Apoiadores] Falha ao registrar visualização:",
        err?.message
      );
    } finally {
      inFlightViewRef.current.delete(supporter.id);
    }
  };

  const dismissMissingNotice = () => {
    setMissingNotice(false);
    const next = new URLSearchParams(searchParams);
    next.delete("apoiador");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <PageBanner
        eyebrow="Quem torna isso possível"
        title="Apoiadores"
        text="Toque em um apoiador para ver os detalhes."
      />

      <section className={styles.sectionSpace}>
        <div className={styles.pageShell}>
          {missingNotice && (
            <div className={styles.noticeBanner} role="status">
              <span>
                O apoiador selecionado não está mais disponível ou foi
                desativado.
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={dismissMissingNotice}
                aria-label="Fechar aviso"
              >
                <X size={16} aria-hidden="true" />
              </Button>
            </div>
          )}

          {loading ? (
            <div className={styles.stateBox} role="status" aria-live="polite">
              <Loader2 className={styles.stateIcon} aria-hidden="true" />
              <h2 className={styles.stateTitle}>Carregando apoiadores...</h2>
              <p className={styles.stateText}>
                Buscando parceiros cadastrados no sistema.
              </p>
            </div>
          ) : error ? (
            <div className={styles.stateBox} role="alert">
              <AlertCircle className={styles.stateIcon} aria-hidden="true" />
              <h2 className={styles.stateTitle}>
                Não foi possível carregar os apoiadores
              </h2>
              <p className={styles.stateText}>
                {error.message || "Verifique a conexão com o servidor."}
              </p>
              <Button variant="participate" onClick={refresh}>
                <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
              </Button>
            </div>
          ) : supporters.length > 0 ? (
            <ul
              className={styles.supportersList}
              aria-label="Lista de apoiadores"
            >
              {supporters.map((s) => {
                const isHighlighted = highlightedId === s.id;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      data-supporter-id={s.id}
                      data-highlighted={isHighlighted ? "true" : "false"}
                      onClick={() => handleOpenSupporter(s)}
                      aria-label={`Ver mais sobre ${s.nome_empresa}`}
                      className={`${styles.supporterCard} ${
                        isHighlighted ? styles.highlightedCard : ""
                      }`.trim()}
                    >
                      <span className={styles.logoWrapper}>
                        <SupporterLogo
                          logoUrl={s.logo_url}
                          name={s.nome_empresa}
                          className={styles.logoImg}
                        />
                      </span>
                      <span className={styles.cardContent}>
                        <span className={styles.cardName}>
                          {s.nome_empresa}
                        </span>
                        {s.descricao && (
                          <span className={styles.cardSummary}>
                            {s.descricao}
                          </span>
                        )}
                        <span className={styles.cardViews}>
                          <Eye size={15} aria-hidden="true" />
                          {s.visualizacoes}{" "}
                          {s.visualizacoes === 1
                            ? "visualização"
                            : "visualizações"}
                        </span>
                        <span className={styles.cardAction}>
                          <Search aria-hidden="true" /> Ver mais
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className={styles.stateBox}>
              <HeartHandshake className={styles.stateIcon} aria-hidden="true" />
              <h2 className={styles.stateTitle}>
                Nenhum apoiador ativo cadastrado
              </h2>
              <p className={styles.stateText}>
                Os parceiros cadastrados no painel administrativo aparecerão aqui.
              </p>
            </div>
          )}

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

      <Dialog
        open={Boolean(selectedSupporter)}
        onOpenChange={(open) => {
          if (!open) setSelectedSupporter(null);
        }}
      >
        {selectedSupporter && (
          <DialogContent className={styles.dialogContentSupporter}>
            <DialogClose aria-label="Fechar detalhes do apoiador" />
            <div className={styles.dialogGrid}>
              <div className={styles.logoWrapper}>
                <SupporterLogo
                  logoUrl={selectedSupporter.logo_url}
                  name={selectedSupporter.nome_empresa}
                  className={styles.dialogLogo}
                />
              </div>
              <div className={styles.dialogBody}>
                <DialogHeader>
                  <DialogTitle className={styles.dialogTitle}>
                    {selectedSupporter.nome_empresa}
                  </DialogTitle>
                  <DialogDescription className={styles.dialogDescription}>
                    {selectedSupporter.descricao ||
                      "Parceiro oficial do grupo Maturidade Feliz (MAFE)."}
                  </DialogDescription>
                </DialogHeader>

                <p
                  className={styles.modalViews}
                  data-testid="modal-supporter-views"
                >
                  <Eye size={18} aria-hidden="true" />
                  {selectedSupporter.visualizacoes}{" "}
                  {selectedSupporter.visualizacoes === 1
                    ? "visualização"
                    : "visualizações"}
                </p>

                {sanitizeExternalUrl(selectedSupporter.site_url) ? (
                  <Button
                    variant="participate"
                    size="lg"
                    className={styles.dialogActionBtn}
                    asChild
                  >
                    <a
                      href={sanitizeExternalUrl(selectedSupporter.site_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Acessar site <ExternalLink aria-hidden="true" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    variant="participate"
                    size="lg"
                    className={styles.dialogActionBtn}
                    disabled
                  >
                    <span>Site não informado</span>
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={coordinationOpen} onOpenChange={setCoordinationOpen}>
        <DialogContent>
          <DialogClose aria-label="Fechar contato com a coordenação" />
          <DialogHeader>
            <DialogTitle>Contato com a Coordenação</DialogTitle>
            <DialogDescription>
              Converse diretamente através do WhatsApp oficial da equipe MAFE
              para saber como apoiar nossos treinos e torneios!
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
