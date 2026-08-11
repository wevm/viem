import { describe, expect, test } from 'vitest'
import { entryPoint07Abi } from '../../src/account-abstraction/constants/abis.js'
import { entryPoint07Address } from '../../src/account-abstraction/constants/address.js'
import { getUserOperationHash } from '../../src/account-abstraction/utils/userOperation/getUserOperationHash.js'
import { toPackedUserOperation } from '../../src/account-abstraction/utils/userOperation/toPackedUserOperation.js'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { estimateFeesPerGas } from '../../src/actions/public/estimateFeesPerGas.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { readContract } from '../../src/actions/public/readContract.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { writeContract } from '../../src/actions/wallet/writeContract.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { accountConfigurationAbi } from '../../src/eip8130/abis.js'
import { toSmartAccount } from '../../src/eip8130/accounts/toSmartAccount.js'
import {
  actorScope,
  ecrecoverAuthenticator,
} from '../../src/eip8130/constants.js'
import { getEip8130Deployment } from '../../src/eip8130/deployments.js'
import { authorizeActor, key } from '../../src/eip8130/keys.js'
import { actorIdFromPublicKey } from '../../src/eip8130/utils/actorId.js'
import { signActorChanges } from '../../src/eip8130/utils/signActorChanges.js'
import { encodeSignedActorChangesSignature } from '../../src/eip8130/utils/signedActorChangesSignature.js'
import { concatHex } from '../../src/utils/data/concat.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'

// P-256 generator point (Gx, Gy) — a valid, well-known public key used purely
// to prove the actor is registered onchain during validateUserOp. The op is
// authorized by the k1 owner signing the actor change, not by this key.
const p256PubKey = {
  x: '0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296',
  y: '0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5',
} as const

describe.runIf(PRIVATE_KEY)(
  'self-bundle: create + rotate to P-256 in validation phase + execute',
  () => {
    test('create, authorize a P-256 actor during validateUserOp, and execute — single userOp (no staking)', async () => {
      const owner = privateKeyToAccount(PRIVATE_KEY!)
      const client = createClient({
        account: owner,
        chain: baseSepolia,
        transport: http(RPC_URL),
      })
      const deployment = getEip8130Deployment(baseSepolia.id)!

      const userSalt = keccak256(stringToHex(`viem-8130-rotate-${Date.now()}`))
        const account = await toSmartAccount({
          client,
          owner,
          userSalt,
          initialActors: [key.k1(owner.address)],
          implementation: deployment.accounts.erc4337,
          accountConfigAddress: deployment.accountConfiguration,
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

      // Compute the userOpHash so we can produce opAuth before finalizing the signature.
      const userOpHash = getUserOperationHash({
        chainId: baseSepolia.id,
        entryPointAddress: entryPoint07Address,
        entryPointVersion: '0.7',
        userOperation: { ...userOperation, sender: account.address },
      })

      // Current k1 owner authorizes the new P-256 actor. createAccount() sets
      // localSequence = 1 (as the initialized flag), so the first
      // applySignedActorChanges call on a fresh account must sign over sequence 1.
      const set = await signActorChanges({
        signer: owner,
        account: account.address,
        chainId: baseSepolia.id,
        sequence: 1,
        actorChanges: [authorizeActor(p256Actor, { scope: actorScope.sender })],
      })

      // opAuth: k1 owner signs the userOpHash in authenticator || data format.
      // The owner is the initial actor so this always passes. A rotate-only op
      // could use the newly added P-256 key here instead.
      const opAuth = concatHex([
        ecrecoverAuthenticator,
        await owner.sign({ hash: userOpHash }),
      ])
      const signature = encodeSignedActorChangesSignature([set], opAuth)

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
