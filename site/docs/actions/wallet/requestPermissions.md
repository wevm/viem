---
head:
  - - meta
    - property: og:title
      content: requestPermissions
  - - meta
    - name: description
      content: Requests permissions for a wallet.
  - - meta
    - property: og:description
      content: Requests permissions for a wallet.

---

# requestPermissions

Requests permissions for a wallet.

## Usage

```ts
import { walletClient } from '.'
 
const permissions = await walletClient.requestPermissions({ eth_accounts: {} }) // [!code focus:99]
```

## Returns

[`WalletPermission[]`](/docs/glossary/types#walletpermission)

The wallet permissions.


