import { generateRlpVectors } from './src/rlp.js'
import { generateTransactionVectors } from './src/transaction.js'

await generateRlpVectors()
await generateTransactionVectors()
