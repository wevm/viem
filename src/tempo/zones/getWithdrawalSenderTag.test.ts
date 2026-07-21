import { expect, test } from 'vitest'
import { getWithdrawalSenderTag } from './getWithdrawalSenderTag.js'

test('default', () => {
  expect(
    getWithdrawalSenderTag({
      sender: '0x0000000000000000000000000000000000000001',
      transactionHash:
        '0x2222222222222222222222222222222222222222222222222222222222222222',
    }),
  ).toBe('0x1180de90ed8e66ef4e3771194b0197494aefe21754c9c2117efe146c2b4d9237')
})
