---
head:
  - - meta
    - property: og:title
      content: stopImpersonatingAccount
  - - meta
    - name: description
      content: Stop impersonating an account after having previously used `impersonateAccount`.
  - - meta
    - property: og:description
      content: Stop impersonating an account after having previously used `impersonateAccount`.

---

# stopImpersonatingAccount

Stop impersonating an account after having previously used [`impersonateAccount`](/docs/actions/test/impersonateAccount).

## Usage

```ts
import { testClient } from '.'
 
await testClient.stopImpersonatingAccount({ // [!code focus:4]
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC'
})
```

## Parameters

### address

- **Type:** [`Address`](/docs/glossary/types#address)

The address of the target account.

```ts
await testClient.stopImpersonatingAccount({
  address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC', // [!code focus]
})
```
