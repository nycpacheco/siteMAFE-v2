import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

test("gallery filter logic matches expectations", () => {
  const dummyItems = [
    { id: 1, year: "2026", eventType: "Treinos" },
    { id: 2, year: "2026", eventType: "Treinos" },
    { id: 3, year: "2026", eventType: "Competições" },
    { id: 4, year: "2026", eventType: "Treinos" },
  ];

  const filter = (items, year, eventType) =>
    items.filter(
      (item) =>
        (year === "Todos" || item.year === year) &&
        (eventType === "Todos" || item.eventType === eventType)
    );

  assert.equal(filter(dummyItems, "Todos", "Todos").length, 4);
  assert.equal(filter(dummyItems, "2026", "Treinos").length, 3);
  assert.equal(filter(dummyItems, "2026", "Competições").length, 1);
  assert.equal(filter(dummyItems, "2025", "Todos").length, 0);
});

test("supporters array generator produces valid count and items", () => {
  const generateSupporters = (length) =>
    Array.from({ length }, (_, i) => ({
      id: i + 1,
      name: "Marcela Amaral",
      summary: "Nome, logotipo e site oficial deste parceiro em atualização.",
      description: "Parceira do Maturidade Feliz que apoia os treinos de vôlei adaptado.",
    }));

  const list = generateSupporters(10);
  assert.equal(list.length, 10);
  assert.equal(list[0].id, 1);
  assert.equal(list[9].id, 10);
  assert.equal(list[0].name, "Marcela Amaral");
});

test("mock JSON files for /galeria, /apoiadores and /institucional have valid structure", async () => {
  const [galeriaRaw, apoiadoresRaw, instRaw] = await Promise.all([
    fs.readFile(path.resolve("public/mock/galeria.json"), "utf-8"),
    fs.readFile(path.resolve("public/mock/apoiadores.json"), "utf-8"),
    fs.readFile(path.resolve("public/mock/institucional.json"), "utf-8"),
  ]);

  const galeria = JSON.parse(galeriaRaw);
  const apoiadores = JSON.parse(apoiadoresRaw);
  const institucional = JSON.parse(instRaw);

  assert.equal(Array.isArray(galeria), true);
  assert.equal(galeria.length, 4);
  assert.equal(galeria[0].eventType, "Treinos");

  assert.equal(Array.isArray(apoiadores), true);
  assert.equal(apoiadores.length, 10);
  assert.equal(apoiadores[0].name, "Marcela Amaral");

  assert.ok(institucional.contactStatus, "contactStatus should exist");
  assert.ok(institucional.aboutContent, "aboutContent should exist");
  assert.ok(institucional.homeContent, "homeContent should exist");
});
