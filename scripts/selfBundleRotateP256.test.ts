import { describe, expect, test } from 'vitest'
import { entryPoint07Abi } from '../src/account-abstraction/constants/abis.js'
import { entryPoint07Address } from '../src/account-abstraction/constants/address.js'
import { toPackedUserOperation } from '../src/account-abstraction/utils/userOperation/toPackedUserOperation.js'
import { privateKeyToAccount } from '../src/accounts/privateKeyToAccount.js'
import { estimateFeesPerGas } from '../src/actions/public/estimateFeesPerGas.js'
import { getCode } from '../src/actions/public/getCode.js'
import { readContract } from '../src/actions/public/readContract.js'
import { waitForTransactionReceipt } from '../src/actions/public/waitForTransactionReceipt.js'
import { writeContract } from '../src/actions/wallet/writeContract.js'
import { baseSepolia } from '../src/chains/index.js'
import { createClient } from '../src/clients/createClient.js'
import { http } from '../src/clients/transports/http.js'
import { accountConfigurationAbi } from '../src/experimental/eip8130/abis.js'
import { toSmartAccount8130 } from '../src/experimental/eip8130/accounts/toSmartAccount8130.js'
import { actorScope } from '../src/experimental/eip8130/constants.js'
import { getEip8130Deployment } from '../src/experimental/eip8130/deployments.js'
import { authorizeActor, key } from '../src/experimental/eip8130/keys.js'
import { actorIdFromPublicKey } from '../src/experimental/eip8130/utils/actorId.js'
import { signActorChanges8130 } from '../src/experimental/eip8130/utils/signActorChanges.js'
import { encodeSignedActorChangesSignature } from '../src/experimental/eip8130/utils/signedActorChangesSignature.js'
import { stringToHex } from '../src/utils/encoding/toHex.js'
import { keccak256 } from '../src/utils/hash/keccak256.js'
import { parseEther } from '../src/utils/unit/parseEther.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'

// A fixed P-256 public key. The op is *not* signed by this key (opAuth was
// dropped) — the current k1 owner authorizes it — so any well-formed (x, y) is
// sufficient to prove the actor is added during validation.
const p256PubKey = {
  x: '0x1c1bc89a2b4f5d2e6a7b8c9d0e1f2a3b4c5d6e7f8091a2b3c4d5e6f7081929394',
  y: '0x9495969798999a9b9c9d9e9fa0a1a2a3a4a5a6a7a8a9aaabacadaeafb0b1b2b3',
} as const

describe.runIf(PRIVATE_KEY)(
  'self-bundle: create + rotate to P-256 in validation phase + execute',
  () => {
    test('create, authorize a P-256 actor during validateUserOp, and execute — single userOp (no staking, no opAuth)', async () => {
      const owner = privateKeyToAccount(PRIVATE_KEY!)
      const client = createClient({
        account: owner,
        chain: baseSepolia,
        transport: http(RPC_URL),
      })
      const deployment = getEip8130Deployment(baseSepolia.id)!

      const userSalt = keccak256(stringToHex(`viem-8130-rotate-${Date.now()}`))
      const account = await toSmartAccount8130({
        client,
        owner,
        userSalt,
        initialActors: [key.k1(owner.address)],
        implementation: deployment.accounts.erc4337,
      })

      const p256Actor = key.p256(p256PubKey)
      const p256ActorId = actorIdFromPublicKey(p256PubKey)

      console.log('\n— self-bundled create + rotate-to-P256 (Base Sepolia) —')
      console.log('owner / bundler: ', owner.address)
      console.log('smart account:   ', account.address)
      console.log('factory (config):', deployment.accountConfiguration)
      console.log('new p256 actorId:', p256ActorId)

      const codeBefore = await getCode(client, { address: account.address })
      expect(codeBefore ?? '0x').toBe('0x')

      // Current k1 owner authorizes the new P-256 actor. The account is created
      // by the factory phase of this same op, so the local sequence starts at 0.
      const set = await signActorChanges8130({
        signer: owner,
        account: account.address,
        chainId: baseSepolia.id,
        sequence: 0,
        actorChanges: [authorizeActor(p256Actor, { scope: actorScope.sender })],
      })
      // Applying this signed change authorizes the op — there is no opAuth.
      const signature = encodeSignedActorChangesSignature([set])

      // Pre-fund the account's EntryPoint deposit so missingAccountFunds = 0.
      const depositHash = await writeContract(client, {
        abi: entryPoint07Abi,
        address: entryPoint07Address,
        functionName: 'depositTo',
        args: [account.address],
        value: parseEther('0.003'),
        account: owner,
        chain: baseSepolia,
      })
      await waitForTransactionReceipt(client, { hash: depositHash })

      const { factory, factoryData } = await account.getFactoryArgs()
      const callData = await account.encodeCalls([
        { to: owner.address, value: 0n, data: '0x' },
      ])
      const nonce = await readContract(client, {
        abi: entryPoint07Abi,
        address: entryPoint07Address,
        functionName: 'getNonce',
        args: [account.address, 0n],
      })
      const fees = await estimateFeesPerGas(client)

      const userOperation = {
        sender: account.address,
        nonce,
        factory,
        factoryData,
        callData,
        callGasLimit: 200_000n,
        verificationGasLimit: 1_500_000n,
        preVerificationGas: 100_000n,
        maxFeePerGas: fees.maxFeePerGas,
        maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
      } as const

      // The signature is the validation-phase actor-changes blob (not an op auth).
      const packed = toPackedUserOperation({ ...userOperation, signature })

      const hash = await writeContract(client, {
        abi: entryPoint07Abi,
        address: entryPoint07Address,
        functionName: 'handleOps',
        args: [[packed], owner.address],
        account: owner,
        chain: baseSepolia,
        gas: 2_500_000n,
      })
      const receipt = await waitForTransactionReceipt(client, { hash })
      console.log(
        'tx:              ',
        `https://sepolia.basescan.org/tx/${receipt.transactionHash}`,
      )
      console.log('status:          ', receipt.status)
      expect(receipt.status).toBe('success')

      // Public RPCs are load-balanced; poll to avoid reading a lagging replica.
      let deployed = false
      let isP256Actor = false
      for (let i = 0; i < 10; i++) {
        const code = await getCode(client, { address: account.address })
        deployed = !!(code && code !== '0x')
        if (deployed) {
          isP256Actor = await readContract(client, {
            abi: accountConfigurationAbi,
            address: deployment.accountConfiguration,
            functionName: 'isActor',
            args: [account.address, p256ActorId],
          })
        }
        if (deployed && isP256Actor) break
        await new Promise((r) => setTimeout(r, 1500))
      }

      console.log('account deployed:', deployed)
      console.log('p256 is actor:   ', isP256Actor)
      expect(deployed).toBeTruthy()
      expect(isP256Actor).toBeTruthy()
    }, 180_000)
  },
)
