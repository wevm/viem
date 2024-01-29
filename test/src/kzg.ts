import { resolve } from 'node:path'
import * as cKzg from 'c-kzg'
import { setupKzg } from '~viem/utils/kzg/setupKzg.js'

export const trustedSetupPath = resolve(__dirname, '../kzg/trusted_setup.txt')

export const kzg = setupKzg(trustedSetupPath, cKzg)
