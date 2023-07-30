---
"viem": minor
---

**Type Change**: `TIncludeTransactions` & `TBlockTag` has been added to slot 1 & 2 of the `Block` generics.

```diff
type Block<
  TQuantity = bigint,
+ TIncludeTransactions extends boolean = boolean,
+ TBlockTag extends BlockTag = BlockTag,
  TTransaction = Transaction<
    bigint,
    number,
    TBlockTag extends 'pending' ? true : false
  >,
>
```
