import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  ImageIcon,
  Info,
  PlayCircle,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/Dialog/Dialog";
import { PageBanner } from "@/components/PageBanner/PageBanner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select/Select";
import { galleryItems } from "@/lib/site-content";
import styles from "./GalleryPage.module.css";

export function GalleryPage() {
  const [year, setYear] = useState("Todos");
  const [eventType, setEventType] = useState("Todos");

  const filtered = useMemo(
    () =>
      galleryItems.filter(
        (item) =>
          (year === "Todos" || item.year === year) &&
          (eventType === "Todos" || item.eventType === eventType),
      ),
    [year, eventType],
  );

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
                <strong>Como encontrar uma lembrança:</strong> escolha primeiro
                o ano e depois o tipo de evento. Toque em uma foto para ampliar
                e ler a história.
              </p>
            </div>

            <div className={styles.filterGrid}>
              <label className={styles.filterLabel}>
                <span className={styles.labelHeader}>
                  <CalendarDays
                    className={styles.labelIcon}
                    aria-hidden="true"
                  />{" "}
                  1. Escolha o ano
                </span>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger aria-label="Selecione o ano">
                    <SelectValue placeholder="Selecione o ano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os anos</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </label>

              <label className={styles.filterLabel}>
                <span className={styles.labelHeader}>
                  <ImageIcon className={styles.labelIcon} aria-hidden="true" />{" "}
                  2. Escolha o tipo
                </span>
                <Select value={eventType} onValueChange={setEventType}>
                  <SelectTrigger aria-label="Selecione o tipo de evento">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Todos">Todos os tipos</SelectItem>
                    <SelectItem value="Treinos">Treinos</SelectItem>
                    <SelectItem value="Competições">Competições</SelectItem>
                  </SelectContent>
                </Select>
              </label>
            </div>
          </div>

          <div className={styles.resultsBar}>
            <h2 className={styles.resultsTitle}>Resultados</h2>
            <p aria-live="polite" className={styles.resultsCount}>
              {filtered.length}{" "}
              {filtered.length === 1
                ? "registro encontrado"
                : "registros encontrados"}
            </p>
          </div>

          {filtered.length > 0 ? (
            <div className={styles.galleryGrid}>
              {filtered.map((item) => (
                <Dialog key={item.id}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className={styles.cardButton}
                      aria-label={`Ampliar ${item.title}`}
                    >
                      <div className={styles.imageWrapper}>
                        <img
                          src={item.image}
                          alt={item.title}
                          width={item.width}
                          height={item.height}
                          loading="lazy"
                          className={styles.cardImage}
                        />
                        <span className={styles.mediaBadge}>
                          {item.mediaType === "Vídeo" ? (
                            <PlayCircle aria-hidden="true" />
                          ) : (
                            <ImageIcon aria-hidden="true" />
                          )}
                          <span>{item.mediaType}</span>
                        </span>
                      </div>
                      <div className={styles.cardBody}>
                        <p className={styles.cardTitle}>{item.title}</p>
                        <p className={styles.cardMeta}>
                          {item.date} · {item.eventType}
                        </p>
                        <p className={styles.cardDescription}>
                          {item.description}
                        </p>
                        <span className={styles.cardAction}>
                          <Search aria-hidden="true" /> Ampliar
                        </span>
                      </div>
                    </button>
                  </DialogTrigger>

                  <DialogContent className={styles.modalContentLarge}>
                    <DialogClose />
                    <img
                      src={item.image}
                      alt={item.title}
                      width={item.width}
                      height={item.height}
                      className={styles.modalImage}
                    />
                    <DialogHeader>
                      <DialogTitle>{item.title}</DialogTitle>
                      <DialogDescription>
                        {item.date} · {item.eventType}
                      </DialogDescription>
                    </DialogHeader>
                    <p>{item.description}</p>
                    <p className={styles.modalNotice}>
                      <strong>Aviso:</strong> imagem ilustrativa temporária, que
                      será substituída pelo acervo autorizado da cliente.
                    </p>
                  </DialogContent>
                </Dialog>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Search className={styles.emptyIcon} aria-hidden="true" />
              <h3 className={styles.emptyTitle}>Nenhum registro encontrado</h3>
              <p className={styles.emptyText}>
                Escolha outra combinação de ano e tipo de evento.
              </p>
            </div>
          )}

          <p className={styles.bottomNotice}>
            <strong>Acervo em preparação:</strong> estas imagens são
            ilustrativas. A galeria está pronta para receber as fotos, legendas
            e vídeos reais selecionados pela coordenação.
          </p>
        </div>
      </section>
    </>
  );
}

export default GalleryPage;