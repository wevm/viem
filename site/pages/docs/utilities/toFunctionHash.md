---
description: Returns the hash (of the function signature) for a given function definition.
---

# toFunctionHash

Returns the hash (of the function signature) for a given function definition.

## Install

```ts
import { toFunctionHash } from 'viem'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"b47184c240e511c6a3762b82c993df452c447f16384c17b76b4ba9a7880a42d6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvNBABiwsRLAAJLvkb8wiXnDSl2YAOa8APrwCCAI3bzR4yaYvWAoiTBpu2gAYAGWgBJgXX0jAF8vAB0wdgBbLAhSNGk5BXsVNUoQKAgRBEQQACUYNEFSMDhpfBhefDVeRgh+SuqhOyUAehg3JLh2QzBmEtIYPn4E3mZeQ3Y3Xi6Yd15x1sUHWH4DdjSAOkzdZkSkAE4qVgXDNHwkAEYAFio0A8NivBlbVfS4K9ODXEQfKgiWqkZhiMjHUIUdDYP4EYjgh50Bj5ESSXQ1NQAfWu3j8gWCBkM4T2j0OiFuAFZTudLkgAGwPJ4vfK1L7YzIcMB/ABMgOBoJo5EQdMh0JweEIJHIiPoTDYnB4yXeaVUXw0Wh0ekJjisNlSSh1Lm6nl4vgCQS1YUi0TiCSSb31klV3yyOTyhWKpXKzQxX3qjR9KzSnW6Oj6AyGIwE40m01m80Wy0dUnWmx2JIOyIp9xAZyMtMQd0ZpGeyOoKTaToyPy5SF5ICBBwF4MLFNF1Bhr2YhkyAxisNYEB7VH2ZKOAA5qfmrv8ZWWAPKCNBYJfaPxQKD8bkU7nMKDXSwwbkicdHSx0o4ibmWHx08f8EQAZgA7OOoMxmEcd5ZmM/+Nc6UfERbmYa4AO5e8KQpZhbk3HdH0sR8YH4DlfiQR8+SbMEhR8dtMHFFl4WlagkTwVFyiSVl8ExblcXNAkrQzMlrgpa4pwuGcGWoJkyyomjUNrRAqQbflsPpPDO0IqVMhoWV8hYDguD4B1K0+dRNG0BjjDMXVlQNHSjQWDw6PxS0iWtWJ4kSJVk2dTJslyPAiiGb1LmqKj/SaNyBGTEMjLDfpBlKKMxlICYphmBY5lDJNVN4VNonTEdSWRACAVzGkZyLbiS2Zcs9KrL4BL+YTGxBMTWwkgi4WkucmCwUgIBwRIMD4PsYE0symNS58Tgy6ckBzUlSzwdrivpTDysFOsqthSUERIuSQEYBqmrITBlJhbQIhAIMlB27qbgndiCyGnjXk7Gs/mfSbmyFblZolIiZNI+TVuajbeAMFc0DgbRhj3SRWAwJx2AABSbftBWQABdQ7EG5a5J36jiJpykb8m+pcECupBkbKu6ZqhDtqvm4jZLLFbGo+1reHazqQmHEBR2RbluT6vNUfJYsMfAZh+3GxB8dE6bC0fR6pIWin6up9bafwjreB2wQDDQbc6QO5LMzrW4uM506ebyhXBeFrDRcfXDieNyXyde5b3rlvgICXH6/t4AHsjAYHQYhkEobIWH4e5O8TpnG70by53l2xwW+oJiqHqtySaqlu2qbWlq+H2GgAFkl2YawOEwbRdQAZUeXP88LrYMCD8cMJRgsWMNsts5gPPHmrzBBeudL49FxOxVhR4mbG/JByZln0LA0OkHS6X8kXaO0DXWgNy3Hc9wPI8TzPC8rxvO8HxfN8Py/a9f3/QDgNA8DIOg2D+HgxDkJ7hv+5bXCYcBaBYUsu1eDABsqpZ0vBQgCEajEXgAByIg7AYAxGgVEKI5F0R8WuLwAAvMAj4zpGDQL2g4CAAB3LkpB5z8EYCrdw6tuDQO4MgsA7R2hLDCvwSBEwpBeF1K4IyXglhSAwM7MK5E9ACgsAAIQAJIoLRJRLE3IsE4JVGoRgwAoi8DpvzRW0CSFkIodAigGjpBbRgYQsAhjjFY1+toVAWj+zaGgTIAA1gsKRUBDEmJwI46hasKR0mgWA7+xio6u1scEqQmpBjtyruwIuGBHFwJgMQyxYBQgMLAJkKGzAkCgCRAsXokhXgIFCKEIAA="}
import { toFunctionHash } from 'viem'

const hash_1 = toFunctionHash('function ownerOf(uint256)')
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef

// or from an `AbiEvent` on your contract ABI
const hash_2 = toFunctionHash({
  name: 'ownerOf',
  type: 'function',
  inputs: [{ name: 'tokenId', type: 'uint256' }],
  outputs: [],
  stateMutability: 'view',
})
// @log: Output: 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
```

## Returns

[`Hex`](/docs/glossary/types#hex)

The hash of the function signature.

## Parameters

### function

- **Type:** `string` | [`AbiFunction`](https://abitype.dev/api/types#abifunction)

The function to generate a hash for.

