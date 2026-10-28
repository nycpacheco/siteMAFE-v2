import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarHeart,
  Images,
  MessageCircle,
  Trophy,
  Users,
} from "lucide-react";
import groupImage from "@/assets/mafe-treino-grupo.jpg";
import portraitImage from "@/assets/mafe-retrato-equipe.jpg";
import { PageBanner } from "@/components/PageBanner/PageBanner";
import { Button } from "@/components/ui/Button/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog/Dialog";
import { useSiteContent } from "@/hooks/useSiteContent";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  const { aboutContent, homeContent } = useSiteContent();
  const [participateOpen, setParticipateOpen] = useState(false);

  const facts = [
    {
      icon: CalendarHeart,
      value: `Desde ${aboutContent.since}`,
      label: "em quadra",
    },
    { icon: Users, value: "~60 pessoas", label: "de 45 a 75 anos" },
    { icon: Trophy, value: "Torneios", label: "e competições" },
  ];

  return (
    <>
      <PageBanner
        eyebrow="Nossa história"
        title="Quem somos"
        text="Vôlei adaptado, saúde e amizade em Mairiporã."
      />

      <section className={styles.sectionSpace}>
        <div className={styles.pageShell}>
          <article className={`${styles.visibleCard} ${styles.cardGrid1}`}>
            <div>
              <span className={styles.tag}>Quem somos</span>
              <h2 className={styles.cardHeading}>Um pouco sobre nós</h2>
              <p className={styles.cardText}>
                Atuando desde {aboutContent.since}, o grupo social{" "}
                <strong className={styles.textPrimary}>
                  MAFE — Maturidade Feliz
                </strong>{" "}
                desenvolve, na cidade de {aboutContent.city}, aulas de vôlei
                adaptado para pessoas idosas por meio de um programa da
                Prefeitura Municipal chamado{" "}
                <strong>{aboutContent.program}</strong>, buscando aumentar a
                qualidade de vida da população local.
              </p>
              <p className={styles.cardText}>
                O projeto atende{" "}
                <strong className={styles.textPrimary}>
                  {aboutContent.participants}
                </strong>{" "}
                em encontros semanais que se estendem para torneios e
                competições, ampliando não só a saúde física, mas também a
                socialização e o bem-estar emocional dos participantes.
              </p>
            </div>
            <img
              src={groupImage}
              alt="Participantes do MAFE reunidos na quadra"
              width={1600}
              height={1008}
              className={styles.cardImg}
            />
          </article>

          <div className={styles.factsGrid}>
            {facts.map(({ icon: Icon, value, label }) => (
              <div key={value} className={styles.factCard}>
                <Icon aria-hidden="true" className={styles.factIcon} />
                <div>
                  <p className={styles.factValue}>{value}</p>
                  <p className={styles.factLabel}>{label}</p>
                </div>
              </div>
            ))}
          </div>

          <article className={`${styles.visibleCard} ${styles.cardGrid2}`}>
            <img
              src={portraitImage}
              alt="Equipe do MAFE com uniformes laranja"
              width={1200}
              height={912}
              loading="lazy"
              className={styles.cardImg}
            />
            <div>
              <span className={styles.tag}>Nossa história</span>
              <h2 className={styles.cardHeading}>Onde tudo começou</h2>
              <p className={styles.cardText}>
                O grupo nasceu do desejo de oferecer às pessoas idosas um espaço
                de movimento, acolhimento e amizade. Cada pessoa joga no seu
                ritmo, com respeito e cooperação.
              </p>
              <div className={styles.buttonRow}>
                <Button
                  variant="participate"
                  size="lg"
                  onClick={() => setParticipateOpen(true)}
                >
                  <MessageCircle aria-hidden="true" /> Participar
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/galeria">
                    <Images aria-hidden="true" /> Ver galeria
                  </Link>
                </Button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <Dialog open={participateOpen} onOpenChange={setParticipateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Participar do MAFE</DialogTitle>
            <DialogDescription>
              O número oficial da coordenadora ainda precisa ser informado pela
              coordenação. Você pode enviar uma mensagem pelo canal geral no
              WhatsApp!
            </DialogDescription>
          </DialogHeader>
          <div className={styles.buttonRow}>
            <Button asChild variant="participate" size="lg">
              <a
                href={homeContent.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle aria-hidden="true" /> Falar no WhatsApp
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setParticipateOpen(false)}
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AboutPage;