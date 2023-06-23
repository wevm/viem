export const ChainArgvs: any = {
  chain: {
    type: 'string',
    default: 'ethereum',
    describe: 'The blockchain name, ex: ethereum, mainnet, ...',
  },
  rpc: {
    type: 'string',
    default: '',
    describe: 'Using a custom EVM-compatible RPC endpoint',
  },
}

export const WriteOutputArgvs: any = {
  output: {
    type: 'string',
    default: 'console',
    describe: 'Data output target: console, json, file',
  },
  file: {
    type: 'string',
    default: './output.json',
    describe: 'Output file path target if output=file is given',
  },
}
