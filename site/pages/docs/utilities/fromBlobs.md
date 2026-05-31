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
// @twoslash-cache: {"v":2,"hash":"001d1fd667cdae1336cb74617e876f240e0f19d106d21426f3e502cb4d70ac66","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIazhZ0FwiBAsPhiN4wGkNImvAa4tkvAA5ER2DBZHK0c9mEhQDkwHAJGA8GgEA0GkA="}
import { fromBlobs } from 'viem'
```

## Usage

```ts twoslash [example.ts]
// @twoslash-cache: {"v":2,"hash":"f2ae4c05445ce49f97ced0b3719c7b0578625d229b10d2bea24ddc26f2222990","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/VKFSqaBq9SaaIxiKQABZmSB8fUiVqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInKNRiYbE4PGkNImagsBR8dmQXTKADoE11nJEuvgeiB9odjqcyBdeNdQ1kHtmXuGvIVeDGQPHEyBk51urQul85WVKtVao0itDYfDESHblk1casZqAOx4gkGnFG8mUxAgamDul461Ie0gVnss5IACMAGYPdQ+QuBb7qP6FwcZDhERg+G88xHZsU24rlV2Wh5nxX5jBgqE4SuN+5ZRpWsa0AmcZJmi1giAgC60mY0RRKE4r8AishRDEFrMHGw6YkgACspJ6oSxKIERs4mvOICPlajJ2g626cnaRENMmm7QDaIC9giOjAAOSG8A0A68AA5EQ7AwLI4nQtCYoSrhvBpEuSGMIJj79Mg4k1nG4muA03Bos8zBIKAOTihIYB4GgCANA0QA"}
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
// @twoslash-cache: {"v":2,"hash":"632a3dcf27cdda2396266356ab496432952e7888fa6b77bd0cb4563c5fd045f5","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/VKFSqaBq9SaaIxiKQABZmSB8fUiVqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInKNRiYbE4PGkNImagsBR8dmQXTKADoE11nJEuvgeiB9odjqcyBdeNdQ1kHtmXuGvIVeDGQPHEyBk51urQul85WVKtVao0itDYfDESHblk1casZqAOx4gkGnFG8mUxAgamDul461Ie0gVnss5IACMAGYPdQ+QuBb7qP6FwcZDhERg+G88xHZsU24rlV2Wh5nxX5jBgqE4SuN+5ZRpWsa0AmcZJmi1giAgC60mY0RRKE4r8AishRDEFrMHGw6YkgrobnqhLEogACss4mvOICPlajKIPuDrbpydoNMmm7QDaIC9giOjAAOSG8A0A68AA5EQ7AwLI4nQtCYoSrhvBpEuSGMIJ0K8LoEz9Mg4k1nG4muAA9CZlYAISaLAAgQCIghwM40INNwaLPMwSCgDk4oSGAeBoAgDQNEAA=="}
import { fromBlobs } from 'viem'

const data = fromBlobs({ 
  blobs: ['0x...'] // [!code focus]
})
```

### to

- **Type:** `"bytes" | "hex"`

The output type.

```ts twoslash
// @twoslash-cache: {"v":2,"hash":"4c3e0095da1e84e05148b4f639c55aa1cbf317ae84020c4ad975e14c50d9c9dc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwA0hAC2AIVYQARnAA8IyXDS9lS1bzo0wUOL1IxmUSawy8AEnWQBdXgB9zl62Fu95GGgBBUlJmDBcKXjQIQ3oYEzMAFRiAXl5GPRUzI3jTTysbOwADAAZaABJgbVJ2MABzAF8il14Afl4AHQI6Lt5EXjAYElI+Dwz9bLiE/O9ffyCQsJb2ruUA+F7+weHuAD5GLGZQ2RgaUjh+gDEZBQmABSPmE7P1TNVI6N3uK5vFLIAlU6CUhgRLYGBqT4dMDsWRYCCkHT8X4TSggbRHBiIACcVFY8TqaHwSFx1COdVOeGRcj+qjRHEGSBKVBE+EeYjIJIaFHQ4LwhGGaJo9DwmjA2l4UGYaGY/XmMGCoQwaIxiKQABZmSB8fUiRqqDLSBSsSApTL6bVcIgAEwstmhDnkRAANm5vJw/OInINRiYbE4PGkNImagsBR8dmQXTKADo411nJFVus4F19odjqcyBdeNdg1kHpmXqGvIVeFGQLH4yBE50QGsaKmQF85etFWFobD4Yig7csirDVj1QB2PEEvU4g3kymIEDUvt0vGWpC2kCs9lnJAARgAzG7qHzZwLvdRfbODjIcIiMHw3jmw7NimVKtVao1mq4PA+y/L2+FPzMZYVlWMYJmi1giAgs60mY0RRKE4r8AishRDEZrMDGA6YkgzqrjqhLEogACsU5GjO9aokujKIDudobpyNr7pgHpHl65A+iK55YJeZCYHw0StP0yTuLwwiwPwlpQFhaqIAAHHh46EauhrGng0QWtR6p0Q6m6MTyB4sQQbFCmea5aDo6GtgsSrSViW5biR2qKfqZJkSa6EaVao5rvazCOkyTGHiAACOghkMqHEmmKEqWX4baLBF6KDtuDljrqhFaa5qmzh5VFedpfm6SUDSJmZsB4F2CI6MAvYwbwDS9rwADkRDsDAshNdC0LRRZ0rMLwaTzjBjA1dCvC6BM/TIE1IFNYmY2of0TUNvATW8AA9Ot5YAISaLAAgQCIghwM40INNwXUmH1G1bcgu3QDAB1HSd0Jos8zBIKAOTihIYBqQgDQNEAA==="}
import { fromBlobs } from 'viem'

const data = fromBlobs({ 
  blobs: ['0x...'],
  to: 'bytes' // [!code focus]
})

data // [!code focus]
// ^?


```
