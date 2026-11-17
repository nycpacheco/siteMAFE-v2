import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  ExternalLink,
  Eye,
  Film,
  Image as ImageIcon,
  Info,
  Loader2,
  PlayCircle,
  RefreshCw,
  Search,
  Tag,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { PageBanner } from "@/components/PageBanner/PageBanner";
import { Button } from "@/components/ui/Button/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { useGalleryData } from "@/hooks/useSiteContent";
import {
  filterGalleryItems,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  isDirectVideoUrl,
  sanitizeExternalUrl,
  sortGalleryItems,
} from "@/lib/media-utils";
import { registrarVisualizacaoMidia } from "@/services/api";
import styles from "./GalleryPage.module.css";

function GalleryCardThumbnail({ item }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (item.tipo_midia === "video") {
    const ytThumb = getYouTubeThumbnailUrl(item.url_midia);
    if (ytThumb && !imgFailed) {
      return (
        <img
          src={ytThumb}
          alt={`Miniatura do vídeo ${item.titulo}`}
          loading="lazy"
          className={styles.cardImage}
          onError={() => setImgFailed(true)}
        />
      );
    }

    return (
      <div className={styles.videoThumbFallback}>
        <PlayCircle className={styles.videoThumbIcon} aria-hidden="true" />
        <span>Reproduzir vídeo</span>
      </div>
    );
  }

  if (!item.url_midia || imgFailed) {
    return (
      <div className={styles.videoThumbFallback}>
        <ImageIcon className={styles.videoThumbIcon} aria-hidden="true" />
        <span>Imagem indisponível</span>
      </div>
    );
  }

  return (
    <img
      src={item.url_midia}
      alt={item.titulo}
      loading="lazy"
      className={styles.cardImage}
      onError={() => setImgFailed(true)}
    />
  );
}

function ModalMediaViewer({ item }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!item) return null;

  if (item.tipo_midia === "video") {
    const embedUrl = getYouTubeEmbedUrl(item.url_midia);
    if (embedUrl) {
      return (
        <div className={styles.modalVideoFrameWrap}>
          <iframe
            src={embedUrl}
            title={item.titulo}
            className={styles.modalIframe}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }

    if (isDirectVideoUrl(item.url_midia)) {
      return (
        <video
          controls
          preload="metadata"
          src={item.url_midia}
          className={styles.modalVideo}
        >
          Seu navegador não suporta a reprodução de vídeo.
        </video>
      );
    }

    const safeExternal = sanitizeExternalUrl(item.url_midia);
    return (
      <div className={styles.modalVideoFallback}>
        <PlayCircle className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>
          Este vídeo está hospedado em um player externo e não pôde ser
          incorporado diretamente.
        </p>
        {safeExternal ? (
          <Button asChild variant="participate">
            <a href={safeExternal} target="_blank" rel="noopener noreferrer">
              Assistir vídeo externo <ExternalLink aria-hidden="true" />
            </a>
          </Button>
        ) : (
          <p className={styles.cardMeta}>URL do vídeo indisponível.</p>
        )}
      </div>
    );
  }

  if (!item.url_midia || imgFailed) {
    return (
      <div className={styles.modalVideoFallback}>
        <ImageIcon className={styles.emptyIcon} aria-hidden="true" />
        <p className={styles.emptyText}>Não foi possível carregar esta imagem.</p>
      </div>
    );
  }

  return (
    <img
      src={item.url_midia}
      alt={item.titulo}
      className={styles.modalImage}
      onError={() => setImgFailed(true)}
    />
  );
}

