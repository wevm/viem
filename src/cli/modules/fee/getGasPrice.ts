import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetGasPrice implements Command {
  public readonly name: string = 'getGasPrice'
  public readonly describe: string = 'Get current network gas price'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const gasPrice = await client.getGasPrice()

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: gasPrice.toString(),
      })
    }
  }

  public setOptions(yargs: any) {
    return yargs.option({
      ...ChainArgvs,
      ...WriteOutputArgvs,
    })
  }
}
