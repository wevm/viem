/// <reference types="@types/bun" />

import { join } from 'node:path'

import { bytesToHex } from '../../src/utils/encoding/toHex.js'
import { toRlp } from '../../src/utils/encoding/toRlp.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 255)
  return bytes
}

const generateList = (length: number) => {
  const bytes: `0x${string}`[] = []
  for (let i = 0; i < length; i++)
    bytes.push(bytesToHex(generateBytes(Math.floor(Math.random() * 128))))
  return bytes
}

export async function generateRlpVectors() {
  const generatedPath = join(import.meta.dir, './rlp.json')
  Bun.write(generatedPath, '')

  const generated = Bun.file(generatedPath)
  const writer = generated.writer()

  writer.write('[')

  // bytes
  for (let i = 0; i < 512 + 1024 + 2048; i++) {
    if (i > 0) writer.write(',')
    const bytes = bytesToHex(
      generateBytes(
        Math.floor(
          (() => {
            if (i < 512) return Math.random() * (2 ** 16 - 1)
            if (i < 1024) return Math.random() * (2 ** 8 - 1)
            return Math.random() * (2 ** 4 - 1)
          })(),
        ),
      ),
    )
    const vector = {
      decoded: bytes,
      encoded: toRlp(bytes, 'hex'),
    }
    writer.write(JSON.stringify(vector, null, 2))
  }

  // lists
  for (let i = 0; i < 24 + 128 + 512 + 1024 + 2048; i++) {
    writer.write(',')
    const bytes = (() => {
      if (i < 24)
        return [
          bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
          bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
          [
            bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
            bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
            [
              bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
              [
                bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
                [
                  [[[], []], []],
                  [
                    [
                      bytesToHex(
                        generateBytes(Math.floor(Math.random() * 128)),
                      ),
                    ],
                  ],
                ],
                bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
              ],
              bytesToHex(generateBytes(Math.floor(Math.random() * 128))),
            ],
            [],
            [bytesToHex(generateBytes(Math.floor(Math.random() * 128)))],
          ],
        ]
      return generateList(
        Math.floor(
          (() => {
            if (i < 64) return Math.random() * 4096
            if (i < 512) return Math.random() * 256
            if (i < 1024) return Math.random() * 128
            return Math.random() * 64
          })(),
        ),
      )
    })()
    const vector = {
      decoded: bytes,
      encoded: toRlp(bytes, 'hex'),
    }
    writer.write(JSON.stringify(vector, null, 2))
  }
  writer.write(']\n')
  writer.end()

  const gzipped = Bun.gzipSync(new Uint8Array(await generated.arrayBuffer()))
  Bun.write(`${generatedPath}.gz`, gzipped)
}
