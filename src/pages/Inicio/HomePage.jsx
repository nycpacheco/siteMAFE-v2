import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Facebook,
  HeartHandshake,
  Mail,
  Phone,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";

import { useSiteContent } from "@/hooks/useSiteContent";
import styles from "./HomePage.module.css";

export function HomePage() {
  const { contactStatus, galleryItems, homeContent, supporters } = useSiteContent();
  const [momentsRef, momentsApi] = useEmblaCarousel({ loop: true });
  const [supportersRef, supportersApi] = useEmblaCarousel({ loop: true });
  const [moment, setMoment] = useState(0);
  const [supporter, setSupporter] = useState(0);
  const [details, setDetails] = useState(false);

  const syncMoments = useCallback(
    () => setMoment(momentsApi?.selectedScrollSnap() ?? 0),
    [momentsApi],
  );
  const syncSupporters = useCallback(
    () => setSupporter(supportersApi?.selectedScrollSnap() ?? 0),
    [supportersApi],
  );

  useEffect(() => {
    if (!momentsApi) return;
    momentsApi.on("select", syncMoments);
    return () => momentsApi.off("select", syncMoments);
  }, [momentsApi, syncMoments]);

  useEffect(() => {
    if (!supportersApi) return;
    supportersApi.on("select", syncSupporters);
    return () => supportersApi.off("select", syncSupporters);
  }, [supportersApi, syncSupporters]);

  const homeSupporters = supporters.slice(0, 5);
  const current = homeSupporters[supporter];

  return (
    <div className={styles.homeGrid}>
      <section
        aria-label="Momentos que ficam"
        className={styles.momentsSection}
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

        <div ref={momentsRef} className={styles.carouselViewport}>
          <div className={styles.carouselContainer}>
            {galleryItems.map((item, i) => (
              <figure
                key={item.id}
                className={styles.momentSlide}
                aria-hidden={moment !== i}
              >
                <img
                  src={item.image}
                  alt={item.description}
                  width={item.width}
                  height={item.height}
                  loading={i === 0 ? "eager" : "lazy"}
                  className={styles.momentImage}
                />
                <figcaption className={styles.momentCaption}>
                  {i === 0 ? homeContent.caption : item.description}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div
          className={styles.carouselControls}
          aria-label="Controles dos momentos"
        >
          <Button
            variant="participate"
            size="icon"
            aria-label="Momento anterior"
            onClick={() => momentsApi?.scrollPrev()}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>

          <div className={styles.dotsContainer}>
            {galleryItems.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={styles.dotBtn}
                aria-label={`Mostrar momento ${i + 1}`}
                aria-pressed={moment === i}
                onClick={() => momentsApi?.scrollTo(i)}
              >
                <span
                  className={`${styles.dotIndicator} ${moment === i ? styles.dotActive : styles.dotInactive}`}
                />
              </button>
            ))}
          </div>

          <Button
            variant="participate"
            size="icon"
            aria-label="Próximo momento"
            onClick={() => momentsApi?.scrollNext()}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
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

          <div ref={supportersRef} className={styles.supportersViewport}>
            <div className={styles.carouselContainer}>
              {homeSupporters.map((item, i) => (
                <article
                  key={item.id}
                  aria-hidden={supporter !== i}
                  className={styles.supporterSlide}
                >
                  <div className={styles.supporterLogoBox}>
                    <HeartHandshake
                      className={styles.supporterHeartIcon}
                      aria-hidden="true"
                    />
                    <span className={styles.supporterLogoText}>
                      Logo em atualização
                    </span>
                  </div>
                  <div className={styles.supporterContent}>
                    <h3 className={styles.supporterName}>{item.name}</h3>
                    <Button
                      variant="participate"
                      tabIndex={supporter === i ? 0 : -1}
                      onClick={() => setDetails(true)}
                    >
                      Saiba mais
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div
            className={styles.carouselControls}
            aria-label="Controles dos apoiadores"
          >
            <Button
              variant="participate"
              size="icon"
              aria-label="Apoiador anterior"
              onClick={() => supportersApi?.scrollPrev()}
            >
              <ArrowLeft aria-hidden="true" />
            </Button>

            <div className={styles.dotsContainer}>
              {homeSupporters.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  className={styles.dotBtn}
                  aria-label={`Mostrar apoiador ${i + 1}`}
                  aria-pressed={supporter === i}
                  onClick={() => supportersApi?.scrollTo(i)}
                >
                  <span
                    className={`${styles.dotIndicator} ${supporter === i ? styles.dotActive : styles.dotInactive}`}
                  />
                </button>
              ))}
            </div>

            <Button
              variant="participate"
              size="icon"
              aria-label="Próximo apoiador"
              onClick={() => supportersApi?.scrollNext()}
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </section>
      </div>

      <Dialog open={details} onOpenChange={setDetails}>
        <DialogContent>
          <DialogTitle>{current?.name}</DialogTitle>
          <HeartHandshake className={styles.dialogHeart} aria-hidden="true" />
          <DialogDescription>
            Logotipo, descrição e site oficial em atualização.
          </DialogDescription>
          <Button asChild variant="outline">
            <Link to="/apoiadores">Ver apoiadores</Link>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default HomePage;
