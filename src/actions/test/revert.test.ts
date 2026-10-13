import { expect, test, vi } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts } from '~test/constants.js'
import { parseEther } from '../../utils/unit/parseEther.js'
import { getBalance } from '../public/getBalance.js'
import { sendTransaction } from '../wallet/sendTransaction.js'

import { mine } from './mine.js'
import { RevertError, revert } from './revert.js'
import { snapshot } from './snapshot.js'

test('reverts successfully when client returns true', async () => {
  const client = {
    request: vi.fn().mockResolvedValue(true),
  } as any

  await expect(revert(client, { id: '0x1' })).resolves.toBeUndefined()
  expect(client.request).toHaveBeenCalledWith({
    method: 'evm_revert',
    params: ['0x1'],
  })
})

test('throws RevertError when client returns false', async () => {
  const client = {
    request: vi.fn().mockResolvedValue(false),
  } as any

  await expect(revert(client, { id: '0xdeadbeef' })).rejects.toThrowError(
    new RevertError({ id: '0xdeadbeef' }),
  )
})

test('propagates error when client request rejects', async () => {
  const error = new Error('RPC failure')
  const client = {
    request: vi.fn().mockRejectedValue(error),
  } as any

  await expect(revert(client, { id: '0x1' })).rejects.toThrow(error)
})

const client = anvilMainnet.getClient()

const sourceAccount = accounts[0]
const targetAccount = accounts[1]

test('reverts', async () => {
  const balance = await getBalance(client, {
    address: sourceAccount.address,
  })

  const id = await snapshot(client)

  await sendTransaction(client, {
    account: sourceAccount.address,
    to: targetAccount.address,
    value: parseEther('2'),
  })
  await mine(client, { blocks: 1 })
  expect(
    await getBalance(client, {
      address: sourceAccount.address,
    }),
  ).not.toBe(balance)

  await expect(revert(client, { id })).resolves.toBeUndefined()
  expect(
    await getBalance(client, {
      address: sourceAccount.address,
    }),
  ).toBe(balance)
})
