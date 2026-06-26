import { describe, expect, test } from 'vitest'
import { anvilMainnet } from '~test/anvil.js'
import { estimateContractGas } from '../../actions/public/estimateContractGas.js'
import { simulateContract } from '../../actions/public/simulateContract.js'
import { mainnet } from '../../chains/definitions/mainnet.js'
import { optimism } from '../../chains/definitions/optimism.js'
import { ClientChainNotConfiguredError } from '../../errors/chain.js'
import * as Addresses from '../Addresses.js'
import * as erc20 from '../actions/erc20.js'
import { TokenNotFoundError } from '../errors.js'
import { usdc } from '../tokens.js'
import * as Decorator from './erc20.js'

const client = anvilMainnet.getClient().extend(usdc())

describe('getAddress', () => {
  test('default: resolves from client chain', () => {
    expect(client.usdc.getAddress()).toBe(Addresses.usdc[mainnet.id])
  })

  test('behavior: explicit chain id', () => {
    expect(client.usdc.getAddress(mainnet.id)).toBe(Addresses.usdc[mainnet.id])
    expect(Decorator.getAddress(optimism.id, Addresses.usdc)).toBe(
      Addresses.usdc[optimism.id],
    )
  })

  test('behavior: token not deployed on chain', () => {
    expect(() => client.usdc.getAddress(31337)).toThrow(TokenNotFoundError)
  })
})

describe('getMetadata', () => {
  test('default', async () => {
    const metadata = await client.usdc.getMetadata()
    expect(metadata.name).toBe('USD Coin')
    expect(metadata.symbol).toBe('USDC')
    expect(metadata.decimals).toBe(6)
    expect(metadata.totalSupply).toBeGreaterThan(0n)
  })

  test('behavior: address override', async () => {
    const metadata = await client.usdc.getMetadata({
      address: Addresses.usdc[mainnet.id],
    })
    expect(metadata.symbol).toBe('USDC')
  })
})

describe('getBalance', () => {
  test('default', async () => {
    const balance = await client.usdc.getBalance({
      account: '0x55FE002aefF02F77364de339a1292923A15844B8', // Circle
    })
    expect(typeof balance).toBe('bigint')
    expect(balance).toBeGreaterThanOrEqual(0n)
  })

  test('behavior: address override', async () => {
    const balance = await client.usdc.getBalance({
      account: '0x55FE002aefF02F77364de339a1292923A15844B8',
      address: Addresses.usdc[mainnet.id],
    })
    expect(typeof balance).toBe('bigint')
  })
})

describe('allowance', () => {
  test('default', async () => {
    const allowance = await client.usdc.allowance({
      owner: '0x55FE002aefF02F77364de339a1292923A15844B8',
      spender: '0x000000000000000000000000000000000000dEaD',
    })
    expect(typeof allowance).toBe('bigint')
  })
})

describe('.call', () => {
  test('default: resolves address from client chain', () => {
    const call = client.usdc.transfer.call({
      to: '0x000000000000000000000000000000000000dEaD',
      amount: '1',
    })
    expect(call.to).toBe(Addresses.usdc[mainnet.id])
    expect(call.address).toBe(Addresses.usdc[mainnet.id])
    expect(call.functionName).toBe('transfer')
    expect(call.data).toMatch(/^0x/)
  })

  test('behavior: explicit address override', () => {
    const call = client.usdc.getBalance.call({
      account: '0x000000000000000000000000000000000000dEaD',
      address: '0x000000000000000000000000000000000000bEEF',
    })
    expect(call.to).toBe('0x000000000000000000000000000000000000bEEF')
  })

  test('behavior: throws when client has no chain', () => {
    const noChain = anvilMainnet.getClient({ chain: false }).extend(usdc())
    expect(() =>
      // @ts-expect-error - `address` is required at the type level; this tests
      // the runtime guard for JS consumers.
      noChain.usdc.transfer.call({
        to: '0x000000000000000000000000000000000000dEaD',
        amount: '1',
      }),
    ).toThrow(ClientChainNotConfiguredError)
  })

  test('behavior: estimateContractGas via .call (approve)', async () => {
    const gas = await estimateContractGas(client, {
      ...client.usdc.approve.call({
        spender: '0x000000000000000000000000000000000000dEaD',
        amount: '1',
      }),
      account: '0x55FE002aefF02F77364de339a1292923A15844B8',
    })
    expect(gas).toBeGreaterThan(0n)
  })

  test('behavior: simulateContract via .call (approve)', async () => {
    const { result } = await simulateContract(client, {
      ...client.usdc.approve.call({
        spender: '0x000000000000000000000000000000000000dEaD',
        amount: '1',
      }),
      account: '0x55FE002aefF02F77364de339a1292923A15844B8',
    })
    expect(result).toBe(true)
  })
})

describe('extractEvent', () => {
  test('default: present on write actions', () => {
    expect(typeof client.usdc.transfer.extractEvent).toBe('function')
    expect(typeof client.usdc.approve.extractEvent).toBe('function')
  })
})

