import {
  type Address,
  encodeFunctionData,
  type Hex,
  parseEventLogs,
  type ReadContractReturnType,
  zeroAddress,
  zeroHash,
} from 'viem'
import { Abis } from 'viem/tempo/zones'
import { expectTypeOf, test } from 'vitest'

test('zoneFactory supports both parameter shapes', () => {
  const sequencerSet = encodeFunctionData({
    abi: Abis.zoneFactory,
    functionName: 'createZone',
    args: [
      {
        initialToken: zeroAddress,
        accessMode: false,
        gatewayMode: false,
        allowedAccounts: [],
        zoneGateways: [],
        admin: zeroAddress,
        sequencers: [zeroAddress],
        threshold: 1,
        rpcUrl: '',
      },
    ],
  })
  const sequencer = encodeFunctionData({
    abi: Abis.zoneFactory,
    functionName: 'createZone',
    args: [
      {
        initialToken: zeroAddress,
        admin: zeroAddress,
        sequencer: zeroAddress,
        verifier: zeroAddress,
        zoneParams: {
          genesisBlockHash: zeroHash,
          genesisTempoBlockHash: zeroHash,
          genesisTempoBlockNumber: 0n,
        },
        rpcUrl: '',
      },
    ],
  })

  expectTypeOf(sequencerSet).toEqualTypeOf<Hex>()
  expectTypeOf(sequencer).toEqualTypeOf<Hex>()
})

test('zoneFactory decodes zone registry entries', () => {
  type ZoneInfo = ReadContractReturnType<typeof Abis.zoneFactory, 'zones'>

  expectTypeOf<ZoneInfo>().toEqualTypeOf<{
    accessMode: boolean
    admin: Address
    gatewayMode: boolean
    portal: Address
    rpcUrl: string
    sequencers: readonly Address[]
    threshold: number
    verifier: Address
    zoneId: number
  }>()
})

test('zonePortal decodes token configuration', () => {
  type TokenConfig = ReadContractReturnType<
    typeof Abis.zonePortal,
    'tokenConfig'
  >

  expectTypeOf<TokenConfig>().toEqualTypeOf<{
    depositsActive: boolean
    enabled: boolean
  }>()
})

test('zonePortal encodes pause operations', () => {
  const pause = encodeFunctionData({
    abi: Abis.zonePortal,
    functionName: 'pause',
  })

  expectTypeOf(pause).toEqualTypeOf<Hex>()
})

test('zoneMessenger and zoneVerifier expose callable ABIs', () => {
  const relay = encodeFunctionData({
    abi: Abis.zoneMessenger,
    functionName: 'relayMessage',
    args: [1, zeroAddress, zeroHash, zeroAddress, 1n, 100_000n, '0x'],
  })
  const verify = encodeFunctionData({
    abi: Abis.zoneVerifier,
    functionName: 'verify',
    args: [
      1,
      1n,
      1n,
      zeroHash,
      1n,
      { prevBlockHash: zeroHash, nextBlockHash: zeroHash },
      {
        prevProcessedHash: zeroHash,
        nextProcessedHash: zeroHash,
        prevDepositNumber: 0n,
        nextDepositNumber: 0n,
      },
      zeroHash,
      '0x',
      '0x',
    ],
  })

  expectTypeOf(relay).toEqualTypeOf<Hex>()
  expectTypeOf(verify).toEqualTypeOf<Hex>()
})

test('zoneOutbox decodes WithdrawalRequested fallback nonces', () => {
  const [event] = parseEventLogs({
    abi: Abis.zoneOutbox,
    eventName: 'WithdrawalRequested',
    logs: [],
    strict: true,
  })

  if (!event) return
  expectTypeOf(event.args.fallbackNonce).toEqualTypeOf<bigint>()
  expectTypeOf(event.args.sender).toEqualTypeOf<Address>()
})
