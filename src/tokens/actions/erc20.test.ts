import { beforeAll, describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { accounts, address } from '~test/constants.js'
import { getTransactionReceipt } from '../../actions/public/getTransactionReceipt.js'
import { impersonateAccount } from '../../actions/test/impersonateAccount.js'
import { mine } from '../../actions/test/mine.js'
import { setBalance } from '../../actions/test/setBalance.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { getAddress } from '../../utils/address/getAddress.js'
import { parseUnits } from '../../utils/unit/parseUnits.js'
import { wait } from '../../utils/wait.js'
import * as Addresses from '../Addresses.js'
import * as erc20 from './erc20.js'

const client = anvilMainnet.getClient()

const usdc = Addresses.usdc[mainnet.id]
const decimals = 6

const holder = address.usdcHolder
const spender = accounts[0].address
const to = accounts[1].address

beforeAll(async () => {
  await impersonateAccount(client, { address: holder })
  await impersonateAccount(client, { address: spender })
  await setBalance(client, { address: holder, value: 10n ** 20n })
  await setBalance(client, { address: spender, value: 10n ** 20n })
})

/**
 * Awaits a `*Sync` action, mining blocks until it resolves. The mainnet anvil
 * runs with `noMining`, so a sync action that waits for its receipt would hang
 * without a block being produced.
 */
async function mined<value>(action: Promise<value>): Promise<value> {
  let settled = false
  const result = action.finally(() => {
    settled = true
  })
  while (!settled) {
    await mine(client, { blocks: 1 })
    await wait(100)
  }
  return result
}

describe('allowance', () => {
  test('default', async () => {
    const allowance = await erc20.allowance(client, {
      address: usdc,
      owner: holder,
      spender,
    })
    expect(typeof allowance).toBe('bigint')
  })

  test('call', () => {
    const call = erc20.allowance.call({ address: usdc, owner: holder, spender })
    expect(call.to).toBe(usdc)
    expect(call.functionName).toBe('allowance')
    expect(call.data).toMatch(/^0x/)
  })
})

describe('approve', () => {
  test('default', async () => {
    const hash = await erc20.approve(client, {
      account: holder,
      address: usdc,
      spender,
      amount: '100',
      decimals,
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = erc20.approve.extractEvent(receipt.logs)
    expect(args.owner).toBe(getAddress(holder))
    expect(args.spender).toBe(getAddress(spender))
    expect(args.value).toBe(parseUnits('100', decimals))

    const allowance = await erc20.allowance(client, {
      address: usdc,
      owner: holder,
      spender,
    })
    expect(allowance).toBe(parseUnits('100', decimals))
  })

  test('call: parses amount with decimals', () => {
    const call = erc20.approve.call({
      address: usdc,
      spender,
      amount: '1.5',
      decimals,
    })
    expect(call.to).toBe(usdc)
    expect(call.functionName).toBe('approve')
    // `1.5` at 6 decimals == `1500000` base units (decimals: 0)
    expect(call.data).toBe(
      erc20.approve.call({
        address: usdc,
        spender,
        amount: '1500000',
        decimals: 0,
      }).data,
    )
  })

  test('extractEvent: throws when missing', () => {
    expect(() => erc20.approve.extractEvent([])).toThrow(
      '`Approval` event not found.',
    )
  })
})

describe('approveSync', () => {
  test('default', async () => {
    const { receipt, ...args } = await mined(
      erc20.approveSync(client, {
        account: holder,
        address: usdc,
        spender,
        amount: '250',
        decimals,
      }),
    )
    expect(receipt.status).toBe('success')
    expect(args.owner).toBe(getAddress(holder))
    expect(args.spender).toBe(getAddress(spender))
    expect(args.value).toBe(parseUnits('250', decimals))
  })
})

describe('getBalance', () => {
  test('default', async () => {
    const balance = await erc20.getBalance(client, {
      address: usdc,
      account: holder,
    })
    expect(typeof balance).toBe('bigint')
    expect(balance).toBeGreaterThan(0n)
  })

  test('call', () => {
    const call = erc20.getBalance.call({ address: usdc, account: holder })
    expect(call.to).toBe(usdc)
    expect(call.functionName).toBe('balanceOf')
  })
})

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await erc20.getMetadata(client, { address: usdc })
    expect(metadata.name).toBe('USD Coin')
    expect(metadata.symbol).toBe('USDC')
    expect(metadata.decimals).toBe(6)
    expect(metadata.totalSupply).toBeGreaterThan(0n)
  })
})

