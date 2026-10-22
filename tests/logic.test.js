import test from "node:test";
import assert from "node:assert/strict";

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
