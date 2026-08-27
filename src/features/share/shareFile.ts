export function slugify(text: string): string {
  return text
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşü0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function shareOrDownload(blob: Blob, fileName: string, title: string) {
  const file = new File([blob], fileName, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title })
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
