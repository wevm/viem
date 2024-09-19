import { http, type Hex, createPublicClient, parseEther } from 'viem'
import {
  createBundlerClient,
  createPaymasterClient,
  toCoinbaseSmartAccount,
} from 'viem/account-abstraction'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'

const client = createPublicClient({
  chain: sepolia,
  transport: http(),
})

const owner = privateKeyToAccount(import.meta.env.VITE_PRIVATE_KEY as Hex)

const account = await toCoinbaseSmartAccount({
  client,
  owners: [owner],
})

const paymasterClient = createPaymasterClient({
  transport: http(
    'https://paymaster.biconomy.io/api/v1/11155111/kxBB8jbLI.fb3e07cf-c4cd-4d20-8503-c396e405b0df',
  ),
})

const bundlerClient = createBundlerClient({
  account,
  client,
  transport: http(
    'https://bundler.biconomy.io/api/v2/11155111/kxBB8jbLI.fb3e07cf-c4cd-4d20-8503-c396e405b0df',
  ),
  paymaster: paymasterClient,
  paymasterContext: {
    mode: 'SPONSORED',
    calculateGasLimits: true,
    expiryDuration: 300,
    sponsorshipInfo: {
      webhookData: {},
      smartAccountInfo: {
        name: 'BICONOMY',
        version: '2.0.0',
      },
    },
  },
})

const hash = await bundlerClient.sendUserOperation({
  calls: [
    // send 0.000001 ETH to self
    {
      to: account.address,
      value: parseEther('0.000001'),
    },
  ],
})

export default [`User Operation Hash: ${hash}`]
