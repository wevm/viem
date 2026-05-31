---
description: Defines a KZG interface.
---

# defineKzg

Defines a [EIP-4844](https://eips.ethereum.org/EIPS/eip-4844) compatible [KZG interface](https://notes.ethereum.org/@vbuterin/proto_danksharding_faq#How-%E2%80%9Ccomplicated%E2%80%9D-and-%E2%80%9Cnew%E2%80%9D-is-KZG). The KZG interface is used in the blob transaction signing process to generate KZG commitments & proofs.

`defineKzg` accepts a KZG interface that implements two functions:

- `blobToKzgCommitment`: A function that takes a blob and returns it's KZG commitment.
- `computeBlobKzgProof`: A function that takes a blob and it's commitment, and returns the KZG proof.

A couple of KZG implementations we recommend are:
- [c-kzg](https://github.com/ethereum/c-kzg-4844): Node.js bindings to c-kzg.
- [kzg-wasm](https://github.com/ethereumjs/kzg-wasm): WebAssembly bindings to c-kzg.

## Import

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"773dd15d207155f03307b147588b16bee9a365919eed2a1a90dc574b74d55cc0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvWP3ZgYAaQBeAc0bBeAI1YRNAFQjKVAYQgBbM+zRmYYNBV4jzWQTQBCOzUYAKpCBH4HAF9EXgARGFl5H2ZSZhsaUh5QiKjFVQAlGDRBUjA9bBgAHTB2MywIUjRpSLl0lUoQKAgRBEQQVLq4XmZeBQAtAHFeOUT+ZhEYADpGtGYVNuRkEDp4rFZcKgADHbQ4ErKKqt4AKh7ukSMBPzNeAHIRAFoAa1U7g/LK6o0ZOqug67me5EdgwMzvUqfY4aMzMOTyNB6UiCOA0KAAZWygiw3mYaHwvAB/BuwNBZgA9JBYBCSpdVFMdMwoEiUWjMTksIxYfDsizUTAMVicXj8NwSrTJKjeK8VLwALw1NJGRh0lRisA7LYgAC62qoqNiDEQAE4qBswCp8UhTdRYipsnhftFVI0OPIkAAGKgifCxCaJa1BPUgJywPCHL68H61Z2yokku4gsF3RoJZhIUB0GhgOASMB4PYgIJBIA="}
import { defineKzg } from 'viem'
```

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"377d02f5450ea91bdddeaf707c5e5e7aa137d34485c7266c254385e69844ea70","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLAWywlLQAIBjAaQC8A5pRBw0AQw5IAjACYqAGxhhBafEgAsVCaUEwGiEHyEiFjMLkQAGKt3yTx3GuURyAvhXTZLBYmRE09HgAFOJm4nAAlJwAZgCuYE6MEGCcsDHmMAKCwcCcAEYKEPkAKhDZAMIQzMyMaMzKaBQ81VhxNABCRfnZAAqkEBAxzW6InAAiMBkWfQ4NzlFjk9NZQgBK+nGkYCXeADpgLGwcaVOZ2SJQENwIhsuZcJzinLwAWgDinObOMY4wAHQBcSCW7IZAgOjiVhKEQAA3haDgByO7C4ACono9jIJYgNmJwAOTcAC0AGshATkaxUZw8ulzkJOG5cdVCURGDBmJTDtSTnlmOJzBY0CVSHExDAoABlTZYXriNRMln4gnszkAekgsG5B2x/yK4igovFNGlsuCAqF+mNErNaDicoV+EiB11KTEnHJOIAvKcVtlgtiXWB4bCQABdcNUMSSAwAZgAnIplKp1Igk9RJHoDCB6TMTIpMjJbPZSI5nEgEx4vDg8IQSORtHQc6FwlEWmAPZawMKbaaZfbHWoxmJSOZBFTjlxu72xbaBw75WoRDGpIgAOzyEBKFTLxCyOPaLP6PAz61z/uypfqQsWJBbuwOJz+dPV6jeOt+RvUZtMXlcbEVx0AxpGkAA2ZNdzTLRM10E9DEA29LBgx8y2fFwrDfTBa0Met/CbIJDHEMAMCA2MZFkaRINTGQINg7M8ANI0L0lBcsFMItEBQ0tyxfABWLCP1wr8Al/QxW0YCJom4d1p0FHtzxNVirydEc0DHFRJxpM8RRYu1FydMi12kOMAA5qL3A8jzgnMdL7ZTB2vDi7y4ksnwrfdZEEnDfAbUTCKMWTPSEMYLmjYCZHXGxtxTPdD3o+CQC9ZzLDo1DeJcMDvJ8PDv0CFswkk9s81WHI8kKYoykqapanqRpmhk1h2hgLpij6AYhhGJYznzQR5TLeYyEWCYetKjZ7W2XYcC0k4SrC3NrluEB7gsR5njeT5vjIX5uABIEQSQMEIVoKEsBhKhQ0RGb0UxHhsmVQkSS9bkUT5P0GRxZkYjxNkOS5a7aU4Oy9LY68lW+1lVT+zVoBgHVEmyfUIENez9KwC15NnJS0evYM3U7LgvU4X05qEQNsmDUMIyjUQItcdc6J3Gj02shjDFJ4QkKQNKePQijss/PyCJzV6APm1cQNMxnYug1nEsQ7dOJ59yX1kLyaZk2A/ynTgMQiO7GQhlUnopAG6VG+6vp+qHORe/9AeB7HQadcHrbVZgYe1V0EaEJGUZB81HfnFS1DxxIgqJkmLbJoMRHmcQkFAZtlDgZIwDwREQDcNwgA==="}
// @noErrors
import * as cKzg from 'c-kzg'
import { defineKzg } from 'viem'
import { mainnetTrustedSetupPath } from 'viem/node'

cKzg.loadTrustedSetup(mainnetTrustedSetupPath)

const kzg = defineKzg(cKzg)
```

## Returns

`Kzg`

The KZG interface.

## Parameters

### blobToKzgCommitment

- **Type:** `(blob: ByteArray) => ByteArray`

Convert a blob to a KZG commitment.

### computeBlobKzgProof

- **Type:** `(blob: ByteArray, commitment: ByteArray) => ByteArray`

Given a blob, return the KZG proof that is used to verify it against the commitment.