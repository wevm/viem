import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetTransaction implements Command {
  public readonly name: string = 'getTransaction'
  public readonly describe: string = 'Get transaction data by given hash'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const transaction = await client.getTransaction({
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
