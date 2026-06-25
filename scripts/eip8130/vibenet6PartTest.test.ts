/**
 * 6-part EIP-8130 native transaction test against the local vibenet devnet.
 *
 * Tests (in order):
 *   1. EOA plain tx        — delegate + send ETH (EIP-7702 style)
 *   2. EOA owner change    — authorize a second K1 key
 *   3. EOA with new key    — send tx signed by the newly authorized key
 *   4. Smart account create — createAccount + send ETH
 *   5. Smart account tx    — follow-up send using same account
 *   6. Smart account rotate — authorize a new K1 key
 *
 * Run:
 *   npx vitest run --config test/vitest.eip8130.config.ts \
 *     scripts/eip8130/vibenet6PartTest.test.ts
 */

import { describe, expect, test } from 'vitest'
import { generatePrivateKey, privateKeyToAccount } from '../../src/accounts/index.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { waitForTransactionReceipt8130 } from '../../src/experimental/eip8130/actions/waitForTransactionReceipt8130.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { to8130Account } from '../../src/experimental/eip8130/accounts/to8130Account.js'
import { getConfigSequence8130 } from '../../src/experimental/eip8130/actions/getConfigSequence8130.js'
import { getTransactionCount8130 } from '../../src/experimental/eip8130/actions/getTransactionCount8130.js'
import { sendCalls8130 } from '../../src/experimental/eip8130/actions/sendCalls.js'
import { vibenetDevnetDeployment } from '../../src/experimental/eip8130/deployments.js'
import { authorizeActor, key } from '../../src/experimental/eip8130/keys.js'
import type { AaCalls } from '../../src/experimental/eip8130/types/transaction.js'
import { erc1167Bytecode } from '../../src/experimental/eip8130/utils/proxy.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'
import type { Address, Hex } from '../../src/types/index.js'

// ---------------------------------------------------------------------------
// Config — defaults target the local vibenet devnet
// ---------------------------------------------------------------------------

