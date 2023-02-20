import type { WalletClient } from 'viem'

export function RequestPermissions({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          console.log(await client.requestPermissions({ eth_accounts: {} }))
        }}
      >
        request permissions
      </button>
    </div>
  )
}
