import { afterAll, expect, test, vi } from 'vitest'

import { accounts } from '~test/src/constants.js'
import { privateKeyToAccount } from '../../accounts/privateKeyToAccount.js'
import * as readContract from '../../actions/public/readContract.js'
import { publicActionsL1 } from './publicL1.js'
import { createPublicClient } from '~viem/clients/createPublicClient.js'
import { sepolia } from '~viem/chains/index.js'
import { http } from '~viem/clients/transports/http.js'
import { createWalletClient } from '~viem/clients/createWalletClient.js'

const client = createPublicClient({
  chain: sepolia,
  transport: http()
}).extend(publicActionsL1());

const clientWithAccount = createWalletClient({
  chain: sepolia,
  transport: http(),
  account: privateKeyToAccount(accounts[0].privateKey)
}).extend(publicActionsL1());

const spy = vi.spyOn(readContract, 'readContract').mockResolvedValue(170n);

afterAll(() => {
  spy.mockRestore();
});

test('default', async () => {
  expect(publicActionsL1()(client)).toMatchInlineSnapshot(`
    {
      "getAllowanceL1": [Function],
      "getBalanceOfTokenL1": [Function],
    }
  `)
})

test('getAllowanceL1', async () => {
  expect(await client.getAllowanceL1(
    {
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'
    }
  )).toBe(170n);

  expect(await clientWithAccount.getAllowanceL1(
    {
      bridgeAddress: '0x84DbCC0B82124bee38e3Ce9a92CdE2f943bab60D',
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }
  )).toBe(170n);
})

test('getBalanceOfTokenL1', async () => {
  expect(await client.getBalanceOfTokenL1(
    {
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
      account: accounts[0].privateKey
    }
  )).toBe(170n);

  expect(await clientWithAccount.getBalanceOfTokenL1(
    {
      token: '0x5C221E77624690fff6dd741493D735a17716c26B',
    }
  )).toBe(170n);
})
