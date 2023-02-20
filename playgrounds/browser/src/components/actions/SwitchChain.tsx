import type { WalletClient } from 'viem'
import { mainnet } from 'viem/chains'

export function SwitchChain({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          await client.switchChain(mainnet)
        }}
      >
        switch chain
      </button>
    </div>
  )
}
