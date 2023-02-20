import type { WalletClient } from 'viem'

export function GetPermissions({ client }: { client: WalletClient }) {
  return (
    <div>
      <button
        onClick={async () => {
          console.log(await client.getPermissions())
        }}
      >
        get permissions
      </button>
    </div>
  )
}
