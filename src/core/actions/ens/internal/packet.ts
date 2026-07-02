import * as Bytes from 'ox/Bytes'
import * as Ens from 'ox/Ens'

// Adapted from https://github.com/mafintosh/dns-packet
/** Encodes an ENS name into a DNS wire-format packet. */
export function packetToBytes(packet: string): Bytes.Bytes {
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (value.length === 0) return new Uint8Array(1)

  const bytes = new Uint8Array(Bytes.fromString(value).byteLength + 2)

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i++) {
    let encoded = Bytes.fromString(list[i]!)
    // Labels over 255 bytes are replaced with their encoded labelhash
    // (`[<hash>]`), matching the universal resolver's handling.
    if (encoded.byteLength > 255)
      encoded = Bytes.fromString(`[${Ens.labelhash(list[i]!).slice(2)}]`)
    bytes[offset] = encoded.length
    bytes.set(encoded, offset + 1)
    offset += encoded.length + 1
  }

  if (bytes.byteLength !== offset + 1) return bytes.slice(0, offset + 1)

  return bytes
}
