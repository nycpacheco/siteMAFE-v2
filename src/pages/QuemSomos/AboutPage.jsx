import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  CalendarHeart,
  Images,
  Loader2,
  MessageCircle,
  RefreshCw,
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
import { useStatsData } from "@/hooks/useSiteContent";
import { calculateYearsActive } from "@/lib/media-utils";
import { aboutStaticInfo, homeContent } from "@/lib/site-content";
import styles from "./AboutPage.module.css";

export function AboutPage() {
  const { stats, loading, error, refresh } = useStatsData();
  const [participateOpen, setParticipateOpen] = useState(false);

  const yearsActive = stats
    ? stats.anos_de_atuacao ?? calculateYearsActive(stats.ano_fundacao)
    : null;

  const facts = stats
    ? [
        {
          icon: CalendarHeart,
          value: `Desde ${stats.ano_fundacao}`,
          label: `${yearsActive} ${
            yearsActive === 1 ? "ano de atuação" : "anos de atuação"
          }`,
        },
        {
          icon: Users,
          value: `${stats.quantidade_participantes} participantes`,
          label: "no grupo atualmente",
        },
        {
          icon: Trophy,
          value: `${stats.quantidade_torneios} torneios`,
          label: "e competições disputadas",
        },
      ]
    : [];

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
                {stats ? (
                  <>
                    Atuando desde {stats.ano_fundacao} ({yearsActive}{" "}
                    {yearsActive === 1 ? "ano" : "anos"} de história), o grupo
                    social{" "}
                  </>
                ) : (
                  <>O grupo social </>
                )}
                <strong className={styles.textPrimary}>
                  MAFE — Maturidade Feliz
                </strong>{" "}
                desenvolve, na cidade de {aboutStaticInfo.city}, aulas de vôlei
                adaptado para pessoas idosas por meio de um programa da
                Prefeitura Municipal chamado{" "}
                <strong>{aboutStaticInfo.program}</strong>, buscando aumentar a
                qualidade de vida da população local.
              </p>
              <p className={styles.cardText}>
                {stats ? (
                  <>
                    O projeto reúne{" "}
                    <strong className={styles.textPrimary}>
                      {stats.quantidade_participantes} participantes
                    </strong>{" "}
                    em encontros semanais e já soma{" "}
                    <strong className={styles.textPrimary}>
                      {stats.quantidade_torneios} torneios
                    </strong>
                    , ampliando não só a saúde física, mas também a socialização
                    e o bem-estar emocional de cada integrante.
                  </>
                ) : (
                  <>
                    Os encontros semanais ampliam não só a saúde física, mas
                    também a socialização e o bem-estar emocional dos
                    participantes.
                  </>
                )}
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

          {loading ? (
            <div className={styles.stateBanner} role="status" aria-live="polite">
              <Loader2 className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>
                Carregando estatísticas do grupo...
              </p>
            </div>
          ) : error ? (
            <div className={styles.stateBanner} role="alert">
              <AlertCircle className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>
                Não foi possível carregar as estatísticas
              </p>
              <p className={styles.stateText}>
                {error.message || "Verifique a conexão com o servidor."}
              </p>
              <Button variant="outline" onClick={refresh}>
                <RefreshCw size={18} aria-hidden="true" /> Tentar novamente
              </Button>
            </div>
          ) : stats ? (
            <div className={styles.factsGrid} data-testid="about-stats-grid">
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
          ) : (
            <div className={styles.stateBanner} data-testid="about-stats-empty">
              <Trophy className={styles.stateIcon} aria-hidden="true" />
              <p className={styles.stateTitle}>
                Estatísticas ainda não cadastradas
              </p>
              <p className={styles.stateText}>
                Os números oficiais do grupo serão exibidos aqui assim que
                forem cadastrados no painel administrativo.
              </p>
            </div>
          )}

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
              Envie uma mensagem pelo canal oficial do MAFE no WhatsApp para
              saber dias, horários e como participar dos treinos!
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