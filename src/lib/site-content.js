import supporterLogo from "@/assets/apoiador-marcela-amaral.jpg";
import warmupImage from "@/assets/mafe-alongamento.jpg";
import portraitImage from "@/assets/mafe-retrato-equipe.jpg";
import groupImage from "@/assets/mafe-treino-grupo.jpg";
import serveImage from "@/assets/mafe-treino-saque.jpg";

export const galleryItems = [
  {
    id: 1,
    title: "Alegria em quadra",
    description:
      "Registro ilustrativo de um treino regular, com integração, movimento e apoio entre participantes.",
    date: "2026",
    year: "2026",
    eventType: "Treinos",
    mediaType: "Foto",
    image: groupImage,
    width: 1600,
    height: 1008,
  },
  {
    id: 2,
    title: "Cada saque é uma conquista",
    description:
      "Registro ilustrativo da prática adaptada, respeitando o ritmo e a experiência de cada pessoa.",
    date: "2026",
    year: "2026",
    eventType: "Treinos",
    mediaType: "Foto",
    image: serveImage,
    width: 1200,
    height: 912,
  },
  {
    id: 3,
    title: "Amizade que fortalece",
    description:
      "Registro ilustrativo da convivência e do sentimento de pertencimento construídos pelo esporte.",
    date: "2026",
    year: "2026",
    eventType: "Competições",
    mediaType: "Foto",
    image: portraitImage,
    width: 1200,
    height: 912,
  },
  {
    id: 4,
    title: "Preparação com cuidado",
    description:
      "Registro ilustrativo do alongamento orientado que antecede as atividades em quadra.",
    date: "2026",
    year: "2026",
    eventType: "Treinos",
    mediaType: "Foto",
    image: warmupImage,
    width: 1200,
    height: 912,
  },
];

export const contactStatus = {
  whatsapp: "(11) 99873-2849",
  email: "mafe@gmail.com",
  facebook: "mafegrupo",
};

export const aboutContent = {
  since: "2019",
  city: "Mairiporã-SP",
  program: "Escola da Família",
  participants: "cerca de 60 pessoas entre 45 e 75 anos",
};

/** Exemplo repetido até a coordenação enviar os apoiadores reais. */
export const supporters = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: "Marcela Amaral",
  summary: "Nome, logotipo e site oficial deste parceiro em atualização.",
  description:
    "Parceira do Maturidade Feliz que apoia os treinos de vôlei adaptado. A descrição completa da parceria ainda será informada pela coordenação.",
  logo: supporterLogo,
}));

/** Contacts transcribed from the latest user-supplied prototype. */
export const homeContent = {
  footerPhone: "(11) 90243-9028",
  whatsappUrl: "https://wa.me/5511998732849",
  facebookUrl: "https://www.facebook.com/mafegrupo",
  caption:
    "teste para ver se dá para enxergar as informações presentes além disso para testar se ele se adapta sozinho a parte branca",
};
