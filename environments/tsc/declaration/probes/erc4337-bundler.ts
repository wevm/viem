import { BundlerClient, http } from 'viem/erc4337'

export const bundlerClient = BundlerClient.create({
  transport: http('https://bundler.example'),
})
