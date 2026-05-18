import { expect, test } from 'vitest'

import { toHex } from '../encoding/toHex.js'

import { packetToBytes } from './packetToBytes.js'

test.each([
  { packet: 'awkweb.eth', expected: '0x0661776b7765620365746800' },
  { packet: 'foo.awkweb.eth', expected: '0x03666f6f0661776b7765620365746800' },
  { packet: '.', expected: '0x00' },
  {
    packet: 'a'.repeat(256),
    expected:
      '0x425b316461613730333461646162363664396563396530336532633839323031623833613734393765383564633562393731616139646165326363626237613230385d00',
  },
  {
    packet:
      '[1daa7034adab66d9ec9e03e2c89201b83a7497e85dc5b971aa9dae2ccbb7a208]',
    expected:
      '0x425b316461613730333461646162363664396563396530336532633839323031623833613734393765383564633562393731616139646165326363626237613230385d00',
  },
])("packetToBytes('$packet') -> '$expected'", ({ packet, expected }) => {
  expect(toHex(packetToBytes(packet))).toBe(expected)
})
