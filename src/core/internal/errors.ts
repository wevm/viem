import type { Hex } from 'ox'

export type ErrorType<name extends string = 'Error'> = Error & { name: name }
export type AbortErrorType = ErrorType<'AbortError'>

export function getAbortError(signal?: AbortSignal | undefined) {
  if (signal?.reason) return signal.reason
  return new DOMException('This operation was aborted', 'AbortError')
}

export function isAbortError(error: unknown): error is AbortErrorType {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  )
}

/**
 * Walks a thrown error's `cause` chain (and nested `data` payloads) for the
 * selector-prefixed revert data returned by the node.
 */
export function getRevertData(error: unknown): Hex.Hex | undefined {
  let current: unknown = error
  while (current) {
    const data = (current as { data?: unknown }).data
    if (typeof data === 'string' && data.startsWith('0x'))
      return data as Hex.Hex
    if (data && typeof data === 'object') {
      const inner = (data as { data?: unknown }).data
      if (typeof inner === 'string' && inner.startsWith('0x'))
        return inner as Hex.Hex
    }
    current = (current as { cause?: unknown }).cause
  }
  return undefined
}

/**
 * Returns the URL with any embedded basic-auth credentials stripped, so
 * error messages and logs don't leak secrets when an RPC URL like
 * `https://user:pass@host` is used.
 */
export const getUrl = (url: string) => {
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
