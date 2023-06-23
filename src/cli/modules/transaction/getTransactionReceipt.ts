import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetTransactionReceipt implements Command {
  public readonly name: string = 'getTransactionReceipt'
  public readonly describe: string = 'Get transaction receipt by given hash'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const transaction = await client.getTransactionReceipt({
        hash: argv.hash,
      })

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: transaction,
      })
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      ...ChainArgvs,
      ...WriteOutputArgvs,

      hash: {
        type: 'string',
        default: '',
        describe: 'The block hash being queried',
      },
    })
  }
}
