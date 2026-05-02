/** Postos / graduações usados no cadastro e no perfil. */
export const GRADUATION_OPTIONS = [
  "Cel",
  "TenCel",
  "Maj",
  "Cap",
  "1ºTen",
  "2ºTen",
  "Asp",
  "SubTen",
  "1ºSgt",
  "2ºSgt",
  "3ºSgt",
  "Cb",
  "Sd",
] as const

export function normalizeGraduation(raw: string | undefined): string {
  const t = (raw ?? "").trim()
  return (GRADUATION_OPTIONS as readonly string[]).includes(t) ? t : ""
}
