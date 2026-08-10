/**
 * Base Sepolia ERC-4337 end-to-end for EIP-8130.
 *
 * Base Sepolia is NOT a native EIP-8130 chain, so accounts run through the
 * portable ERC-4337 path: the `AccountConfiguration` contract is the factory,
 * the `BackwardsCompatible4337Account` is the wallet implementation, and a real
 * bundler + EntryPoint drive execution. This is the flow every non-vibenet chain
 * uses until native 8130 ships.
 *
 * This single test proves the three things that must hold before merge:
 *   1. CREATE — deploy-on-first-use: a counterfactual account is deployed inside
 *      its first userOp and executes a call in the same op.
 *   2. USER OPS — a second userOp runs against the now-deployed account.
 *   3. CHANGE ACTORS — authorize (then revoke) a new actor via a userOp that
 *      calls `AccountConfiguration.applySignedActorChanges`, signed by the owner
 *      over the live on-chain config sequence, verified by read-back.
 *
 * Run (requires a funded Base Sepolia EOA + an ERC-4337 bundler; skipped in CI):
 *   PRIVATE_KEY=0x... BUNDLER_URL=https://... \
 *     npx vitest run --config test/vitest.eip8130.config.ts \
 *       scripts/eip8130/baseSepolia4337E2E.test.ts
 *
 * Env: PRIVATE_KEY (required), BUNDLER_URL (required — no default, so no bundler
 * credential is ever committed), BASE_SEPOLIA_RPC (optional).
 */

import { describe, expect, test } from 'vitest'
import { createBundlerClient } from '../../src/account-abstraction/clients/createBundlerClient.js'
import { entryPoint07Address } from '../../src/account-abstraction/constants/address.js'
import { generatePrivateKey, privateKeyToAccount } from '../../src/accounts/index.js'
import { estimateFeesPerGas } from '../../src/actions/public/estimateFeesPerGas.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { toSmartAccount } from '../../src/experimental/eip8130/accounts/toSmartAccount.js'
import { getConfigSequence } from '../../src/experimental/eip8130/actions/getConfigSequence.js'
import { isActor } from '../../src/experimental/eip8130/actions/isActor.js'
import { actorScope } from '../../src/experimental/eip8130/constants.js'
import { getEip8130Deployment } from '../../src/experimental/eip8130/deployments.js'
import { authorizeActor, key, revokeActor } from '../../src/experimental/eip8130/keys.js'
import { encodeApplySignedActorChangesData } from '../../src/experimental/eip8130/utils/accountConfigCalls.js'
import { signActorChanges } from '../../src/experimental/eip8130/utils/signActorChanges.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const BUNDLER_URL = process.env.BUNDLER_URL
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// Explicit gas limits so the bundler skips `eth_estimateUserOperationGas` (which
// validates signatures a counterfactual account can't satisfy with a stub).
const gasLimits = {
  callGasLimit: 500_000n,
  verificationGasLimit: 1_500_000n,
  preVerificationGas: 500_000n,
} as const

