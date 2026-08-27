const REVOKE_DELAY_MS = 1000

export function slugify(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşü0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.rel = 'noopener'
  document.body.append(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}
