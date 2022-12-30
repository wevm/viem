import { switchChain } from 'viem/actions'
import type { WalletClient } from 'viem/clients'
import { mainnet } from 'viem/chains'

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
