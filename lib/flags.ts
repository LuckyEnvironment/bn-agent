/**
 * Feature flags. ESCROW_LIVE_PROCESSING is de veiligheidsklep: zolang deze
 * uit staat worden escrow-verzoeken volledig aangenomen, gevalideerd, getierd
 * en gelogd, maar wordt de payload met cliëntgevoelige of gereguleerde data
 * niet verwerkt of opgeslagen. Aanzetten is een expliciete productiebeslissing
 * die buiten dit systeem om genomen moet worden.
 */
export function escrowLiveProcessing(): boolean {
  return process.env.ESCROW_LIVE_PROCESSING === "true";
}

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}
