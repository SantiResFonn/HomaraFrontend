// tests/translations.test.mts · comprobación del diccionario de traducciones e i18n
//
// Patrón AAA en cada caso: Arrange / Act / Assert.

import { test, is, ok } from "./harness.mjs";
import { translations } from "../app/lib/translations.js";

test("i18n-01", "translations exporta idiomas es y en", () => {
  // Arrange
  const esperados = ["es", "en"];

  // Act
  const idiomas = Object.keys(translations);

  // Assert
  for (const idioma of esperados) ok(idiomas.includes(idioma), `Falta el idioma ${idioma}`);
});

test("i18n-02", "códigos de locale válidos para es y en", () => {
  // Arrange
  const esperados = { es: "es-CO", en: "en-US" };

  // Act
  const locales = { es: translations.es.locale, en: translations.en.locale };

  // Assert
  is(locales.es, esperados.es);
  is(locales.en, esperados.en);
});

test("i18n-03", "secciones principales presentes en ambos diccionarios", () => {
  // Arrange
  const secciones = ["nav", "categories", "status", "pagination", "footer", "hero"];

  // Act
  const enEs = secciones.filter((s) => s in translations.es);
  const enEn = secciones.filter((s) => s in translations.en);

  // Assert
  for (const s of secciones) {
    ok(enEs.includes(s), `Falta sección ${s} en es`);
    ok(enEn.includes(s), `Falta sección ${s} en en`);
  }
});