describe('transfer', () => {
  test('default', async () => {
    const before = await erc20.getBalance(client, {
      address: usdc,
      account: to,
    })

    const hash = await erc20.transfer(client, {
      account: holder,
      address: usdc,
      to,
      amount: '1000',
      decimals,
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = erc20.transfer.extractEvent(receipt.logs)
    expect(args.from).toBe(getAddress(holder))
    expect(args.to).toBe(getAddress(to))
    expect(args.value).toBe(parseUnits('1000', decimals))

    const after = await erc20.getBalance(client, {
      address: usdc,
      account: to,
    })
    expect(after - before).toBe(parseUnits('1000', decimals))
  })

  test('call: defaults decimals to 18', () => {
    const call = erc20.transfer.call({ address: usdc, to, amount: '1' })
    expect(call.to).toBe(usdc)
    expect(call.functionName).toBe('transfer')
    // omitting `decimals` is equivalent to passing `decimals: 18`
    expect(call.data).toBe(
      erc20.transfer.call({
        address: usdc,
        to,
        amount: '1',
        decimals: 18,
      }).data,
    )
  })

  test('extractEvent: throws when missing', () => {
    expect(() => erc20.transfer.extractEvent([])).toThrow(
      '`Transfer` event not found.',
    )
  })
})

describe('transferSync', () => {
  test('default', async () => {
    const { receipt, ...args } = await mined(
      erc20.transferSync(client, {
        account: holder,
        address: usdc,
        to,
        amount: '500',
        decimals,
      }),
    )
    expect(receipt.status).toBe('success')
    expect(args.from).toBe(getAddress(holder))
    expect(args.to).toBe(getAddress(to))
    expect(args.value).toBe(parseUnits('500', decimals))
  })
})

describe('transfer: from (allowance)', () => {
  test('default', async () => {
    // Holder approves spender to move tokens.
    await erc20.approve(client, {
      account: holder,
      address: usdc,
      spender,
      amount: '2000',
      decimals,
    })
    await mine(client, { blocks: 1 })

    const before = await erc20.getBalance(client, {
      address: usdc,
      account: to,
    })

    const hash = await erc20.transfer(client, {
      account: spender,
      address: usdc,
      from: holder,
      to,
      amount: '2000',
      decimals,
    })
    await mine(client, { blocks: 1 })

    const receipt = await getTransactionReceipt(client, { hash })
    const { args } = erc20.transfer.extractEvent(receipt.logs)
    expect(args.from).toBe(getAddress(holder))
    expect(args.to).toBe(getAddress(to))
    expect(args.value).toBe(parseUnits('2000', decimals))

    const after = await erc20.getBalance(client, {
      address: usdc,
      account: to,
    })
    expect(after - before).toBe(parseUnits('2000', decimals))
  })

  test('call: switches to transferFrom', () => {
    const call = erc20.transfer.call({
      address: usdc,
      from: holder,
      to,
      amount: '1',
      decimals,
    })
    expect(call.to).toBe(usdc)
    expect(call.functionName).toBe('transferFrom')
  })
})

describe('transferSync: from (allowance)', () => {
  test('default', async () => {
    await erc20.approve(client, {
      account: holder,
      address: usdc,
      spender,
      amount: '750',
      decimals,
    })
    await mine(client, { blocks: 1 })

    const { receipt, ...args } = await mined(
      erc20.transferSync(client, {
        account: spender,
        address: usdc,
        from: holder,
        to,
        amount: '750',
        decimals,
      }),
    )
    expect(receipt.status).toBe('success')
    expect(args.from).toBe(getAddress(holder))
    expect(args.to).toBe(getAddress(to))
    expect(args.value).toBe(parseUnits('750', decimals))
  })
})

describe('watchApproval', () => {
  test('default', async () => {
    const events: erc20.watchApproval.Args[] = []
    const unwatch = erc20.watchApproval(client, {
      address: usdc,
      onApproval: (args) => events.push(args),
      poll: true,
      pollingInterval: 100,
    })

    await erc20.approve(client, {
      account: holder,
      address: usdc,
      spender,
      amount: '123',
      decimals,
    })
    await mine(client, { blocks: 1 })
    await wait(300)
    unwatch()

    expect(events.length).toBeGreaterThan(0)
    expect(events.some((e) => e.value === parseUnits('123', decimals))).toBe(
      true,
    )
  })
})

describe('watchTransfer', () => {
  test('default', async () => {
    const events: erc20.watchTransfer.Args[] = []
    const unwatch = erc20.watchTransfer(client, {
      address: usdc,
      onTransfer: (args) => events.push(args),
      poll: true,
      pollingInterval: 100,
    })

    await erc20.transfer(client, {
      account: holder,
      address: usdc,
      to,
      amount: '321',
      decimals,
    })
    await mine(client, { blocks: 1 })
    await wait(300)
    unwatch()

    expect(events.length).toBeGreaterThan(0)
    expect(events.some((e) => e.value === parseUnits('321', decimals))).toBe(
      true,
    )
  })
})
