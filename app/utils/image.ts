export function createImageUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

export function revokeImageUrl(url: string): void {
  URL.revokeObjectURL(url)
}
