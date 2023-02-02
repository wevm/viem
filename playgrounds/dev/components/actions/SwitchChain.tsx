import type { WalletClient } from 'viem'
import { mainnet } from 'viem/chains'
import { switchChain } from 'viem/wallet'

export function SwitchChain({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          await switchChain(client, mainnet)
        }}
      >
        switch chain
      </button>
    </div>
  )
}