describe.runIf(PRIVATE_KEY && BUNDLER_URL)(
  'Base Sepolia ERC-4337 e2e: create → userOp → change actors',
  () => {
    test(
      'create + execute, a follow-up userOp, and authorize/revoke an actor',
      async () => {
        const owner = privateKeyToAccount(PRIVATE_KEY!)
        const client = createClient({
          account: owner,
          chain: baseSepolia,
          transport: http(RPC_URL),
        })
        const bundlerClient = createBundlerClient({
          client,
          transport: http(BUNDLER_URL!),
        })

        const deployment = getEip8130Deployment(baseSepolia.id)
        if (!deployment?.accounts.erc4337)
          throw new Error(
            'Base Sepolia deployment is missing the erc4337 wallet implementation.',
          )
        const accountConfiguration = deployment.accountConfiguration

        const userSalt = keccak256(stringToHex(`viem-8130-e2e-${Date.now()}`))
        // A 4337-compat account must register the EntryPoint as a trusted-executor
        // actor so it may drive `executeBatch`; without it `validateUserOp` reverts
        // (AA23). Actors must be sorted by `actorId`, strictly ascending.
        const initialActors = [
          key.k1(owner.address),
          key.trustedExecutor(entryPoint07Address),
        ].sort((a, b) => (a.actorId < b.actorId ? -1 : a.actorId > b.actorId ? 1 : 0))
        const account = await toSmartAccount({
          client,
          owner,
          userSalt,
          initialActors,
          implementation: deployment.accounts.erc4337,
          accountConfigAddress: accountConfiguration,
        })

        console.log('\n— Base Sepolia ERC-4337 e2e —')
        console.log('owner (EOA):     ', owner.address)
        console.log('smart account:   ', account.address)
        console.log('factory (config):', accountConfiguration)

        const fees = await estimateFeesPerGas(client)
        const feeParams = {
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        }

        // Wait for a userOp receipt and assert it succeeded.
        async function runUserOp(
          label: string,
          calls: readonly { to: `0x${string}`; value?: bigint; data?: `0x${string}` }[],
        ) {
          // The bundler maintains its own state view that can lag the RPC node
          // right after a funding tx. Retry the transient prefund-precheck race.
          let hash: `0x${string}` | undefined
          for (let attempt = 0; ; attempt++) {
            try {
              hash = await bundlerClient.sendUserOperation({
                account,
                calls,
                ...gasLimits,
                ...feeParams,
              })
              break
            } catch (err) {
              const msg = (err as Error).message ?? ''
              const transient = /precheck failed|balance.*is 0|deposit/i.test(msg)
              if (!transient || attempt >= 8) throw err
              await sleep(3000)
            }
          }
          const receipt = await bundlerClient.waitForUserOperationReceipt({ hash })
          console.log(
            `${label}:`.padEnd(18),
            `https://sepolia.basescan.org/tx/${receipt.receipt.transactionHash}`,
            `(success=${receipt.success})`,
          )
          expect(receipt.success, `${label} userOp must succeed`).toBe(true)
          return receipt
        }

        // Poll a read-back predicate to defeat public-RPC replica lag.
        async function pollUntil(
          fn: () => Promise<boolean>,
          { tries = 12, delay = 1500 } = {},
        ) {
          for (let i = 0; i < tries; i++) {
            if (await fn()) return true
            await sleep(delay)
          }
          return false
        }

        // === 1. CREATE — deploy-on-first-use ==============================
        expect((await getCode(client, { address: account.address })) ?? '0x').toBe(
          '0x',
        )
        // Prefund the counterfactual sender so the EntryPoint can pull prefund.
        // Each userOp needs ~1.75e13 wei of gas; 0.005 ETH covers the whole run
        // with headroom while keeping unrecoverable testnet spend low.
        const prefund = parseEther('0.005')
        const fundHash = await sendTransaction(client, {
          account: owner,
          to: account.address,
          value: prefund,
          chain: baseSepolia,
        })
        await waitForTransactionReceipt(client, { hash: fundHash })
        // Confirm the RPC node reflects the prefund before touching the bundler.
        await pollUntil(async () => {
          const bal = await getBalance(client, { address: account.address })
          return bal >= prefund
        })

        await runUserOp('create+execute', [{ to: owner.address, value: 1n }])
        const deployed = await pollUntil(async () => {
          const code = await getCode(client, { address: account.address })
          return !!(code && code !== '0x')
        })
        expect(deployed, 'account must be deployed after the first userOp').toBe(
          true,
        )

        // === 2. USER OPS — a follow-up op on the deployed account =========
        await runUserOp('follow-up op', [{ to: owner.address, value: 1n }])

        // === 3. CHANGE ACTORS — authorize then revoke a fresh k1 actor ====
        const newActor = key.k1(privateKeyToAccount(generatePrivateKey()).address)

        async function applyActorChange(
          label: string,
          change: ReturnType<typeof authorizeActor> | ReturnType<typeof revokeActor>,
        ) {
          // Sign over the LIVE local sequence — never hardcode it.
          const { local } = await getConfigSequence(client, {
            accountConfiguration,
            account: account.address,
          })
          const changes = [change]
          const set = await signActorChanges({
            signer: owner,
            account: account.address,
            chainId: baseSepolia.id,
            sequence: Number(local),
            actorChanges: changes,
          })
          const data = encodeApplySignedActorChangesData({
            account: account.address,
            chainId: baseSepolia.id,
            actorChanges: changes,
            auth: set.auth,
          })
          await runUserOp(label, [{ to: accountConfiguration, data }])
        }

        await applyActorChange(
          'authorize actor',
          authorizeActor(newActor, { scope: actorScope.sender }),
        )
        const authorized = await pollUntil(() =>
          isActor(client, {
            account: account.address,
            actorId: newActor.actorId,
            accountConfiguration,
          }),
        )
        console.log('actor authorized:', authorized)
        expect(authorized, 'new actor must be bound after authorize').toBe(true)

        await applyActorChange('revoke actor', revokeActor(newActor))
        const revoked = await pollUntil(async () =>
          !(await isActor(client, {
            account: account.address,
            actorId: newActor.actorId,
            accountConfiguration,
          })),
        )
        console.log('actor revoked:   ', revoked)
        expect(revoked, 'new actor must be unbound after revoke').toBe(true)
      },
      240_000,
    )
  },
)
