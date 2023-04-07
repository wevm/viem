import { test, expect } from 'vitest'
import { toHex } from '../encoding/index.js'
import { packetToBytes } from './packetToBytes.js'

test.each([
  { packet: 'awkweb.eth', expected: '0x0661776b7765620365746800' },
  { packet: 'foo.awkweb.eth', expected: '0x03666f6f0661776b7765620365746800' },
  { packet: '.', expected: '0x00' },
])("packetToBytes('$packet') -> '$expected'", ({ packet, expected }) => {
  expect(toHex(packetToBytes(packet))).toBe(expected)
})
