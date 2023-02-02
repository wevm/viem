import type { WalletClient } from 'viem'
import { getPermissions } from 'viem/wallet'

export function GetPermissions({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          console.log(await getPermissions(client))
        }}
      >
        get permissions
      </button>
    </div>
  )
}
