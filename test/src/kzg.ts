import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import * as cKzg from 'c-kzg'
import { mainnetTrustedSetupPath } from '~viem/node/trustedSetups.js'
import { setupKzg } from '~viem/utils/kzg/setupKzg.js'

export const kzg = setupKzg(cKzg, mainnetTrustedSetupPath)

export const blobData = readFileSync(
  resolve(__dirname, '../kzg/lorem-ipsum.txt'),
  'utf-8',
)
