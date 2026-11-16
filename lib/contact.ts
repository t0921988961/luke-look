// Client-only. Import this module only from client islands that assemble the
// address after a user action, so it never reaches HTML or RSC payloads.
// Obfuscation, not encryption: it defeats regex harvesters, not a person.

const LOCAL_REVERSED = ["16988", "91290", "t"];

// Set to "" to show the plain address instead of the +alias.
const ALIAS = "portfolio";

const DOMAIN_SHIFT = 7;
const DOMAIN_CODES = [110, 116, 104, 112, 115, 53, 106, 118, 116];

export function getEmailAddress(): string {
  const local = LOCAL_REVERSED.join("").split("").reverse().join("");
  const domain = String.fromCharCode(...DOMAIN_CODES.map((c) => c - DOMAIN_SHIFT));
  return local + (ALIAS ? "+" + ALIAS : "") + String.fromCharCode(64) + domain;
}

export function getMailtoHref(): string {
  return "mailto:" + getEmailAddress();
}
