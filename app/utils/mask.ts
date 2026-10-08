export interface MaskParams {
  cutoff: number   // 0..1, where the mask flips between keep/remove
  soft: number     // 0..1, width of the transition
  feather: number  // px blur applied before the cutoff
}

export interface CutoutSource {
  bitmap: ImageBitmap
  mask: ImageBitmap
}

/** Pure post-processing: cheap enough to re-run on every slider move. */
export function renderCutout(src: CutoutSource, p: MaskParams, out: HTMLCanvasElement) {
  const { bitmap, mask } = src
  const W = bitmap.width, H = bitmap.height

  const tmp = new OffscreenCanvas(W, H).getContext('2d')!
  tmp.filter = `blur(${p.feather}px)` // not supported in Safari
  tmp.drawImage(mask, 0, 0)
  const m = tmp.getImageData(0, 0, W, H).data

  out.width = W
  out.height = H
  const ctx = out.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  const img = ctx.getImageData(0, 0, W, H)

  const e0 = p.cutoff - p.soft / 2
  const e1 = p.cutoff + p.soft / 2
  for (let i = 0; i < W * H; i++) {
    let t = (m[i * 4] / 255 - e0) / (e1 - e0)
    t = t < 0 ? 0 : t > 1 ? 1 : t
    img.data[i * 4 + 3] = t * t * (3 - 2 * t) * 255 // smoothstep
  }
  ctx.putImageData(img, 0, 0)
}
