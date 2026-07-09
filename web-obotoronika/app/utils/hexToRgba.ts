export default function hexToRgba(hex: string, alpha = 1): string {
  const cleanedHex = hex.replace('#', '')
  const bigint = parseInt(cleanedHex, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
