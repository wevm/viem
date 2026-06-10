import { parseAbi } from 'abitype'
import { MultisigConfig } from 'ox/tempo'
import { createWalletClient, http } from 'viem'
import { connect, prepareTransactionRequest } from 'viem/actions'
import { tempoLocalnet } from 'viem/chains'
import { Actions, type Capabilities, tempoActions } from 'viem/tempo'
import { expectTypeOf, test } from 'vitest'

declare module 'viem' {
  interface Register {
    CapabilitiesSchema: Capabilities.Schema
  }
}

test('prepareTransactionRequest preserves tempo transaction type', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  const request_action = await prepareTransactionRequest(client, {
    calls: [],
    type: 'tempo',
  })
  const request_client = await client.prepareTransactionRequest({
    calls: [],
    type: 'tempo',
  })

  expectTypeOf(request_action.type).toEqualTypeOf<'tempo'>()
  expectTypeOf(request_client.type).toEqualTypeOf<'tempo'>()
})

test('prepareTransactionRequest defaults to tempo from tempo-only fields', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  // No explicit `type`: tempo-exclusive fields (`calls`/`feeToken`/`multisig`)
  // narrow the inferred type to `'tempo'`.
  const request_calls = await prepareTransactionRequest(client, { calls: [] })
  expectTypeOf(request_calls.type).toEqualTypeOf<'tempo'>()

  const request_feeToken = await prepareTransactionRequest(client, {
    feeToken: '0x20c0000000000000000000000000000000000000',
  })
  expectTypeOf(request_feeToken.type).toEqualTypeOf<'tempo'>()

  const config = MultisigConfig.from({
    threshold: 1,
    owners: [
      { owner: '0x0000000000000000000000000000000000000001', weight: 1 },
    ],
  })
  const request_multisig = await prepareTransactionRequest(client, {
    multisig: config,
  })
  expectTypeOf(request_multisig.type).toEqualTypeOf<'tempo'>()
})

test('prepareTransactionRequest stays a union when ambiguous', async () => {
  const client = createWalletClient({
    account: '0x',
    chain: tempoLocalnet,
    transport: http(),
  })

  // No tempo-exclusive fields: the request matches both built-in and tempo
  // members, so it must NOT be narrowed to `'tempo'`.
  const request = await prepareTransactionRequest(client, {
    to: '0x0000000000000000000000000000000000000000',
    value: 1n,
  })
  expectTypeOf(request.type).toEqualTypeOf<
    'legacy' | 'eip2930' | 'eip1559' | 'eip4844' | 'eip7702' | 'tempo'
  >()
})