describe('define', () => {
  test('default: custom namespace', () => {
    const dai = Decorator.define('dai', {
      addresses: { [mainnet.id]: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
      decimals: 18,
    })
    const extended = anvilMainnet.getClient().extend(dai())
    expect(extended.dai.getAddress()).toBe(
      '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    )
  })

  test('behavior: address overrides', () => {
    const override = '0x000000000000000000000000000000000000bEEF'
    const client = anvilMainnet
      .getClient()
      .extend(usdc({ addresses: { [mainnet.id]: override } }))
    expect(client.usdc.getAddress()).toBe(override)
  })

  test('behavior: address overrides merge with defaults', () => {
    const override = '0x000000000000000000000000000000000000bEEF'
    const client = anvilMainnet
      .getClient()
      .extend(usdc({ addresses: { [optimism.id]: override } }))
    // overridden chain
    expect(client.usdc.getAddress(optimism.id)).toBe(override)
    // default chain still resolves
    expect(client.usdc.getAddress(mainnet.id)).toBe(Addresses.usdc[mainnet.id])
  })

  test('behavior: decimals override', () => {
    const to = '0x000000000000000000000000000000000000dEaD'
    const client = anvilMainnet.getClient().extend(usdc({ decimals: 18 }))
    const fromString = client.usdc.transfer.call({ to, amount: '1' })
    const baseUnits = erc20.transfer.call({
      address: Addresses.usdc[mainnet.id],
      to,
      amount: '1',
      decimals: 18,
    })
    expect(fromString.data).toBe(baseUnits.data)
  })
})

describe('amount: string input', () => {
  test('default: parses string via decimals (USDC: 6)', () => {
    const to = '0x000000000000000000000000000000000000dEaD'
    const fromString = client.usdc.transfer.call({ to, amount: '10.5' })
    // compare against the generic action with explicit base units
    const baseUnits = erc20.transfer.call({
      address: Addresses.usdc[mainnet.id],
      to,
      amount: '10.5',
      decimals: 6,
    })
    expect(fromString.data).toBe(baseUnits.data)
  })

  test('behavior: custom token decimals (18)', () => {
    const to = '0x000000000000000000000000000000000000dEaD'
    const address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const dai = Decorator.define('dai', {
      addresses: { [mainnet.id]: address },
      decimals: 18,
    })
    const extended = anvilMainnet.getClient().extend(dai())
    const fromString = extended.dai.transfer.call({ to, amount: '1' })
    const baseUnits = erc20.transfer.call({
      address,
      to,
      amount: '1',
      decimals: 18,
    })
    expect(fromString.data).toBe(baseUnits.data)
  })
})

describe('behavior: unsupported chain', () => {
  const to = '0x000000000000000000000000000000000000dEaD'
  const address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

  test('throws without an address override', () => {
    const noChain = anvilMainnet.getClient({ chain: false }).extend(usdc())
    expect(() =>
      // @ts-expect-error - `address` is required at the type level; this tests
      // the runtime guard for JS consumers.
      noChain.usdc.transfer.call({ to, amount: '1' }),
    ).toThrow(ClientChainNotConfiguredError)
  })

  test('resolves with address + decimals override', () => {
    const noChain = anvilMainnet.getClient({ chain: false }).extend(usdc())
    const call = noChain.usdc.transfer.call({
      address,
      to,
      amount: '1',
      decimals: 18,
    })
    const expected = erc20.transfer.call({
      address,
      to,
      amount: '1',
      decimals: 18,
    })
    expect(call.to).toBe(address)
    expect(call.data).toBe(expected.data)
  })

  test('resolves address from a `chain` override', () => {
    const noChain = anvilMainnet.getClient({ chain: false }).extend(usdc())
    const call = noChain.usdc.transfer.call({
      chain: optimism,
      to,
      amount: '1',
    })
    // resolved from the token's address map via optimism.id
    expect(call.to).toBe(Addresses.usdc[optimism.id])
    expect(call.data).toBe(
      erc20.transfer.call({
        address: Addresses.usdc[optimism.id],
        to,
        amount: '1',
        decimals: 6,
      }).data,
    )
  })

  test('throws if `chain` has no configured address', () => {
    const noChain = anvilMainnet.getClient({ chain: false }).extend(usdc())
    expect(() =>
      noChain.usdc.transfer.call({ chain: mainnet, to, amount: '1' }),
    ).not.toThrow()
    // a chain without USDC throws TokenNotFoundError
    const fakeChain = { ...mainnet, id: 999999 }
    expect(() =>
      noChain.usdc.transfer.call({ chain: fakeChain, to, amount: '1' }),
    ).toThrow(TokenNotFoundError)
  })
})

describe('behavior: chain override', () => {
  const to = '0x000000000000000000000000000000000000dEaD'

  test('overrides the client chain on a bound action', () => {
    // client chain is mainnet, but resolve from optimism via `chain`
    const call = client.usdc.transfer.call({ chain: optimism, to, amount: '1' })
    expect(call.to).toBe(Addresses.usdc[optimism.id])
  })

  test('explicit `address` takes precedence over `chain`', () => {
    const address = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
    const call = client.usdc.transfer.call({
      address,
      chain: optimism,
      to,
      amount: '1',
    })
    expect(call.to).toBe(address)
  })
})

describe('generic actions', () => {
  test('default: explicit address', async () => {
    const { name } = await erc20.getMetadata(client, {
      address: Addresses.usdc[mainnet.id],
    })
    expect(name).toBe('USD Coin')
  })
})
