/*
 * @description Encodes a DNS packet into a buffer containing a UDP payload.
 */
export function packetToBuffer(packet: string) {
  // Adapted from https://github.com/mafintosh/dns-packet
  function length(value: string) {
    if (value === '.' || value === '..') return 1
    return Buffer.byteLength(value.replace(/^\.|\.$/gm, '')) + 2
  }

  const buffer = Buffer.alloc(length(packet))
  // strip leading and trailing `.`
  const value = packet.replace(/^\.|\.$/gm, '')
  if (!value.length) return buffer

  let offset = 0
  const list = value.split('.')
  for (let i = 0; i < list.length; i++) {
    const len = buffer.write(list[i], offset + 1)
    buffer[offset] = len
    offset += len + 1
  }

  return buffer
}