export function GalleryPage() {
  const { midias, categorias, loading, error, refresh, updateMidiaViews } =
    useGalleryData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [categoriaId, setCategoriaId] = useState("Todas");
  const [tipoMidia, setTipoMidia] = useState("Ambos");
  const [ano, setAno] = useState("Todos");
  const [busca, setBusca] = useState("");

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [highlightedId, setHighlightedId] = useState(null);
  const [missingMediaNotice, setMissingMediaNotice] = useState(false);

  const handledDeepLinkRef = useRef(null);
  const inFlightViewRef = useRef(new Set());

  const availableYears = useMemo(
    () =>
      Array.from(new Set(midias.map((item) => String(item.ano))))
        .filter(Boolean)
        .sort((a, b) => Number(b) - Number(a)),
    [midias]
  );

  const selectedCategoryLabel = useMemo(() => {
    if (categoriaId === "Todas") return "Todas as categorias";
    const found = categorias.find((c) => String(c.id) === String(categoriaId));
    return found ? found.nome : "Todas as categorias";
  }, [categoriaId, categorias]);

  const selectedYearLabel = useMemo(() => {
    return ano === "Todos" ? "Todos os anos" : ano;
  }, [ano]);

  const filtered = useMemo(() => {
    const matched = filterGalleryItems(midias, {
      categoriaId,
      tipoMidia,
      ano,
      busca,
    });
    return sortGalleryItems(matched);
  }, [midias, categoriaId, tipoMidia, ano, busca]);

  const hasActiveFilters =
    categoriaId !== "Todas" ||
    tipoMidia !== "Ambos" ||
    ano !== "Todos" ||
    busca.trim() !== "";

  const clearFilters = () => {
    setCategoriaId("Todas");
    setTipoMidia("Ambos");
    setAno("Todos");
    setBusca("");
  };

  // Handle deep-link ?midia=<id> after gallery loads
  const targetMidiaParam = searchParams.get("midia");

  useEffect(() => {
    if (loading || error || !targetMidiaParam) return;
    if (handledDeepLinkRef.current === targetMidiaParam) return;

    const targetId = Number(targetMidiaParam);
    const exists = Number.isInteger(targetId) && midias.some((m) => m.id === targetId);

    handledDeepLinkRef.current = targetMidiaParam;

    if (!exists) {
      setMissingMediaNotice(true);
      setHighlightedId(null);
      return;
    }

    setMissingMediaNotice(false);
    setCategoriaId("Todas");
    setTipoMidia("Ambos");
    setAno("Todos");
    setBusca("");
    setHighlightedId(targetId);

    const scrollTimer = window.setTimeout(() => {
      const el = document.querySelector(`[data-media-id="${targetId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 120);

    return () => window.clearTimeout(scrollTimer);
  }, [loading, error, targetMidiaParam, midias]);

  const handleOpenMedia = async (item) => {
    setSelectedMedia(item);

    if (inFlightViewRef.current.has(item.id)) return;
    inFlightViewRef.current.add(item.id);

    try {
      const updated = await registrarVisualizacaoMidia(item.id);
      updateMidiaViews(item.id, updated.visualizacoes);
      setSelectedMedia((prev) =>
        prev && prev.id === item.id
          ? { ...prev, visualizacoes: updated.visualizacoes }
          : prev
      );
    } catch (err) {
      console.warn("[Galeria] Falha ao registrar visualização:", err?.message);
    } finally {
      inFlightViewRef.current.delete(item.id);
    }
  };

  const dismissMissingNotice = () => {
    setMissingMediaNotice(false);
    const next = new URLSearchParams(searchParams);
    next.delete("midia");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <PageBanner
        eyebrow="Fotos e vídeos"
        title="Galeria"
        text="Memórias de treinos, encontros e competições do Maturidade Feliz."
      />

      <section className={styles.sectionSpace}>
        <div className={styles.pageShell}>
          <div className={styles.filterCard}>
            <div className={styles.infoBanner}>
              <Info className={styles.infoIcon} aria-hidden="true" />
              <p>
                <strong>Como encontrar uma lembrança:</strong> pesquise pelo
                título ou combine categoria, tipo de mídia e ano. Toque em um
                registro para ampliar ou assistir.
              </p>
            </div>

            <div className={styles.searchRow}>
              <label htmlFor="galeria-busca" className={styles.labelHeader}>
                <Search className={styles.labelIcon} aria-hidden="true" />
                Pesquisar por título
              </label>
              <div className={styles.searchInputWrapper}>
                <Search className={styles.searchIcon} aria-hidden="true" />
                <input
                  id="galeria-busca"
                  type="search"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Digite o título da foto ou vídeo..."
                  className={styles.searchInput}
                />
              </div>
            </div>

            <div className={styles.filterGrid}>
              <div className={styles.filterLabel}>
                <span className={styles.labelHeader}>
                  <Tag className={styles.labelIcon} aria-hidden="true" />
                  Categoria
                </span>
                <Select value={categoriaId} onValueChange={setCategoriaId}>
                  <SelectTrigger aria-label="Selecione a categoria">
                    <SelectValue placeholder="Todas as categorias">
                      {selectedCategoryLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todas">Todas as categorias</SelectItem>
                    {categorias.map((cat) => (
                      <SelectItem key={cat.id} value={String(cat.id)}>
                        {cat.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className={styles.filterLabel}>
                <span className={styles.labelHeader}>
                  <Film className={styles.labelIcon} aria-hidden="true" />
                  Tipo de mídia
                </span>
                <div
                  role="group"
                  aria-label="Filtrar por tipo de mídia"
                  className={styles.typeToggleGroup}
                >
                  {[
                    { value: "Ambos", label: "Ambos" },
                    { value: "foto", label: "Fotos" },
                    { value: "video", label: "Vídeos" },
                  ].map((opt) => {
                    const active = tipoMidia === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setTipoMidia(opt.value)}
                        className={`${styles.typeToggleBtn} ${
                          active ? styles.typeToggleBtnActive : ""
                        }`.trim()}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.filterLabel}>
                <span className={styles.labelHeader}>
                  <CalendarDays
                    className={styles.labelIcon}
                    aria-hidden="true"
                  />
                  Ano
                </span>
                <Select value={ano} onValueChange={setAno}>
                  <SelectTrigger aria-label="Selecione o ano">
                    <SelectValue placeholder="Todos os anos">
                      {selectedYearLabel}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os anos</SelectItem>
                    {availableYears.map((yr) => (
                      <SelectItem key={yr} value={yr}>
                        {yr}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {missingMediaNotice && (
            <div className={styles.noticeBanner} role="status">
              <span>
                A mídia selecionada não está mais disponível ou foi desativada.
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

          <div className={styles.resultsBar}>
            <h2 className={styles.resultsTitle}>Resultados</h2>
            <div className={styles.resultsMeta}>
              <p
                aria-live="polite"
                data-testid="gallery-results-count"
                className={styles.resultsCount}
              >
                {filtered.length}{" "}
                {filtered.length === 1
                  ? "registro encontrado"
                  : "registros encontrados"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>

          {loading ? (
            <div className={styles.emptyState} role="status" aria-live="polite">
              <Loader2 className={styles.emptyIcon} aria-hidden="true" />
              <h3 className={styles.emptyTitle}>Carregando galeria...</h3>
              <p className={styles.emptyText}>
                Buscando fotos e vídeos cadastrados.
              </p>
            </div>
          ) : error ? (
            <div className={styles.emptyState} role="alert">
              <AlertCircle className={styles.emptyIcon} aria-hidden="true" />
              <h3 className={styles.emptyTitle}>
                Não foi possível carregar a galeria
              </h3>
              <p className={styles.emptyText}>
                {error.message || "Verifique a conexão com o servidor."}
              </p>
              <Button variant="participate" onClick={refresh}>
                <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
              </Button>
            </div>
          ) : filtered.length > 0 ? (
            <div className={styles.galleryGrid}>
              {filtered.map((item) => {
                const isHighlighted = highlightedId === item.id;
                const tipoLabel = item.tipo_midia === "video" ? "Vídeo" : "Foto";

                return (
                  <button
                    key={item.id}
                    type="button"
                    data-media-id={item.id}
                    data-highlighted={isHighlighted ? "true" : "false"}
                    onClick={() => handleOpenMedia(item)}
                    className={`${styles.cardButton} ${
                      isHighlighted ? styles.highlightedCard : ""
                    }`.trim()}
                    aria-label={`Abrir detalhes de ${item.titulo}`}
                  >
                    <div className={styles.imageWrapper}>
                      <GalleryCardThumbnail item={item} />
                      <span className={styles.mediaBadge}>
                        {item.tipo_midia === "video" ? (
                          <PlayCircle size={16} aria-hidden="true" />
                        ) : (
                          <ImageIcon size={16} aria-hidden="true" />
                        )}
                        <span>{tipoLabel}</span>
                      </span>
                      <span className={styles.viewsBadge}>
                        <Eye size={15} aria-hidden="true" />
                        <span>{item.visualizacoes}</span>
                      </span>
                    </div>

                    <div className={styles.cardBody}>
                      <p className={styles.cardTitle}>{item.titulo}</p>
                      <p className={styles.cardMeta}>
                        {item.ano}
                        {item.categoria_nome ? ` · ${item.categoria_nome}` : ""}
                      </p>
                      {item.descricao && (
                        <p className={styles.cardDescription}>
                          {item.descricao}
                        </p>
                      )}
                      <div className={styles.cardFooterRow}>
                        <span className={styles.cardAction}>
                          <Search size={18} aria-hidden="true" />
                          {item.tipo_midia === "video"
                            ? "Assistir vídeo"
                            : "Ampliar foto"}
                        </span>
                        <span className={styles.cardViewsInline}>
                          {item.visualizacoes}{" "}
                          {item.visualizacoes === 1
                            ? "visualização"
                            : "visualizações"}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Search className={styles.emptyIcon} aria-hidden="true" />
              <h3 className={styles.emptyTitle}>Nenhum registro encontrado</h3>
              <p className={styles.emptyText}>
                {hasActiveFilters
                  ? "Tente ajustar a pesquisa, categoria, tipo de mídia ou ano."
                  : "Nenhuma mídia ativa foi cadastrada na galeria até o momento."}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(selectedMedia)}
        onOpenChange={(open) => {
          if (!open) setSelectedMedia(null);
        }}
      >
        {selectedMedia && (
          <DialogContent className={styles.modalContentLarge}>
            <DialogClose aria-label="Fechar detalhes da mídia" />
            <ModalMediaViewer item={selectedMedia} />
            <DialogHeader>
              <DialogTitle>{selectedMedia.titulo}</DialogTitle>
              <DialogDescription>
                <span className={styles.modalMetaRow}>
                  <span>
                    {selectedMedia.ano}
                    {selectedMedia.categoria_nome
                      ? ` · ${selectedMedia.categoria_nome}`
                      : ""}
                    {` · ${
                      selectedMedia.tipo_midia === "video" ? "Vídeo" : "Foto"
                    }`}
                  </span>
                  <span
                    className={styles.modalViewsBadge}
                    data-testid="modal-media-views"
                  >
                    <Eye size={18} aria-hidden="true" />
                    {selectedMedia.visualizacoes}{" "}
                    {selectedMedia.visualizacoes === 1
                      ? "visualização"
                      : "visualizações"}
                  </span>
                </span>
              </DialogDescription>
            </DialogHeader>
            {selectedMedia.descricao && <p>{selectedMedia.descricao}</p>}
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export default GalleryPage;