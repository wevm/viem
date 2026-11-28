export function isUri(value: string) {
  // based on https://github.com/ogt/valid-url

  // check for illegal characters
  if (/[^a-z0-9:/?#[\]@!$&'()*+,;=.\-_~%]/i.test(value)) return false

  // check for hex escapes that aren't complete
  if (/%[^0-9a-f]/i.test(value)) return false
  if (/%[0-9a-f](:?[^0-9a-f]|$)/i.test(value)) return false

  // from RFC 3986
  const splitted = splitUri(value)
  const scheme = splitted[1]
  const authority = splitted[2]
  const path = splitted[3]
  const query = splitted[4]
  const fragment = splitted[5]

  // scheme and path are required, though the path can be empty
  if (!(scheme?.length && path.length >= 0)) return false

  // if authority is present, the path must be empty or begin with a /
  if (authority?.length) {
    if (!(path.length === 0 || /^\//.test(path))) return false
  } else {
    // if authority is not present, the path must not start with //
    if (/^\/\//.test(path)) return false
  }

  // an IP-literal host must hold a valid IPv6 address or IPvFuture
  if (authority?.includes('[')) {
    const ipLiteral = authority.match(/^(?:[^@]*@)?\[([^\]]*)\](?::\d*)?$/)
    if (!ipLiteral || !isIpLiteral(ipLiteral[1]!)) return false
  }

  // scheme must begin with a letter, then consist of letters, digits, +, ., or -
  if (!/^[a-z][a-z0-9+\-.]*$/.test(scheme.toLowerCase())) return false

  let out = ''
  // re-assemble the URL per section 5.3 in RFC 3986
  out += `${scheme}:`
  if (authority?.length) out += `//${authority}`

  out += path

  if (query?.length) out += `?${query}`
  if (fragment?.length) out += `#${fragment}`

  return out
}

/** Checks the contents of an RFC 3986 `IP-literal` (between `[` and `]`). */
export function isIpLiteral(value: string) {
  if (/^v[0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+$/i.test(value)) return true

  const parts = value.split('::')
  if (parts.length > 2) return false
  const groups = parts.flatMap((part) => (part ? part.split(':') : []))
  // A trailing IPv4 address counts as two 16-bit groups.
  const ipv4 = parts.at(-1)?.split(':').at(-1)
  const ipv4Groups = ipv4?.includes('.') ? 2 : 0
  if (ipv4Groups) {
    if (!ipv4Regex.test(ipv4!)) return false
    groups.pop()
  }
  if (!groups.every((group) => /^[0-9a-f]{1,4}$/i.test(group))) return false
  const count = groups.length + ipv4Groups
  return parts.length === 2 ? count <= 7 : count === 8
}

const decOctet = '(?:25[0-5]|2[0-4][0-9]|[01]?[0-9]?[0-9])'
const ipv4Regex = new RegExp(`^${decOctet}(?:\\.${decOctet}){3}$`)

function splitUri(value: string) {
  return value.match(
    /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
  )!
}
