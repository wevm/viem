---
head:
  - - meta
    - property: og:title
      content: getPermissions
  - - meta
    - name: description
      content: Gets the wallets current permissions.
  - - meta
    - property: og:description
      content: Gets the wallets current permissions.

---

# getPermissions

Gets the wallets current permissions.

## Usage

```ts
import { walletClient } from '.'
 
const permissions = await walletClient.getPermissions() // [!code focus:99]
```

## Returns

[`WalletPermission[]`](/docs/glossary/types#walletpermission)

The wallet permissions.

