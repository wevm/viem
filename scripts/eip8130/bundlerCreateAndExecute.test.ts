import { describe, expect, test } from 'vitest'
import { privateKeyToAccount } from '../../src/accounts/privateKeyToAccount.js'
import { createBundlerClient } from '../../src/account-abstraction/clients/createBundlerClient.js'
import { estimateFeesPerGas } from '../../src/actions/public/estimateFeesPerGas.js'
import { getBalance } from '../../src/actions/public/getBalance.js'
import { getCode } from '../../src/actions/public/getCode.js'
import { waitForTransactionReceipt } from '../../src/actions/public/waitForTransactionReceipt.js'
import { sendTransaction } from '../../src/actions/wallet/sendTransaction.js'
import { baseSepolia } from '../../src/chains/index.js'
import { createClient } from '../../src/clients/createClient.js'
import { http } from '../../src/clients/transports/http.js'
import { parseEther } from '../../src/utils/unit/parseEther.js'
import { stringToHex } from '../../src/utils/encoding/toHex.js'
import { keccak256 } from '../../src/utils/hash/keccak256.js'
import { toSmartAccount } from '../../src/eip8130/accounts/toSmartAccount.js'
import { getEip8130Deployment } from '../../src/eip8130/deployments.js'
import { key } from '../../src/eip8130/keys.js'

const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined
const RPC_URL = process.env.BASE_SEPOLIA_RPC ?? 'https://sepolia.base.org'
const BUNDLER_URL =
  process.env.BUNDLER_URL ??
  'https://api.developer.coinbase.com/rpc/v1/base-sepolia/7YlYO9viupy6QeNdPG4bzerRepbnoPQT'

describe.runIf(PRIVATE_KEY)(
  'bundler: create EIP-8130 account + execute in a single user op',
  () => {
    test(
      'AccountConfiguration is the factory; deploy + action in one userOp',
      async () => {
        const owner = privateKeyToAccount(PRIVATE_KEY!)
        const client = createClient({
          account: owner,
          chain: baseSepolia,
          transport: http(RPC_URL),
        })
        const bundlerClient = createBundlerClient({
          client,
          transport: http(BUNDLER_URL),
        })
        const deployment = getEip8130Deployment(baseSepolia.id)!

        // Fresh salt so the account is purely counterfactual (not pre-created).
        const userSalt = keccak256(stringToHex(`viem-8130-bundler-${Date.now()}`))
        const account = await toSmartAccount({
          client,
          owner,
          userSalt,
          initialActors: [key.k1(owner.address)],
          implementation: deployment.accounts.erc4337,
        })

        console.log('\n— bundler create + execute (Base Sepolia) —')
        console.log('owner (EOA):     ', owner.address)
        console.log('smart account:   ', account.address)
        console.log('factory (config):', deployment.accountConfiguration)

        const codeBefore = await getCode(client, { address: account.address })
        expect(codeBefore ?? '0x').toBe('0x')

        // Prefund the counterfactual sender so the EntryPoint can pull its prefund.
        const fundHash = await sendTransaction(client, {
          account: owner,
          to: account.address,
          value: parseEther('0.01'),
          chain: baseSepolia,
        })
        await waitForTransactionReceipt(client, { hash: fundHash })
        console.log('funded sender:   ', '0.01 ETH')

        // CDP validates signatures during eth_estimateUserOperationGas, which a
        // counterfactual account cannot satisfy with a stub. Provide explicit gas
        // limits so viem skips estimation and submits with the real signature.
        const fees = await estimateFeesPerGas(client)
        const ownerBalanceBefore = await getBalance(client, {
          address: owner.address,
        })
        const userOpHash = await bundlerClient.sendUserOperation({
          account,
          calls: [{ to: owner.address, value: 1n }],
          callGasLimit: 500_000n,
          verificationGasLimit: 1_500_000n,
          preVerificationGas: 500_000n,
          maxFeePerGas: fees.maxFeePerGas,
          maxPriorityFeePerGas: fees.maxPriorityFeePerGas,
        })
        console.log('userOp:          ', userOpHash)

        const receipt = await bundlerClient.waitForUserOperationReceipt({
          hash: userOpHash,
        })
        console.log(
          'tx:              ',
          `https://sepolia.basescan.org/tx/${receipt.receipt.transactionHash}`,
        )
        console.log('success:         ', receipt.success)
        expect(receipt.success).toBe(true)

        // Account is now deployed and the action ran (1 wei returned to owner).
        const codeAfter = await getCode(client, { address: account.address })
        expect(codeAfter && codeAfter !== '0x').toBeTruthy()
        const ownerBalanceAfter = await getBalance(client, {
          address: owner.address,
        })
        // owner received 1 wei from the account's executeBatch (net of gas it paid
        // to fund — we only assert the account executed by checking it deployed).
        console.log(
          'owner +1 wei?    ',
          ownerBalanceAfter > ownerBalanceBefore - parseEther('0.001'),
        )
      },
      180_000,
    )
  },
)
