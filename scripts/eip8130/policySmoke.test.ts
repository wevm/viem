/**
 * EIP-8130 session-key + policy smoke test — base/eip-8130 #43.
 *
 * Runs LIVE against the hosted vibenet devnet; gas is sponsored by the vibenet
 * payer, so you don't need to fund anything. It proves the full session-key
 * flow and pins down two things that make a working authorize LOOK broken.
 *
 * Run:
 *   npx vitest run --config test/vitest.eip8130.config.ts \
 *     scripts/eip8130/policySmoke.test.ts
 *
 * Env (optional): RPC_URL, PAYER_URL, BROADCAST_URL.
 *
 * Flow:
 *   1. Create a fresh smart account (sponsored).
 *   2. Register the PolicyManager (trusted-executor) + a session key (policy)
 *      in ONE config change, on the LOCAL channel, at the LIVE sequence.
 *   3. Use the session key to drive the ONE permitted policy-gated call —
 *      Counter.increment() — via PolicyManager.execute(binding, action).
 *      (#43: no install step; the full PolicyBinding is passed at execute.)
 *
 * TWO GOTCHAS currently broken in this VIBENET build:
 *
 *   (a) NO EVENTS IN THE RECEIPT. A *successful* authorize emits ZERO
 *       `receipt.logs` — `ActorAuthorized` is not surfaced as a normal EVM log.
 *       "No events" is NOT a failure signal. The reliable success check is a
 *       READ-BACK: isActor / getActorConfig / a bumped getConfigSequence.
 *
 *   (b) READ-BACK LAG. State reads trail the receipt by ~1 block (~2s). Reading
 *       isActor/sequence right after the receipt returns STALE values — poll.
 *
 *   Sequence correctness: the digest binds (account, chainId, sequence). Sign
 *   with the LIVE on-chain counter for the channel (LOCAL for session keys);
 *   never hardcode it. First-authorize local seq is 1 for a created smart wallet
 *   (create bumps local 0->1) or 0 for a bare 7702-delegated EOA — so read it.
 *   A stale sequence is rejected loudly at broadcast ("config change sequence
 *   mismatch") or mines as a silent no-op.
 *
 *   NONCE MODE: the session key is authorized with POLICY | SCOPE_NONCE, so
 *   prepare uses sequenced nonces (`getTransactionCount`, channel 0).
 *   Prepare reads on-chain scope via getActorConfig when the actor is bound —
 *   do NOT redeclare scope on the session account handle. Owner (admin,
 *   scope 0) remains nonce-free — admin cannot hold SCOPE_NONCE.
 */

import { describe, expect, test } from 'vitest'
import { generatePrivateKey, privateKeyToAccount } from '../../src/accounts/index.js'
import { createPublicClient } from '../../src/clients/createPublicClient.js'
import { http } from '../../src/clients/transports/http.js'
import { createPayerClient } from '../../src/experimental/eip8168/client.js'
import { sendSponsoredCalls } from '../../src/experimental/eip8168/actions/sendSponsoredCalls.js'
import { toAccount } from '../../src/experimental/eip8130/accounts/toAccount.js'
import { getActorConfig } from '../../src/experimental/eip8130/actions/getActorConfig.js'
import { getConfigSequence } from '../../src/experimental/eip8130/actions/getConfigSequence.js'
import { isActor } from '../../src/experimental/eip8130/actions/isActor.js'
import { allPhasesSucceeded } from '../../src/experimental/eip8130/actions/getTransactionReceipt.js'
import { waitForTransactionReceipt } from '../../src/experimental/eip8130/actions/waitForTransactionReceipt.js'
import {
  actorScope,
  canonicalAuthenticators,
  scopeUnrestricted,
} from '../../src/experimental/eip8130/constants.js'
import { getEip8130Deployment } from '../../src/experimental/eip8130/deployments.js'
import { authorizeActor, key } from '../../src/experimental/eip8130/keys.js'
import {
  defineSessionPolicy,
  encodeSessionPolicyConfig,
} from '../../src/experimental/eip8130/policies.js'
import type { AaAccountChange, AaCall } from '../../src/experimental/eip8130/types/transaction.js'
import { upgradeableProxyBytecode } from '../../src/experimental/eip8130/utils/proxy.js'
import type { Hex } from '../../src/types/misc.js'
import { hexToBigInt } from '../../src/utils/encoding/fromHex.js'

