// Turns a cutout (transparent PNG-style canvas) into a die-cut sticker:
// smooth white border + thin black outline + soft drop shadow. No parameters: everything scales
// with the size of the subject, so it looks the same at any resolution.

const MAX_SIZE = 1024      // cap the working size of the subject (px, long side)
const ALPHA_MIN = 8        // alpha above this counts as "part of the subject"
const BORDER = 0.035       // white border width as a fraction of the subject's long side
const OUTLINE = 0.15       // black outline width as a fraction of the white border width

/** In-place separable box blur; pixels outside the canvas count as 0. */
function boxBlur(a: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(a.length)
  const k = 1 / (2 * r + 1)
  for (let y = 0; y < h; y++) {
    const o = y * w
    let s = 0
    for (let x = 0; x <= r && x < w; x++) s += a[o + x]
    for (let x = 0; x < w; x++) {
      tmp[o + x] = s * k
      const add = x + r + 1, rem = x - r
      if (add < w) s += a[o + add]
      if (rem >= 0) s -= a[o + rem]
    }
  }
  for (let x = 0; x < w; x++) {
    let s = 0
    for (let y = 0; y <= r && y < h; y++) s += tmp[y * w + x]
    for (let y = 0; y < h; y++) {
      a[y * w + x] = s * k
      const add = y + r + 1, rem = y - r
      if (add < h) s += tmp[add * w + x]
      if (rem >= 0) s -= tmp[rem * w + x]
    }
  }
}

export function renderSticker(cutout: HTMLCanvasElement, out: HTMLCanvasElement) {
  const W = cutout.width, H = cutout.height
  const src = cutout.getContext('2d')!.getImageData(0, 0, W, H).data

  // 1. bounding box of the subject
  let x0 = W, y0 = H, x1 = -1, y1 = -1
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (src[(y * W + x) * 4 + 3] > ALPHA_MIN) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  if (x1 < 0) { out.width = out.height = 1; return } // nothing detected

  // 2. crop + cap size + padding (room for border and shadow)
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1
  const scale = Math.min(1, MAX_SIZE / Math.max(bw, bh))
  const cw = Math.max(1, Math.round(bw * scale)), ch = Math.max(1, Math.round(bh * scale))
  const ow = Math.max(6, Math.round(Math.max(cw, ch) * BORDER))
  const pad = ow * 3
  const SW = cw + pad * 2, SH = ch + pad * 2

  const mk = () => Object.assign(document.createElement('canvas'), { width: SW, height: SH })
  const leaf = mk()
  const lctx = leaf.getContext('2d')!
  lctx.imageSmoothingQuality = 'high'
  lctx.drawImage(cutout, x0, y0, bw, bh, pad, pad, cw, ch)

  // 3. dilate the silhouette by stamping the subject around rings of radius <= ow
  const dil = mk()
  const dctx = dil.getContext('2d')!
  dctx.drawImage(leaf, 0, 0)
  for (let ring = 1; ring <= 3; ring++) {
    const r = (ow * ring) / 3
    for (let i = 0; i < 24; i++) {
      const t = (i / 24) * Math.PI * 2
      dctx.drawImage(leaf, Math.cos(t) * r, Math.sin(t) * r)
    }
  }
  const da = dctx.getImageData(0, 0, SW, SH).data

  // 4. fill enclosed holes: flood-fill the outside from the borders
  const n = SW * SH
  const outside = new Uint8Array(n)
  const stack: number[] = []
  const push = (i: number) => {
    if (!outside[i] && da[i * 4 + 3] < 128) { outside[i] = 1; stack.push(i) }
  }
  for (let x = 0; x < SW; x++) { push(x); push((SH - 1) * SW + x) }
  for (let y = 0; y < SH; y++) { push(y * SW); push(y * SW + SW - 1) }
  while (stack.length) {
    const i = stack.pop()!
    const x = i % SW
    if (x > 0) push(i - 1)
    if (x < SW - 1) push(i + 1)
    if (i >= SW) push(i - SW)
    if (i < n - SW) push(i + SW)
  }
  const a = new Float32Array(n)
  for (let i = 0; i < n; i++) a[i] = outside[i] ? 0 : 1

  // 5. round the outline: blur then re-threshold (rounds corners, closes thin gaps)
  const r = Math.max(2, Math.round(ow * 0.5))
  boxBlur(a, SW, SH, r)
  boxBlur(a, SW, SH, r)
  const sil = mk()
  const sctx = sil.getContext('2d')!
  const si = sctx.createImageData(SW, SH)
  for (let i = 0; i < n; i++) {
    let t = (a[i] - 0.4) / 0.2
    t = t < 0 ? 0 : t > 1 ? 1 : t
    si.data[i * 4] = si.data[i * 4 + 1] = si.data[i * 4 + 2] = 255
    si.data[i * 4 + 3] = t * t * (3 - 2 * t) * 255
  }
  sctx.putImageData(si, 0, 0)

  // 6. black outline: a black copy of the white silhouette, stamped outward by `lw`
  const lw = Math.max(2, Math.round(ow * OUTLINE))
  const ink = mk()
  const ictx = ink.getContext('2d')!
  ictx.drawImage(sil, 0, 0)
  ictx.globalCompositeOperation = 'source-in'
  ictx.fillStyle = '#000'
  ictx.fillRect(0, 0, SW, SH)
  const edge = mk()
  const ectx = edge.getContext('2d')!
  ectx.drawImage(ink, 0, 0)
  for (let i = 0; i < 24; i++) {
    const t = (i / 24) * Math.PI * 2
    ectx.drawImage(ink, Math.cos(t) * lw, Math.sin(t) * lw)
  }

  // 7. compose: black outer shape (casts the shadow), white border, subject on top
  out.width = SW
  out.height = SH
  const ctx = out.getContext('2d')!
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = ow * 0.8
  ctx.shadowOffsetY = ow * 0.25
  ctx.drawImage(edge, 0, 0)
  ctx.restore()
  ctx.drawImage(sil, 0, 0)
  ctx.drawImage(leaf, 0, 0)
}

