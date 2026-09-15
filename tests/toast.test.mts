// app/lib/toast.ts · helper de toasts basado en un CustomEvent global
//
// Patrón AAA en cada caso. El Arrange instala el navegador falso; el Act y el
// Assert viven dentro del try para que el finally siempre restaure los globales.

import { test, is, ok } from "./harness.mjs";
import { instalarNavegador } from "./helpers.mjs";
import { showToast } from "../app/lib/toast.js";

test("toast-01", "Despacha homara:toast con el detalle completo", () => {
  // Arrange
  const env = instalarNavegador();

  try {
    // Act
    showToast("Guardado", "success", 1000);

    // Assert
    is(env.eventos.length, 1);
    const ev = env.eventos[0];
    is(ev.type, "homara:toast");
    is(ev.detail.message, "Guardado");
    is(ev.detail.type, "success");
    is(ev.detail.duration, 1000);
    is(typeof ev.detail.id, "string");
    ok(ev.detail.id.length > 0);
  } finally {
    env.restaurar();
  }
});

test("toast-02", "Usa tipo 'info' y duración 4000 por defecto", () => {
  // Arrange
  const env = instalarNavegador();

  try {
    // Act
    showToast("Solo mensaje");

    // Assert
    const ev = env.eventos[0];
    is(ev.detail.type, "info");
    is(ev.detail.duration, 4000);
  } finally {
    env.restaurar();
  }
});

test("toast-03", "Genera ids distintos en llamados sucesivos", () => {
  // Arrange
  const env = instalarNavegador();

  try {
    // Act
    showToast("a");
    showToast("b");

    // Assert
    is(env.eventos.length, 2);
    ok(env.eventos[0].detail.id !== env.eventos[1].detail.id);
  } finally {
    env.restaurar();
  }
});

test("toast-04", "Sin window (SSR) no hace nada y no lanza", () => {
  // Arrange — no se instala navegador: window queda undefined.
  const hayWindow = typeof (globalThis as any).window;

  // Act
  showToast("nada", "error");

  // Assert
  is(hayWindow, "undefined");
  ok(true); // llegó hasta acá sin excepción
});
