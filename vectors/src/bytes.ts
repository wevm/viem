import { join } from 'node:path'

import { bytesToHex_native } from '../../src/utils/encoding/toHex.js'

const generateBytes = (length: number) => {
  const bytes = new Uint8Array(length)
  for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 255)
  return bytes
}

generateRandomBytes()
export async function generateRandomBytes() {
  const generatedPath = join(import.meta.dir, './bytes.json')
  Bun.write(generatedPath, '')

  const generated = Bun.file(generatedPath)
  const writer = generated.writer()

  writer.write('[')

  // bytes
  for (let i = 0; i < 2048 + 100_000; i++) {
    if (i > 0) writer.write(',')
    const bytes = generateBytes(
      Math.floor(
        (() => {
          if (i < 2048) return Math.random() * (2 ** 16 - 1)
          return Math.random() * (2 ** 8 - 1)
        })(),
      ),
    )
    writer.write(`"${bytesToHex_native(bytes)}"`)
  }

  writer.write(']\n')
  writer.end()

  const gzipped = Bun.gzipSync(new Uint8Array(await generated.arrayBuffer()))
  Bun.write(`${generatedPath}.gz`, gzipped)
}
