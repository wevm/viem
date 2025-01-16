import { version } from '../version.js'

/** @internal */
export function getUrl(url: string) {
  return url
}

/** @internal */
export function getVersion() {
  return version
}

/** @internal */
export function prettyPrint(args: unknown) {
  if (!args) return ''
  const entries = Object.entries(args)
    .map(([key, value]) => {
      if (value === undefined || value === false) return null
      return [key, value]
    })
    .filter(Boolean) as [string, string][]
  const maxLength = entries.reduce((acc, [key]) => Math.max(acc, key.length), 0)
  return entries
    .map(([key, value]) => `  ${`${key}:`.padEnd(maxLength + 1)}  ${value}`)
    .join('\n')
}
