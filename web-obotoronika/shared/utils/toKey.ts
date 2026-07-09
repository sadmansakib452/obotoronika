export default function toKey(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_') // replace spaces with underscores
    .replace(/[^a-z0-9_]/g, '') // remove everything except lowercase letters, numbers, and underscores
}
