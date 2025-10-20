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

function splitUri(value: string) {
  return value.match(
    /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*)(?:\?([^#]*))?(?:#(.*))?/,
  )!
}
