---
"viem": patch
---

Fixed `encodeEventTopics` not handling anonymous events. Anonymous events do not include the event signature as the first topic, but `encodeEventTopics` was prepending it unconditionally. The return type has also been loosened from `[Hex, ...(Hex | Hex[] | null)[]]` to `(Hex | Hex[] | null)[]` to reflect that anonymous events can return an empty array.
