import { erc20Abi } from 'abitype/abis'
import { afterAll, expect, test, vi } from 'vitest'
import { accounts } from '../../../test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as writeContract from '../../actions/wallet/writeContract.js'
import { sepolia } from '../../chains/index.js'
import { createClient } from '../../clients/createClient.js'
import { http } from '../../clients/transports/http.js'
import { publicActionsL1 } from '../decorators/publicL1.js'
import { approveErc20L1 } from './approveErc20TokenL1.js'

const sourceAccount = accounts[0]
const token = '0x70a0F165d6f8054d0d0CF8dFd4DD2005f0AF6B55'
const account = privateKeyToAccount(sourceAccount.privateKey)

const spy = vi
  .spyOn(writeContract, 'writeContract')
  .mockResolvedValue(
    '0x5254a0e1d200d0900920b9bc810caf2d26814426db0719da05a1b14bc3e4032d',
  )

afterAll(() => {
  spy.mockRestore()
})

test('default', async () => {
  const client = createClient({
    chain: sepolia,
    transport: http(),
    account,
  }).extend(publicActionsL1())

  expect(await approveErc20L1(client, { token, amount: 222n })).toBe(
    '0x5254a0e1d200d0900920b9bc810caf2d26814426db0719da05a1b14bc3e4032d',
  )

  expect(spy).toHaveBeenCalledWith(client, {
    abi: erc20Abi,
    address: token,
    args: ['0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 222n],
    functionName: 'approve',
    chain: client.chain,
    account,
  })
})