const RPC = process.env.VIBENET_RPC ?? 'http://localhost:8645'
// Anvil account 0 — vibenet-setup sweeps all anvil balances into this address
// on both L1 and L2, so it becomes the rich faucet after setup completes.
const FAUCET_KEY = (process.env.FAUCET_KEY ??
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80') as Hex
const CHAIN_ID = 84538453
const D = vibenetDevnetDeployment

const vibenetChain = {
  id: CHAIN_ID,
  name: 'vibenet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: { default: { http: [RPC] } },
} as const

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function log(label: string, value: string) {
  console.log(`  ${label.padEnd(22)} ${value}`)
}

const client = createClient({ transport: http(RPC), chain: vibenetChain })

async function fund(to: Address, amount = parseEther('0.5')) {
  const faucet = privateKeyToAccount(FAUCET_KEY)
  const hash = await sendTransaction(client as any, {
    account: faucet,
    to,
    value: amount,
    chain: vibenetChain,
  })
  await waitForTransactionReceipt(client as any, { hash })
  log('funded', `${to} ← ${amount} wei`)
}

async function send8130(
  account: ReturnType<typeof to8130Account>,
  calls: AaCalls,
  accountChanges?: any[],
): Promise<Hex> {
  const nonce = await getTransactionCount8130(client as any, {
    address: account.address as Address,
    nonceKey: 0n,
  })

  const hash = await sendCalls8130(client as any, {
    account,
    calls,
    accountChanges: accountChanges ?? [],
    nonceSequence: nonce,
    gas: 500_000n,
  })
  log('tx hash', hash)
  const receipt = await waitForTransactionReceipt8130(client as any, { hash, timeout: 30_000 })
  const ok = receipt.status === '0x1' || receipt.status === 'success'
  log('status', ok ? '✓ success' : `✗ FAILED (status=${receipt.status}, phases=${JSON.stringify(receipt.eip8130?.phaseStatuses)})`)
  if (!ok) throw new Error(`Transaction reverted: ${hash}`)
  return hash
}

async function sendWithOwnerChange(
  account: ReturnType<typeof to8130Account>,
  calls: AaCalls,
  actorChanges: Parameters<typeof account.change>[0],
): Promise<Hex> {
  const { local } = await getConfigSequence8130(client as any, {
    accountConfiguration: D.accountConfiguration as Address,
    account: account.address as Address,
  })
  const configChange = await account.change(actorChanges, {
    chainId: CHAIN_ID,
    sequence: Number(local),
  })
  return send8130(account, calls, [configChange])
}

// ---------------------------------------------------------------------------
// Test data — fresh keys per run so tests are fully independent
// ---------------------------------------------------------------------------

const code = erc1167Bytecode(D.accounts.erc4337)
const RECIPIENT = '0x1111111111111111111111111111111111111111' as Address

// EOA account — signer IS the account address
const eoaKey1 = generatePrivateKey()
const eoaKey2 = generatePrivateKey()
const eoa1 = privateKeyToAccount(eoaKey1)
const eoa2 = privateKeyToAccount(eoaKey2)

const eoaAccount1 = to8130Account({
  signer: eoa1,
  userSalt: '0x' + '00'.repeat(32) as Hex,
  code,
  initialActors: [key.k1(eoa1.address)],
  accountConfigAddress: D.accountConfiguration as Address,
  address: eoa1.address, // EOA: address == signer address
})

// On first use eoaAccount2 still points at eoa1's address but signs with eoa2
const eoaAccount2 = to8130Account({
  signer: eoa2,
  userSalt: '0x' + '00'.repeat(32) as Hex,
  code,
  initialActors: [key.k1(eoa1.address)],
  accountConfigAddress: D.accountConfiguration as Address,
  address: eoa1.address,
})

// Smart account — address derived from salt + initialActors
const smartKey1 = generatePrivateKey()
const smart1 = privateKeyToAccount(smartKey1)
const smartSalt = keccak256(stringToHex(`vibe-6part-${Date.now()}`))

const smartAccount = to8130Account({
  signer: smart1,
  userSalt: smartSalt,
  code,
  initialActors: [key.k1(smart1.address)],
  accountConfigAddress: D.accountConfiguration as Address,
})

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe.sequential('6-part vibenet EIP-8130 native tx test', () => {
  test('1. EOA — plain tx (delegate + ETH send)', async () => {
    console.log('\n══ Test 1: EOA plain tx ══')
    log('EOA address', eoa1.address)

    await fund(eoa1.address)
    const balBefore = await getBalance(client as any, { address: RECIPIENT })

    // Include a `delegation` account-change so the EOA is backed by DefaultAccount
    // bytecode before executeBatch is invoked. Without this the EOA has no code
    // and the executeBatch self-call is a no-op (succeeds silently, value not sent).
    await send8130(
      eoaAccount1,
      [[{ to: RECIPIENT, value: parseEther('0.001') }]],
      [eoaAccount1.delegate(D.accounts.default as Address)],
    )

    const balAfter = await getBalance(client as any, { address: RECIPIENT })
    expect(balAfter).toBeGreaterThan(balBefore)
    log('recipient Δ', `+${(Number(balAfter - balBefore) / 1e15).toFixed(3)} mETH`)
  }, 60_000)

  test('2. EOA — owner change (authorize second K1 key)', async () => {
    console.log('\n══ Test 2: EOA owner change ══')
    log('new key', eoa2.address)

    await sendWithOwnerChange(
      eoaAccount1,
      [[{ to: RECIPIENT, value: 0n }]],
      [authorizeActor({ actorId: key.k1(eoa2.address).actorId, authenticator: D.authenticators.k1 as Address })],
    )
    log('authorized', eoa2.address)
  }, 60_000)

  test('3. EOA — tx signed by newly authorized key', async () => {
    console.log('\n══ Test 3: EOA tx with new key ══')
    const balBefore = await getBalance(client as any, { address: RECIPIENT })

    await send8130(
      eoaAccount2,
      [[{ to: RECIPIENT, value: parseEther('0.001') }]],
    )

    const balAfter = await getBalance(client as any, { address: RECIPIENT })
    expect(balAfter).toBeGreaterThan(balBefore)
  }, 60_000)

  test('4. Smart account — createAccount + ETH send', async () => {
    console.log('\n══ Test 4: Smart account create ══')
    log('smart account', smartAccount.address)
    await fund(smartAccount.address)

    const balBefore = await getBalance(client as any, { address: RECIPIENT })

    // First tx includes the create account-change so the account is deployed
    await send8130(
      smartAccount,
      [[{ to: RECIPIENT, value: parseEther('0.001') }]],
      [smartAccount.create()],
    )

    const balAfter = await getBalance(client as any, { address: RECIPIENT })
    expect(balAfter).toBeGreaterThan(balBefore)
  }, 60_000)

  test('5. Smart account — follow-up tx (no redeploy)', async () => {
    console.log('\n══ Test 5: Smart account follow-up tx ══')
    const balBefore = await getBalance(client as any, { address: RECIPIENT })

    await send8130(
      smartAccount,
      [[{ to: RECIPIENT, value: parseEther('0.001') }]],
    )

    const balAfter = await getBalance(client as any, { address: RECIPIENT })
    expect(balAfter).toBeGreaterThan(balBefore)
  }, 60_000)

  test('6. Smart account — owner change (add new K1 key)', async () => {
    console.log('\n══ Test 6: Smart account owner change ══')
    const newKey = privateKeyToAccount(generatePrivateKey())
    log('new owner key', newKey.address)

    await sendWithOwnerChange(
      smartAccount,
      [[{ to: RECIPIENT, value: 0n }]],
      [authorizeActor({ actorId: key.k1(newKey.address).actorId, authenticator: D.authenticators.k1 as Address })],
    )
    log('authorized', newKey.address)
  }, 60_000)
})
