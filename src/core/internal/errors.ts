import { version } from './version.js'

export function getUrl(url: string) {
  try {
    const parsed = new URL(url)
    if (!parsed.username && !parsed.password) return url
    parsed.username = ''
    parsed.password = ''
    return parsed.toString()
  } catch {
    return url
  }
}

export function getVersion() {
  return version
}
