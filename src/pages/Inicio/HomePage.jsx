import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useEmblaCarousel from "embla-carousel-react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Facebook,
  HeartHandshake,
  Image as ImageIcon,
  Loader2,
  Mail,
  Phone,
  PlayCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { useHomeData } from "@/hooks/useSiteContent";
import { getYouTubeThumbnailUrl } from "@/lib/media-utils";
import { contactStatus, homeContent } from "@/lib/site-content";
import styles from "./HomePage.module.css";

function MomentMediaPreview({ item, eager }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (item.tipo_midia === "video") {
    const ytThumb = getYouTubeThumbnailUrl(item.url_midia);
    if (ytThumb && !imgFailed) {
      return (
        <>
          <img
            src={ytThumb}
            alt={`Miniatura do vídeo: ${item.titulo}`}
            loading={eager ? "eager" : "lazy"}
            className={styles.momentImage}
            onError={() => setImgFailed(true)}
          />
          <span className={styles.mediaTypeBadge}>
            <PlayCircle size={16} aria-hidden="true" />
            <span>Vídeo</span>
          </span>
        </>
      );
    }

    return (
      <div className={styles.videoPoster}>
        <PlayCircle className={styles.videoPosterIcon} aria-hidden="true" />
        <span className={styles.videoPosterTitle}>{item.titulo}</span>
        <span className={styles.mediaTypeBadge}>
          <PlayCircle size={16} aria-hidden="true" />
          <span>Vídeo</span>
        </span>
      </div>
    );
  }

  return (
    <>
      {!imgFailed && item.url_midia ? (
        <img
          src={item.url_midia}
          alt={item.titulo || "Momento MAFE"}
          loading={eager ? "eager" : "lazy"}
          className={styles.momentImage}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div className={styles.videoPoster}>
          <ImageIcon className={styles.videoPosterIcon} aria-hidden="true" />
          <span className={styles.videoPosterTitle}>{item.titulo}</span>
        </div>
      )}
      <span className={styles.mediaTypeBadge}>
        <ImageIcon size={16} aria-hidden="true" />
        <span>Foto</span>
      </span>
    </>
  );
}

function SupporterLogoPreview({ item }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!item.logo_url || imgFailed) {
    return (
      <div className={styles.supporterLogoBox}>
        <HeartHandshake className={styles.supporterHeartIcon} aria-hidden="true" />
        <span className={styles.supporterLogoText}>{item.nome_empresa}</span>
      </div>
    );
  }

  return (
    <div className={styles.supporterLogoBox}>
      <img
        src={item.logo_url}
        alt={`Logotipo de ${item.nome_empresa}`}
        loading="lazy"
        className={styles.supporterLogoImg}
        onError={() => setImgFailed(true)}
      />
    </div>
  );
}

