import test from "node:test";
import assert from "node:assert/strict";
import {
  calculateYearsActive,
  extractYouTubeId,
  filterGalleryItems,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  isDirectVideoUrl,
  sanitizeExternalUrl,
  sortGalleryItems,
} from "../src/lib/media-utils.js";
import {
  normalizeApoiador,
  normalizeCategoria,
  normalizeEstatisticas,
  normalizeMidia,
} from "../src/services/api.js";

test("extractYouTubeId and embed/thumbnail helpers handle watch, youtu.be, shorts, and embed URLs", () => {
  assert.equal(
    extractYouTubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(extractYouTubeId("https://youtu.be/dQw4w9WgXcQ?t=12"), "dQw4w9WgXcQ");
  assert.equal(
    extractYouTubeId("https://www.youtube.com/shorts/dQw4w9WgXcQ"),
    "dQw4w9WgXcQ"
  );
  assert.equal(
    getYouTubeEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"),
    "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0"
  );
  assert.equal(
    getYouTubeThumbnailUrl("https://youtu.be/dQw4w9WgXcQ"),
    "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
  );
  assert.equal(extractYouTubeId("https://example.com/video.mp4"), null);
  assert.equal(getYouTubeEmbedUrl("not-a-url"), null);
});

test("isDirectVideoUrl and sanitizeExternalUrl validate media and external links safely", () => {
  assert.equal(isDirectVideoUrl("https://cdn.example.com/treino.mp4?v=1"), true);
  assert.equal(isDirectVideoUrl("https://cdn.example.com/treino.webm"), true);
  assert.equal(isDirectVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), false);

  assert.equal(sanitizeExternalUrl("https://apoiador.com.br"), "https://apoiador.com.br/");
  assert.equal(sanitizeExternalUrl("http://apoiador.com.br/sobre"), "http://apoiador.com.br/sobre");
  assert.equal(sanitizeExternalUrl("javascript:alert(1)"), "");
  assert.equal(sanitizeExternalUrl("data:text/html,<script>"), "");
  assert.equal(sanitizeExternalUrl(""), "");
});

test("calculateYearsActive computes currentYear - ano_fundacao accurately", () => {
  assert.equal(calculateYearsActive(2019, 2026), 7);
  assert.equal(calculateYearsActive(2026, 2026), 0);
  assert.equal(calculateYearsActive(0, 2026), null);
});

test("sortGalleryItems orders by visualizacoes DESC then criado_em DESC", () => {
  const unsorted = [
    { id: 1, visualizacoes: 5, criado_em: "2026-01-10T10:00:00Z" },
    { id: 2, visualizacoes: 20, criado_em: "2026-01-01T10:00:00Z" },
    { id: 3, visualizacoes: 5, criado_em: "2026-02-15T10:00:00Z" },
  ];
  const sorted = sortGalleryItems(unsorted);
  assert.deepEqual(
    sorted.map((x) => x.id),
    [2, 3, 1]
  );
});

test("filterGalleryItems applies categoriaId, tipoMidia, ano, and busca simultaneously", () => {
  const items = [
    {
      id: 1,
      categoria_id: 1,
      tipo_midia: "foto",
      ano: 2025,
      titulo: "Torneio Regional em Mairiporã",
    },
    {
      id: 2,
      categoria_id: 1,
      tipo_midia: "video",
      ano: 2026,
      titulo: "Torneio Regional Melhores Momentos",
    },
    {
      id: 3,
      categoria_id: 2,
      tipo_midia: "video",
      ano: 2026,
      titulo: "Treino de Saque",
    },
  ];

  assert.equal(filterGalleryItems(items).length, 3);
  assert.deepEqual(
    filterGalleryItems(items, {
      categoriaId: "1",
      tipoMidia: "video",
      busca: "torneio",
    }).map((x) => x.id),
    [2]
  );
  assert.deepEqual(
    filterGalleryItems(items, {
      tipoMidia: "foto",
      ano: "2025",
    }).map((x) => x.id),
    [1]
  );
});

test("API normalizers strictly map real database fields", () => {
  const midia = normalizeMidia({
    id: "12",
    categoria_id: "3",
    categoria_nome: "Eventos",
    titulo: "Confraternização",
    descricao: null,
    url_midia: "https://youtu.be/dQw4w9WgXcQ",
    tipo_midia: "video",
    ano: "2026",
    visualizacoes: "42",
    ativo: 1,
    criado_em: "2026-10-01T12:00:00.000Z",
  });
  assert.equal(midia.id, 12);
  assert.equal(midia.categoria_id, 3);
  assert.equal(midia.categoria_nome, "Eventos");
  assert.equal(midia.tipo_midia, "video");
  assert.equal(midia.visualizacoes, 42);

  const cat = normalizeCategoria({ id: "3", nome: "Eventos" });
  assert.deepEqual(cat, { id: 3, nome: "Eventos" });

  const apoiador = normalizeApoiador({
    id: 7,
    nome_empresa: "Padaria Central",
    descricao: "Apoia os cafés dos treinos.",
    logo_url: "https://cdn.example.com/logo.png",
    site_url: "javascript:alert(1)",
    visualizacoes: 9,
    ativo: true,
  });
  assert.equal(apoiador.site_url, "");
  assert.equal(apoiador.nome_empresa, "Padaria Central");

  const stats = normalizeEstatisticas({
    id: 1,
    quantidade_participantes: 48,
    quantidade_torneios: 14,
    ano_fundacao: 2019,
    anos_de_atuacao: 7,
  });
  assert.equal(stats.anos_de_atuacao, 7);
});
