// The encoder alone (qrcode's lib/core): the package's main entry adds canvas, SVG-string and terminal renderers.
declare module "qrcode/lib/core/qrcode" {
  export function create(text: string, options?: { errorCorrectionLevel?: "L" | "M" | "Q" | "H" }): { modules: { size: number; data: Uint8Array } };
}