export function HomePage() {
  const {
    recentMoments,
    supporters,
    loadingMoments,
    loadingSupporters,
    momentsError,
    supportersError,
    refresh,
  } = useHomeData();

  const [momentsRef, momentsApi] = useEmblaCarousel({
    loop: recentMoments.length > 1,
  });
  const [supportersRef, supportersApi] = useEmblaCarousel({
    loop: supporters.length > 1,
  });

  const [moment, setMoment] = useState(0);
  const [supporter, setSupporter] = useState(0);
  const [momentsPaused, setMomentsPaused] = useState(false);
  const [supportersPaused, setSupportersPaused] = useState(false);
  const [momentsTick, setMomentsTick] = useState(0);
  const [supportersTick, setSupportersTick] = useState(0);

  const syncMoments = useCallback(
    () => setMoment(momentsApi?.selectedScrollSnap() ?? 0),
    [momentsApi]
  );
  const syncSupporters = useCallback(
    () => setSupporter(supportersApi?.selectedScrollSnap() ?? 0),
    [supportersApi]
  );

  useEffect(() => {
    if (!momentsApi) return;
    momentsApi.on("select", syncMoments);
    momentsApi.on("reInit", syncMoments);
    return () => {
      momentsApi.off("select", syncMoments);
      momentsApi.off("reInit", syncMoments);
    };
  }, [momentsApi, syncMoments]);

  useEffect(() => {
    if (!supportersApi) return;
    supportersApi.on("select", syncSupporters);
    supportersApi.on("reInit", syncSupporters);
    return () => {
      supportersApi.off("select", syncSupporters);
      supportersApi.off("reInit", syncSupporters);
    };
  }, [supportersApi, syncSupporters]);

  // Re-sync Embla when data arrives asynchronously
  useEffect(() => {
    momentsApi?.reInit();
  }, [momentsApi, recentMoments]);

  useEffect(() => {
    supportersApi?.reInit();
  }, [supportersApi, supporters]);

  // Autoplay moments every 5s
  useEffect(() => {
    if (!momentsApi || recentMoments.length <= 1 || momentsPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      momentsApi.scrollNext();
    }, 5000);
    return () => window.clearInterval(timer);
  }, [momentsApi, recentMoments.length, momentsPaused, momentsTick]);

  // Autoplay supporters every 5.5s
  useEffect(() => {
    if (!supportersApi || supporters.length <= 1 || supportersPaused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const timer = window.setInterval(() => {
      supportersApi.scrollNext();
    }, 5500);
    return () => window.clearInterval(timer);
  }, [supportersApi, supporters.length, supportersPaused, supportersTick]);

  const handleMomentsPrev = () => {
    momentsApi?.scrollPrev();
    setMomentsTick((t) => t + 1);
  };

  const handleMomentsNext = () => {
    momentsApi?.scrollNext();
    setMomentsTick((t) => t + 1);
  };

  const handleMomentsDot = (index) => {
    momentsApi?.scrollTo(index);
    setMomentsTick((t) => t + 1);
  };

  const handleSupportersPrev = () => {
    supportersApi?.scrollPrev();
    setSupportersTick((t) => t + 1);
  };

  const handleSupportersNext = () => {
    supportersApi?.scrollNext();
    setSupportersTick((t) => t + 1);
  };

  const handleSupportersDot = (index) => {
    supportersApi?.scrollTo(index);
    setSupportersTick((t) => t + 1);
  };

  return (
    <div className={styles.homeGrid}>
      <section
        aria-label="Momentos que ficam"
        className={styles.momentsSection}
        onMouseEnter={() => setMomentsPaused(true)}
        onMouseLeave={() => setMomentsPaused(false)}
        onFocus={() => setMomentsPaused(true)}
        onBlur={() => setMomentsPaused(false)}
      >
        <header className={styles.sectionHeader}>
          <div className={styles.headerTitleWrapper}>
            <p className={styles.eyebrowText}>Nossa História</p>
            <h1 className={styles.sectionHeading}>Momentos que Ficam</h1>
          </div>
          <Button asChild variant="outline" size="icon" title="Ver galeria">
            <Link to="/galeria" aria-label="Ver galeria">
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </header>

        {loadingMoments ? (
          <div className={styles.stateBox} role="status" aria-live="polite">
            <Loader2 className={styles.stateIcon} aria-hidden="true" />
            <p className={styles.stateTitle}>Carregando momentos recentes...</p>
          </div>
        ) : momentsError ? (
          <div className={styles.stateBox} role="alert">
            <AlertCircle className={styles.stateIcon} aria-hidden="true" />
            <p className={styles.stateTitle}>Não foi possível carregar os momentos</p>
            <p className={styles.stateText}>
              {momentsError.message || "Verifique a conexão com o servidor."}
            </p>
            <Button variant="outline" onClick={refresh}>
              <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
            </Button>
          </div>
        ) : recentMoments.length === 0 ? (
          <div className={styles.stateBox}>
            <ImageIcon className={styles.stateIcon} aria-hidden="true" />
            <p className={styles.stateTitle}>Nenhuma mídia recente disponível</p>
            <p className={styles.stateText}>
              Novas fotos e vídeos cadastrados no painel aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          <>
            <div ref={momentsRef} className={styles.carouselViewport}>
              <div className={styles.carouselContainer}>
                {recentMoments.map((item, i) => (
                  <figure
                    key={item.id}
                    className={styles.momentSlide}
                    aria-hidden={moment !== i}
                  >
                    <Link
                      to={`/galeria?midia=${item.id}`}
                      className={styles.momentMediaLink}
                      tabIndex={moment === i ? 0 : -1}
                      aria-label={`Ver na galeria: ${item.titulo}`}
                    >
                      <MomentMediaPreview item={item} eager={i === 0} />
                    </Link>

                    <figcaption className={styles.momentCaption}>
                      <h2 className={styles.momentTitle}>{item.titulo}</h2>
                      <p className={styles.momentMeta}>
                        {item.ano}
                        {item.categoria_nome ? ` · ${item.categoria_nome}` : ""}
                      </p>
                      {item.descricao && (
                        <p className={styles.momentDesc}>{item.descricao}</p>
                      )}
                      <div className={styles.momentActionRow}>
                        <Button
                          asChild
                          variant="participate"
                          tabIndex={moment === i ? 0 : -1}
                        >
                          <Link to={`/galeria?midia=${item.id}`}>
                            Ver na galeria <ArrowRight aria-hidden="true" />
                          </Link>
                        </Button>
                      </div>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {recentMoments.length > 1 && (
              <div
                className={styles.carouselControls}
                aria-label="Controles dos momentos"
              >
                <Button
                  variant="participate"
                  size="icon"
                  aria-label="Momento anterior"
                  onClick={handleMomentsPrev}
                >
                  <ArrowLeft aria-hidden="true" />
                </Button>

                <div className={styles.dotsContainer}>
                  {recentMoments.map((item, i) => (
                    <button
                      key={item.id}
                      type="button"
                      className={styles.dotBtn}
                      aria-label={`Mostrar momento ${i + 1}`}
                      aria-pressed={moment === i}
                      onClick={() => handleMomentsDot(i)}
                    >
                      <span
                        className={`${styles.dotIndicator} ${
                          moment === i ? styles.dotActive : styles.dotInactive
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <Button
                  variant="participate"
                  size="icon"
                  aria-label="Próximo momento"
                  onClick={handleMomentsNext}
                >
                  <ArrowRight aria-hidden="true" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <div className={styles.sideCol}>
        <section
          aria-labelledby="contato-titulo"
          className={styles.contactCard}
        >
          <h2 id="contato-titulo" className={styles.contactTitle}>
            Contato
          </h2>
          <address className={styles.contactList}>
            {[
              {
                Icon: Phone,
                label: "Telefone/Whatsapp",
                text: contactStatus.whatsapp,
                href: homeContent.whatsappUrl,
              },
              {
                Icon: Facebook,
                label: "Facebook",
                text: contactStatus.facebook,
                href: homeContent.facebookUrl,
              },
              {
                Icon: Mail,
                label: "E-mail",
                text: contactStatus.email,
                href: `mailto:${contactStatus.email}`,
              },
            ].map(({ Icon, label, text, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noreferrer" : undefined}
                className={styles.contactLink}
              >
                <Icon className={styles.contactIcon} aria-hidden="true" />
                <span className={styles.contactInfo}>
                  <span className={styles.contactSub}>{label}</span>
                  <span className={styles.contactMain}>{text}</span>
                </span>
              </a>
            ))}
          </address>
        </section>

        <section
          aria-labelledby="apoiadores-titulo"
          className={styles.supportersCard}
          onMouseEnter={() => setSupportersPaused(true)}
          onMouseLeave={() => setSupportersPaused(false)}
          onFocus={() => setSupportersPaused(true)}
          onBlur={() => setSupportersPaused(false)}
        >
          <div className={styles.sectionHeader}>
            <h2 id="apoiadores-titulo" className={styles.supportersTitle}>
              Apoiadores
            </h2>
            <Button
              asChild
              variant="outline"
              size="icon"
              title="Ver todos os apoiadores"
            >
              <Link to="/apoiadores" aria-label="Ver todos os apoiadores">
                <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>

          {loadingSupporters ? (
            <div
              className={styles.supportersStateBox}
              role="status"
              aria-live="polite"
            >
              <Loader2 className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>Carregando apoiadores...</p>
            </div>
          ) : supportersError ? (
            <div className={styles.supportersStateBox} role="alert">
              <AlertCircle className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>
                Não foi possível carregar os apoiadores
              </p>
              <Button variant="outline" size="sm" onClick={refresh}>
                <RefreshCw size={16} aria-hidden="true" /> Tentar novamente
              </Button>
            </div>
          ) : supporters.length === 0 ? (
            <div className={styles.supportersStateBox}>
              <HeartHandshake className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>Nenhum apoiador ativo no momento</p>
            </div>
          ) : (
            <>
              <div ref={supportersRef} className={styles.supportersViewport}>
                <div className={styles.carouselContainer}>
                  {supporters.map((item, i) => (
                    <article
                      key={item.id}
                      aria-hidden={supporter !== i}
                      className={styles.supporterSlide}
                    >
                      <Link
                        to={`/apoiadores?apoiador=${item.id}`}
                        tabIndex={supporter === i ? 0 : -1}
                        aria-label={`Ver detalhes de ${item.nome_empresa}`}
                      >
                        <SupporterLogoPreview item={item} />
                      </Link>
                      <div className={styles.supporterContent}>
                        <h3 className={styles.supporterName}>
                          {item.nome_empresa}
                        </h3>
                        <Button
                          asChild
                          variant="participate"
                          tabIndex={supporter === i ? 0 : -1}
                        >
                          <Link to={`/apoiadores?apoiador=${item.id}`}>
                            Saiba mais
                          </Link>
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {supporters.length > 1 && (
                <div
                  className={styles.carouselControls}
                  aria-label="Controles dos apoiadores"
                >
                  <Button
                    variant="participate"
                    size="icon"
                    aria-label="Apoiador anterior"
                    onClick={handleSupportersPrev}
                  >
                    <ArrowLeft aria-hidden="true" />
                  </Button>

                  <div className={styles.dotsContainer}>
                    {supporters.length <= 5 ? (
                      supporters.map((item, i) => (
                        <button
                          key={item.id}
                          type="button"
                          className={styles.dotBtn}
                          aria-label={`Mostrar apoiador ${i + 1}`}
                          aria-pressed={supporter === i}
                          onClick={() => handleSupportersDot(i)}
                        >
                          <span
                            className={`${styles.dotIndicator} ${
                              supporter === i
                                ? styles.dotActive
                                : styles.dotInactive
                            }`}
                          />
                        </button>
                      ))
                    ) : (
                      <span
                        className={styles.slideCounter}
                        aria-live="polite"
                      >
                        {supporter + 1} / {supporters.length}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="participate"
                    size="icon"
                    aria-label="Próximo apoiador"
                    onClick={handleSupportersNext}
                  >
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