const RPC_URL = process.env.RPC_URL ?? 'https://vibes.base.org/api/vibenet/account/rpc'
const PAYER_URL =
  process.env.PAYER_URL ?? 'https://vibes.base.org/api/vibenet/account/payer'
const BROADCAST_URL =
  process.env.BROADCAST_URL ?? 'https://vibes.base.org/api/vibenet/account/rpc'

// The ONE contract this session key is allowed to touch, and the ONE selector.
// Counter.increment() @ vibenet devnet — a real, verifiable on-chain effect.
const COUNTER = '0x7ec1445f7019949B1A1d85e49d29a2ae5dEcF9B0' as const
const INCREMENT = '0xd09de08a' as const // increment()
const COUNT = '0x06661abd' as const // count()  (public getter)

describe('EIP-8130 policy smoke (hosted vibenet)', () => {
  test(
    'create → authorize manager+session → session Counter.increment',
    async () => {
      // --- client + chain -------------------------------------------------
      const bootstrap = createPublicClient({ transport: http(RPC_URL) })
      const chainId = Number(
        await bootstrap.request({ method: 'eth_chainId' }),
      )
      const chain = {
        id: chainId,
        name: 'vibenet',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: [RPC_URL] } },
      } as const
      const client = createPublicClient({ chain, transport: http(RPC_URL) })
      const bclient = createPublicClient({
        chain,
        transport: http(BROADCAST_URL),
      })
      const payer = createPayerClient({ url: PAYER_URL })

      const deployment = getEip8130Deployment(chainId)
      if (!deployment?.policies) {
        throw new Error(
          `No EIP-8130 policy addresses for chain ${chainId}. Refusing to borrow another chain's deployment.`,
        )
      }
      const { policies, accountConfiguration } = deployment
      console.log('chainId:', chainId)
      console.log('policyManager:', policies.manager)
      console.log('sessionPolicy:', policies.sessionPolicy, '\n')

      // --- helpers --------------------------------------------------------
      const now = () => BigInt(Math.floor(Date.now() / 1000))
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

      /**
       * Send a sponsored EIP-8130 tx that may carry BOTH account changes and calls.
       * Hosted vibenet payer only CO-SIGNS (`mode: "sign"`); we self-broadcast.
       */
      async function sponsor(parameters: {
        account: ReturnType<typeof toAccount>
        accountChanges?: readonly AaAccountChange[]
        calls?: readonly AaCall[]
      }) {
        const cosigned = await sendSponsoredCalls(client, {
          account: parameters.account,
          payerClient: payer,
          mode: 'sign',
          accountChanges: parameters.accountChanges,
          calls: parameters.calls ?? [],
          // Payer estimates from `calls` only; floor covers account-change application.
          gas: 2_000_000n,
          context: { flow: 'transact' },
        })
        const finalTx =
          'signedTransaction' in cosigned
            ? cosigned.signedTransaction
            : (cosigned as Hex)
        const hash = await bclient.request({
          method: 'eth_sendRawTransaction',
          params: [finalTx],
        })
        const receipt = await waitForTransactionReceipt(client, { hash })
        return { hash, receipt }
      }

      const readSeq = () =>
        getConfigSequence(client, {
          accountConfiguration,
          account: account.address,
        })
      const readIsActor = (actorId: Hex) =>
        isActor(client, {
          account: account.address,
          actorId,
          accountConfiguration,
        })

      /** Poll a read-back predicate to defeat recall/state lag (~1 block). */
      async function pollUntil<T>(
        fn: () => Promise<T | null | undefined | false>,
        { tries = 20, delay = 1500 } = {},
      ): Promise<T | null | undefined | false> {
        let last: T | null | undefined | false
        for (let i = 0; i < tries; i++) {
          last = await fn()
          if (last) return last
          await sleep(delay)
        }
        return last
      }

      let ok = true
      function report(name: string, pass: boolean, extra = '') {
        if (!pass) ok = false
        console.log(
          `${pass ? 'PASS' : 'FAIL'}  ${name}${extra ? ` :: ${extra}` : ''}`,
        )
      }

      // --- actors ---------------------------------------------------------
      const owner = privateKeyToAccount(generatePrivateKey())
      const account = toAccount({
        signer: owner,
        userSalt: generatePrivateKey(),
        code: upgradeableProxyBytecode(deployment.accounts.default),
        initialActors: [key.k1(owner.address)],
        authenticator: canonicalAuthenticators.k1,
        accountConfigAddress: accountConfiguration,
        // Owner is admin (scope 0) and not yet on-chain at create time, so prepare
        // cannot read scope from getActorConfig — declare admin here once. After
        // create, prepare prefers on-chain scope when the actor is bound.
        scope: scopeUnrestricted,
      })
      console.log('owner:  ', owner.address)
      console.log('account:', account.address, '\n')

      // Session key (a k1 EOA so we can sign its execute tx) + its policy.
      const sessionSigner = privateKeyToAccount(generatePrivateKey())
      const sessionActor = key.k1(sessionSigner.address)
      const managerActor = key.trustedExecutor(policies.manager)

      // ── Session-key scope (declared ONCE — at authorize) ────────────────
      // POLICY | NONCE → sequenced nonces via getTransactionCount.
      // Do NOT also pass this scope into toAccount for the session handle —
      // prepare reads getActorConfig and selects nonce mode from chain truth.
      const SESSION_SELF_PAY = false
      const SESSION_USE_NONCE = true
      const sessionScope =
        actorScope.policy |
        (SESSION_USE_NONCE ? actorScope.nonce : 0) |
        (SESSION_SELF_PAY ? actorScope.selfPayer : 0)

      const policyConfig = encodeSessionPolicyConfig({
        tokenLimits: [],
        callScopes: [
          { target: COUNTER, selectorRules: [{ selector: INCREMENT }] },
        ],
      })
      const expiry = now() + 86_400n
      const session = defineSessionPolicy({
        account: account.address,
        policy: policies.sessionPolicy,
        policyConfig,
        manager: policies.manager,
        validUntil: expiry,
      })

      // =====================================================================
      // STEP 1 — create the smart account (sponsored). `create` bumps local -> 1.
      // =====================================================================
      console.log('── STEP 1: create smart account ──')
      try {
        const { hash, receipt } = await sponsor({
          account,
          accountChanges: [account.create()],
          calls: [{ to: account.address, data: '0x' }],
        })
        console.log(
          'tx:',
          hash,
          '| status:',
          receipt.status,
          '| allPhases:',
          allPhasesSucceeded(receipt.eip8130),
        )
        const seq = await pollUntil(async () => {
          const s = await readSeq()
          return s.local >= 1n ? s : null
        })
        const local =
          seq && typeof seq === 'object' && 'local' in seq ? seq.local : 0n
        report(
          'account created (local sequence bumped to 1)',
          local >= 1n,
          `local=${local}`,
        )
      } catch (e) {
        report('create', false, (e as Error)?.message ?? String(e))
      }

      // =====================================================================
      // STEP 2 — register PolicyManager (trusted-executor) + session key (policy)
      // in ONE config change, LOCAL channel, at the LIVE sequence.
      // =====================================================================
      console.log('\n── STEP 2: register PolicyManager + session key ──')
      try {
        const live = await readSeq() // read live local counter — never guess
        const configChanges = [
          authorizeActor(managerActor, { scope: actorScope.sender }),
          authorizeActor(sessionActor, {
            scope: sessionScope,
            expiry,
            policy: session.actorPolicy,
          }),
        ]
        const authChange = await account.change(configChanges, {
          chainId, // LOCAL channel
          sequence: Number(live.local),
        })
        const { hash, receipt } = await sponsor({
          account,
          accountChanges: [authChange],
          calls: [{ to: account.address, data: '0x' }],
        })
        console.log(
          'tx:',
          hash,
          '| status:',
          receipt.status,
          '| allPhases:',
          allPhasesSucceeded(receipt.eip8130),
          '| receipt.logs:',
          Array.isArray(receipt.logs) ? receipt.logs.length : 0,
        )
        console.log(
          '  NOTE: receipt.logs is 0 even on success — ActorAuthorized is not a',
          '\n  normal EVM log here. Verify via read-back, not logs.',
        )

        const mgrBound = await pollUntil(async () =>
          (await readIsActor(managerActor.actorId)) ? true : null,
        )
        report('PolicyManager bound as trusted-executor actor', mgrBound === true)

        const skBound = await pollUntil(async () =>
          (await readIsActor(sessionActor.actorId)) ? true : null,
        )
        report('session key bound as actor', skBound === true)

        if (skBound) {
          const cfg = await getActorConfig(client, {
            account: account.address,
            actorId: sessionActor.actorId,
            accountConfiguration,
          })
          report(
            'session key scope is POLICY | NONCE (sequenced)',
            cfg.hasPolicy === true && (cfg.scope & actorScope.nonce) !== 0,
            `scope=0x${cfg.scope.toString(16)}`,
          )
        } else {
          console.log(
            '  ↳ If this ever FAILS: the authorize was skipped fail-closed. The tx',
            '\n    still reports success with no failed phase — check the signed',
            '\n    sequence against the LIVE on-chain counter for this channel.',
          )
        }
      } catch (e) {
        report(
          'register manager + session key',
          false,
          (e as Error)?.message ?? String(e),
        )
      }

      // =====================================================================
      // STEP 3 — use the session key: execute the ONE permitted policy-gated call.
      // =====================================================================
      console.log(
        '\n── STEP 3: use the session key (Counter.increment via PolicyManager) ──',
      )
      try {
        const readCount = async () =>
          hexToBigInt(
            await client.request({
              method: 'eth_call',
              params: [{ to: COUNTER, data: COUNT }, 'latest'],
            }),
          )
        const before = await readCount()

        // Signer + address only — no redeclared `scope`. prepare reads on-chain
        // getActorConfig (POLICY|NONCE) and fills nonceKey=0 + nonceSequence
        // via getTransactionCount.
        const sessionAccount = toAccount({
          signer: sessionSigner,
          address: account.address,
          authenticator: canonicalAuthenticators.k1,
          accountConfigAddress: accountConfiguration,
        })
        const executeCall = session.executeCall({
          target: COUNTER,
          value: 0n,
          data: INCREMENT,
        })

        const { hash, receipt } = await sponsor({
          account: sessionAccount,
          calls: [executeCall],
        })
        console.log(
          'tx:',
          hash,
          '| status:',
          receipt.status,
          '| allPhases:',
          allPhasesSucceeded(receipt.eip8130),
          '| phaseStatuses:',
          JSON.stringify(receipt.eip8130.phaseStatuses),
        )
        report(
          'session-key execute landed (all call phases succeeded)',
          allPhasesSucceeded(receipt.eip8130),
        )

        const bumped = await pollUntil(async () => {
          const c = await readCount()
          return c === before + 1n ? c : null
        })
        report(
          'Counter.increment ran via the session key',
          bumped === before + 1n,
          `count ${before} -> ${bumped ?? '?'}`,
        )
      } catch (e) {
        report(
          'session-key execute send',
          false,
          (e as Error)?.message ?? String(e),
        )
      }

      console.log('')
      expect(ok, 'one or more policy-smoke checks failed — see PASS/FAIL above').toBe(
        true,
      )
    },
    180_000,
  )
})
