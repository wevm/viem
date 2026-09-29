/**
 * EIP-8130 high-rate payer: single-tx create + lock (live, Base Vibenet).
 *
 * Deploys a high-rate payer smart account and LOCKS it in a single, self-paid
 * transaction:
 *   - `accountChanges: [createChange]` creates the account (local sequence 0 → 1)
 *   - `calls: [applySignedAccountChanges(lock @ seq 1)]` locks it in execution
 * (the native/top-level lock op is deferred by the node, so we lock via a direct
 * keystore call signed against the post-create local sequence, `1`).
 *
 * Actors on the account:
 *   - admin  (scope 0)            → ADMIN_ADDRESS  (signs the create + lock)
 *   - payer  (sponsorPayer scope) → PAYER_ACTOR
 *
 * Run:
 *   1. Print the counterfactual account address to fund (no key needed):
 *        VIBENET_RPC=https://rpc.vibes.base.org \
 *          npx vitest run --config test/vitest.eip8130.config.ts \
 *            scripts/eip8130/highRatePayerLifecycle.test.ts
 *   2. Fund the printed PAYER ACCOUNT address, then re-run with the admin key:
 *        ADMIN_PK=0x... VIBENET_RPC=https://rpc.vibes.base.org \
 *          npx vitest run --config test/vitest.eip8130.config.ts \
 *            scripts/eip8130/highRatePayerLifecycle.test.ts
 */

import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/index.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { newSmartAccount } from '../../src/eip8130/accounts/toAccount.js'
import { getLockStatus } from '../../src/eip8130/actions/getLockStatus.js'
import { sendTransaction } from '../../src/eip8130/actions/sendTransaction.js'
import { waitForTransactionReceipt } from '../../src/eip8130/actions/waitForTransactionReceipt.js'
import { actorScope, keystoreAddress } from '../../src/eip8130/constants.js'
import { canonicalEip8130Deployment } from '../../src/eip8130/deployments.js'
import { authorizeActor, key, toScope } from '../../src/eip8130/keys.js'
import { lockChange } from '../../src/eip8130/lock.js'
import { encodeApplySignedAccountChangesData } from '../../src/eip8130/utils/keystoreCalls.js'
import { defineChain } from '../../src/utils/chain/defineChain.js'
import { formatEther } from '../../src/utils/unit/formatEther.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'

const RPC = process.env.VIBENET_RPC
// Admin private key that signs the create + lock. Must derive to ADMIN_ADDRESS.
const ADMIN_PK = process.env.ADMIN_PK as `0x${string}` | undefined

// Requested actor addresses.
const ADMIN_ADDRESS = '0xAaACa598873cD37ac47139877Eb0cde6bA6A4125' as const
const PAYER_ACTOR = '0x81e979079b4137b7b4c06a00234374c4d67cc166' as const

// Stable salt so the payer address is the same run-to-run (fund it once).
const PAYER_SALT = `0x${'a1'.repeat(32)}` as const
const highRateImpl = canonicalEip8130Deployment.accounts.defaultHighRate

describe.runIf(RPC)('EIP-8130 high-rate payer: create + lock (live)', () => {
  test('single tx: create + lock', async () => {
    const chain = defineChain({
      id: 84538453,
      name: 'Base Vibenet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: { default: { http: [RPC!] } },
    })
    const client = createClient({ chain, transport: http(RPC!) })

    // Admin signer. Without ADMIN_PK we still derive the account address (it is
    // a pure function of the actor addresses) so it can be funded ahead of time.
    const admin = ADMIN_PK
      ? privateKeyToAccount(ADMIN_PK)
      : ({
          address: ADMIN_ADDRESS,
        } as unknown as ReturnType<typeof privateKeyToAccount>)
    if (ADMIN_PK && admin.address.toLowerCase() !== ADMIN_ADDRESS.toLowerCase())
      throw new Error(
        `ADMIN_PK derives to ${admin.address}, expected ${ADMIN_ADDRESS}.`,
      )

    // High-rate payer: admin (scope 0) + payer (sponsorPayer scope) actor.
    const payer = newSmartAccount({
      signer: admin,
      salt: PAYER_SALT,
      proxy: 'erc1167',
      implementation: highRateImpl,
      extraActors: [
        authorizeActor(key.k1(PAYER_ACTOR), {
          scope: toScope(actorScope.sponsorPayer),
        }),
      ],
    })

    console.log('admin actor:  ', ADMIN_ADDRESS)
    console.log('payer actor:  ', PAYER_ACTOR)
    console.log('high-rate impl:', highRateImpl)
    console.log('PAYER ACCOUNT:', payer.address, '  ← fund this')

    if (!ADMIN_PK) {
      console.warn('\nSet ADMIN_PK (must derive to the admin actor) to sign the create + lock.')
      return
    }

    const balance = await getBalance(client, { address: payer.address })
    console.log('payer balance:', formatEther(balance), 'ETH')
    if (balance < parseEther('0.001')) {
      console.warn(
        `\n⚠️  ${payer.address} is underfunded (${formatEther(balance)} ETH). ` +
          'Send vibenet ETH, then re-run.',
      )
      return
    }

    // Single tx: create (local seq 0 → 1) then lock via keystore call @ seq 1.
    const code = await getCode(client, { address: payer.address })
    if (!code || code === '0x') {
      const lockEntry = await payer.change([lockChange({ unlockDelay: 3600 })], {
        channel: 'local',
        chainId: chain.id,
        sequence: 1n,
      })
      const data = encodeApplySignedAccountChangesData({
        account: payer.address,
        ...lockEntry,
      })
      const hash = await sendTransaction(client, {
        account: payer,
        accountChanges: [payer.createChange],
        calls: [{ to: keystoreAddress, data }],
        gas: 3_000_000n,
      })
      const receipt = await waitForTransactionReceipt(client, { hash })
      console.log('create+lock:', hash, receipt.status)
      expect(receipt.status).toBe('0x1')
    } else {
      console.log('create+lock: already deployed, skipping')
    }

    // Verify locked (poll to absorb RPC read-after-write lag).
    let status = await getLockStatus(client, { account: payer.address })
    for (let i = 0; i < 10 && !status.locked; i++) {
      await new Promise((r) => setTimeout(r, 1500))
      status = await getLockStatus(client, { account: payer.address })
    }
    console.log('lock status:', status)
    expect(status.locked).toBe(true)
  }, 180_000)
})
