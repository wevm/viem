---
description: Transforms blobs into the originating data.
---

# fromBlobs

Transforms Viem-shaped blobs into the originating data. 

:::warning
This function transforms data from Viem-shaped blobs. It is designed to be used with Viem's `toBlobs` function to convert arbitrary data to blobs.
:::

## Import

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"54b2aab646306095f9abe6c753d03a847bbe99a27db63b40313d7276b0a2eae0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIazhZ0FwiBAsPhiN4wGkNImvAa4tkvAA5ER2DBZHK0c9mEhQDkwHAJGA8GgEA0GkA="}
import { fromBlobs } from 'viem'
```

## Usage

```ts twoslash [example.ts]
// @twoslash-cache: {"v":1,"hash":"ec89bf7ed94537d8af72309ba828824be59063ef9a1ded3d6eba0619aa4ec3e5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/VKFSqaBq9SaaIxiKQABZmSB8fUiVqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInKNRiYbE4PGkNImagsBR8dmQXTKADoE11nJEuvgeiB9odjqcyBdeNdQ1kHtmXuGvIVeDGQPHEyBk51urQul85WVKtVao0itDYfDESHblk1casZqAOx4gkGnFG8mUxAgamDul461Ie0gVnss5IACMAGYPdQ+QuBb7qP6FwcZDhERg+G88xHZsU24rlV2Wh5nxX5jBgqE4SuN+5ZRpWsa0AmcZJmi1giAgC60mY0RRKE4r8AishRDEFrMHGw6YkgACspJ6oSxKIERs4mvOICPlajJ2g626cnaRENMmm7QDaIC9giOjAAOSG8A0A68AA5EQ7AwLI4nQtCYoSrhvBpEuSGMIJj79Mg4k1nG4muA03Bos8zBIKAOTihIYB4GgCANA0QA"}
import { fromBlobs } from 'viem'

const data = fromBlobs({ blobs: ['0x...'] })
```

## Returns

`Hex | ByteArray`

Data extracted from blobs.

## Parameters

### blobs

- **Type:** `Hex[] | ByteArray[]`

Transforms blobs into the originating data.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"cb809d015f336d08b95d418254252f20413831c4657d4a86a1eb9cd75ea9f734","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/VKFSqaBq9SaaIxiKQABZmSB8fUiVqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInKNRiYbE4PGkNImagsBR8dmQXTKADoE11nJEuvgeiB9odjqcyBdeNdQ1kHtmXuGvIVeDGQPHEyBk51urQul85WVKtVao0itDYfDESHblk1casZqAOx4gkGnFG8mUxAgamDul461Ie0gVnss5IACMAGYPdQ+QuBb7qP6FwcZDhERg+G88xHZsU24rlV2Wh5nxX5jBgqE4SuN+5ZRpWsa0AmcZJmi1giAgC60mY0RRKE4r8AishRDEFrMHGw6YkgrobnqhLEogACss4mvOICPlajKIPuDrbpydoNMmm7QDaIC9giOjAAOSG8A0A68AA5EQ7AwLI4nQtCYoSrhvBpEuSGMIJ0K8LoEz9Mg4k1nG4muAA9CZlYAISaLAAgQCIghwM40INNwaLPMwSCgDk4oSGAeBoAgDQNEAA=="}
import { fromBlobs } from 'viem'

const data = fromBlobs({ 
  blobs: ['0x...'] // [!code focus]
})
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"1212ff4e3f7188afddd03a936398ae7f84a463dc8dc98f607d16c54baff8f371","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/XmMGCoQwaIxiKQABZmSB8fUiRqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInINRiYbE4PGkNImagsBR8dmQXTKADo411nJFVus4F19odjqcyBdeNdg1kHpmXqGvIVeFGQLH4yBE50QGsaKmQF85etFWFobD4Yig7csirDVj1QB2PEEvU4g3kymIEDUvt0vGWpC2kCs9lnJAARgAzG7qHzZwLvdRfbODjIcIiMHw3jmw7NimVKtVao1mq4PA+y/L2+FPzMZYVlWMYJmi1giAgs60mY0RRKE4r8AishRDEZrMDGA6YkgzqrjqhLEogACsU5GjO9aokujKIDudobpyNr7pgHpHl65A+iK55YJeZCYHw0StP0yTuLwwiwPwlpQFhaqIAAHHh46EauhrGng0QWtR6p0Q6m6MTyB4sQQbFCmea5aDo6GtgsSrSViW5biR2qKfqZJkSa6EaVao5rvazCOkyTGHiAACOghkMqHEmmKEqWX4baLBF6KDtuDljrqhFaa5qmzh5VFedpfm6SUDSJmZsB4F2CI6MAvYwbwDS9rwADkRDsDAshNdC0LRRZ0rMLwaTzjBjA1dCvC6BM/TIE1IFNYmY2of0TUNvATW8AA9Ot5YAISaLAAgQCIghwM40INNwXUmH1G1bcgu3QDAB1HSd0Jos8zBIKAOTihIYBqQgDQNEAA==="}
import { fromBlobs } from 'viem'

const data = fromBlobs({ 
  blobs: ['0x...'],
  to: 'bytes' // [!code focus]
})

data // [!code focus]
// ^?


```
