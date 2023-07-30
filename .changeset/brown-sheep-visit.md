---
"viem": minor
---

**Type Change**: `TPending` has been added to slot 2 of the `Log` generics.

```diff
type Log<
  TQuantity = bigint,
  TIndex = number,
+ TPending extends boolean = boolean,
  TAbiEvent extends AbiEvent | undefined = undefined,
  TStrict extends boolean | undefined = undefined,
  TAbi extends Abi | readonly unknown[] = [TAbiEvent],
  TEventName extends string | undefined = TAbiEvent extends AbiEvent
    ? TAbiEvent['name']
    : undefined,
>
```
