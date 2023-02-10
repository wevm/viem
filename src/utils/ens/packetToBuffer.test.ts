import { test, expect } from 'vitest'
import { packetToBuffer } from './packetToBuffer'

test.each([
  { packet: 'awkweb.eth', expected: '0x0661776b7765620365746800' },
  { packet: 'foo.awkweb.eth', expected: '0x03666f6f0661776b7765620365746800' },
  { packet: '.', expected: '0x00' },
])("packetToBuffer('$packet') -> '$expected'", ({ packet, expected }) => {
  expect(`0x${packetToBuffer(packet).toString('hex')}`).toBe(expected)
})