test('tempoActions exposes Tempo wallet sync actions', async () => {
  const client = createWalletClient({
    account: '0x0000000000000000000000000000000000000001',
    chain: tempoLocalnet,
    transport: http(),
  }).extend(tempoActions())

  await client.connect({
    capabilities: {
      authorizeAccessKey: {
        expiry: Math.floor(Date.now() / 1000) + 86_400,
        keyType: 'p256',
      },
      method: 'login',
      personalSign: { message: 'hello' },
      showDeposit: { amount: '50', on: 'login', token: 'USDC' },
    },
  })
  type ConnectReturnValue = Awaited<ReturnType<typeof client.connect>>
  expectTypeOf<
    ConnectReturnValue['accounts'][number]['capabilities']
  >().toMatchTypeOf<Capabilities.ConnectCapabilitiesReturn | undefined>()

  type ConnectParameters = NonNullable<Parameters<typeof client.connect>[0]>

  const _connectAuthorizeWithPrivateKey = {
    capabilities: {
      authorizeAccessKey: {
        expiry: Math.floor(Date.now() / 1000) + 86_400,
        keyType: 'p256',
        // @ts-expect-error `wallet_connect` access key authorization does not accept caller-provided private key material.
        privateKey:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      },
    },
  } satisfies ConnectParameters
  const _connectAuthorizeWithShowDeposit = {
    capabilities: {
      authorizeAccessKey: {
        expiry: Math.floor(Date.now() / 1000) + 86_400,
        keyType: 'p256',
        // @ts-expect-error Nested `wallet_connect` access key authorization does not accept showDeposit.
        showDeposit: true,
      },
    },
  } satisfies ConnectParameters
  const _connectVersion = {
    // @ts-expect-error `connect` sets the `wallet_connect` protocol version internally.
    version: '1',
  } satisfies ConnectParameters
  const _connectChainId = {
    // @ts-expect-error `connect` gets the `wallet_connect` chain ID from the chain.
    chainId: tempoLocalnet.id,
  } satisfies ConnectParameters
  void _connectAuthorizeWithPrivateKey
  void _connectAuthorizeWithShowDeposit
  void _connectVersion
  void _connectChainId

  await client.sendTransactionSync({
    calls: [],
    feeToken: '0x20c0000000000000000000000000000000000001',
    type: 'tempo',
  })

  await client.writeContractSync({
    address: '0x0000000000000000000000000000000000000002',
    abi: parseAbi(['function mint(uint256 tokenId)']),
    args: [1n],
    feeToken: '0x20c0000000000000000000000000000000000001',
    functionName: 'mint',
    type: 'tempo',
  })

  await client.sendCallsSync({
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    timeout: 1_000,
  })

  type SendCallsSyncParameters = Actions.wallet.sendCallsSync.Parameters<
    typeof tempoLocalnet,
    undefined,
    typeof tempoLocalnet
  >

  const _pollingInterval = {
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    // @ts-expect-error Tempo `wallet_sendCallsSync` does not poll.
    pollingInterval: 1_000,
  } satisfies SendCallsSyncParameters

  const _status = {
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    // @ts-expect-error Tempo `wallet_sendCallsSync` does not wait for a target status.
    status: 'success',
  } satisfies SendCallsSyncParameters
  const _experimentalFallback = {
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    // @ts-expect-error Tempo `wallet_sendCallsSync` does not use fallback transactions.
    experimental_fallback: true,
  } satisfies SendCallsSyncParameters
  const _experimentalFallbackDelay = {
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    // @ts-expect-error Tempo `wallet_sendCallsSync` does not use fallback transactions.
    experimental_fallbackDelay: 100,
  } satisfies SendCallsSyncParameters
  void _pollingInterval
  void _status
  void _experimentalFallback
  void _experimentalFallbackDelay

  await client.authorizeAccessKey({
    accessKey: {
      address: '0x0000000000000000000000000000000000000003',
      type: 'p256',
    },
    expiry: Math.floor(Date.now() / 1000) + 86_400,
  })

  await client.authorizeAccessKey({
    expiry: Math.floor(Date.now() / 1000) + 86_400,
    keyType: 'p256',
  })

  const _authorizeWithPrivateKey = {
    expiry: Math.floor(Date.now() / 1000) + 86_400,
    keyType: 'p256',
    // @ts-expect-error The wallet action does not accept caller-provided private key material.
    privateKey:
      '0x0000000000000000000000000000000000000000000000000000000000000001',
  } satisfies Actions.wallet.authorizeAccessKey.Parameters
  void _authorizeWithPrivateKey

  await client.revokeAccessKey({
    accessKey: '0x0000000000000000000000000000000000000003',
  })

  await connect(client, {
    capabilities: {
      authorizeAccessKey: {
        accessKey: {
          publicKey:
            '0x20fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240',
          type: 'p256',
        },
        expiry: Math.floor(Date.now() / 1000) + 86_400,
      },
      method: 'register',
      name: 'default',
    },
  })

  await Actions.wallet.sendTransactionSync(client, {
    calls: [],
    feeToken: '0x20c0000000000000000000000000000000000001',
    type: 'tempo',
  })

  await Actions.wallet.writeContractSync(client, {
    address: '0x0000000000000000000000000000000000000002',
    abi: parseAbi(['function mint(uint256 tokenId)']),
    args: [1n],
    feeToken: '0x20c0000000000000000000000000000000000001',
    functionName: 'mint',
    type: 'tempo',
  })

  await Actions.wallet.sendCallsSync(client, {
    chain: tempoLocalnet,
    calls: [{ to: '0x0000000000000000000000000000000000000002' }],
    timeout: 1_000,
  })

  await Actions.wallet.authorizeAccessKey(client, {
    accessKey: {
      publicKey:
        '0x20fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240',
      type: 'p256',
    },
    expiry: Math.floor(Date.now() / 1000) + 86_400,
  })

  await Actions.wallet.revokeAccessKey(client, {
    accessKey: {
      publicKey:
        '0x20fe09fa1af47a6b3b4e973040f0588a1c2c96df1ce78b10e50903566ad9b7d87ffe0b281b616196c2ccdb64cd51230d8dc1f1d258ca7e8cb33a63cf8c812240',
      type: 'p256',
    },
  })
})
