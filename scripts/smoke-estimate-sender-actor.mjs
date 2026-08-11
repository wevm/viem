/**
 * Live smoke: estimateGas with/without senderActorId against vibenet.
 *
 * Proves the node (#3892) + viem hint path for policy-gated session keys.
 *
 *   node --experimental-vm-modules scripts/smoke-estimate-sender-actor.mjs
 *   # or: bun scripts/smoke-estimate-sender-actor.mjs
 */
import { createPublicClient, http, parseEther, zeroAddress } from '../src/index.ts'
import { privateKeyToAccount } from '../src/accounts/privateKeyToAccount.ts'
import { toP256Signer } from '../src/eip8130/utils/signers.ts'
import { toAccount } from '../src/eip8130/accounts/toAccount.ts'
import { estimateGas } from '../src/eip8130/actions/estimateGas.ts'
import {
  authorizeActor,
  key,
} from '../src/eip8130/keys.ts'
import { actorScope, canonicalAuthenticators } from '../src/eip8130/constants.ts'
import {
  defineSessionPolicy,
  encodeSessionPolicyAction,
  encodeSessionPolicyConfig,
} from '../src/eip8130/policies.ts'
import { erc1167Bytecode } from '../src/eip8130/utils/proxy.ts'
import * as P256 from 'ox/P256'

const RPC = process.env.VIBENET_RPC ?? 'https://rpc.vibes.base.org'
const ACCOUNT_CONFIG = '0x2403408177dB7F8512a9593343a7C80371D8f2dF'
const DEFAULT_ACCOUNT = '0xaF0973bbebe12BDaE6B61c96019dc0DcA554b67c'
const POLICY_MANAGER = '0x5E5c3D54078d1000309233fEc116A83Df5a07E67'
const SESSION_POLICY = '0xbd26BdA18Ee35F767ef03fD72356ae598ed6f793'

const client = createPublicClient({ transport: http(RPC) })

const owner = privateKeyToAccount(
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80',
)
const p256 = toP256Signer({ privateKey: P256.randomPrivateKey() })
const sessionActor = key.p256(p256.publicKey)

const userSalt =
  '0x00000000000000000000000000000000000000000000000000000000000000a1'
const initialActors = [
  key.k1(owner.address),
  key.trustedExecutor(POLICY_MANAGER),
].sort((a, b) => (a.actorId < b.actorId ? -1 : a.actorId > b.actorId ? 1 : 0))

const account = toAccount({
  signer: owner,
  userSalt,
  code: erc1167Bytecode(DEFAULT_ACCOUNT),
  initialActors,
  accountConfigAddress: ACCOUNT_CONFIG,
})
const createChange = account.create()

const session = defineSessionPolicy({
  account: account.address,
  manager: POLICY_MANAGER,
  policy: SESSION_POLICY,
  policyConfig: encodeSessionPolicyConfig({
    tokenLimits: [
      { token: zeroAddress, limit: parseEther('1'), period: 0n },
    ],
    callScopes: [{ target: account.address }],
  }),
})

const authChange = await account.change(
  [
    authorizeActor(sessionActor, {
      scope: actorScope.sender,
      policy: session.actorPolicy,
    }),
  ],
  { chainId: Number(await client.getChainId()), sequence: 1 },
)

const install = session.installCall(sessionActor.actorId)
const spend = session.executeCall(
  encodeSessionPolicyAction({
    target: account.address,
    value: 0n,
    data: '0x',
  }),
)

const baseParams = {
  sender: account.address,
  accountChanges: [createChange, authChange],
  calls: [[install], [spend]],
  nonceSequence: 0,
  senderAuthVerifier: canonicalAuthenticators.p256,
}

console.log('rpc', RPC)
console.log('account', account.address)
console.log('sessionActorId', sessionActor.actorId)
console.log('chainId', await client.getChainId())

async function tryEstimate(label, params) {
  try {
    const gas = await estimateGas(client, params)
    console.log(`OK  ${label}: gas=${gas}`)
    return { ok: true, gas }
  } catch (err) {
    const msg = err?.shortMessage ?? err?.message ?? String(err)
    const details = err?.details ?? ''
    console.log(`FAIL ${label}: ${msg}${details ? ` | ${details}` : ''}`)
    return { ok: false, err }
  }
}

// Owner create-only estimate (sanity — self actor, no session).
await tryEstimate('owner create+noop', {
  sender: account.address,
  accountChanges: [createChange],
  calls: [[{ to: account.address, value: 0n, data: '0x' }]],
  nonceSequence: 0,
  senderAuthVerifier: canonicalAuthenticators.k1,
})

// Session-key estimate WITHOUT actor hint — historically NoActivePolicy.
const without = await tryEstimate('session WITHOUT senderActorId', baseParams)

// Session-key estimate WITH actor hint — should succeed after #3892.
const withHint = await tryEstimate('session WITH senderActorId', {
  ...baseParams,
  senderActorId: sessionActor.actorId,
})

if (!withHint.ok) {
  console.error('\nSMOKE FAILED: senderActorId estimate still throws')
  process.exit(1)
}
if (without.ok) {
  console.log(
    '\nNOTE: estimate without senderActorId also succeeded (self-actor path may not hit policy gate for this shape).',
  )
} else {
  console.log(
    '\nExpected: without hint fails, with hint succeeds — confirms the fix.',
  )
}
console.log('\nSMOKE PASSED')
