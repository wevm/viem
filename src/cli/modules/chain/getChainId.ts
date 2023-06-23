import { ChainArgvs, WriteOutputArgvs } from '../../argvs.js'
import type { Command } from '../../command.js'
import CliHelper from '../../command.js'

export default class GetChainId implements Command {
  public readonly name: string = 'getChainId'
  public readonly describe: string = 'Get blockchain network id'

  public async execute(argv: any) {
    const client = CliHelper.getClient({
      chain: argv.chain.toLowerCase(),
      rpc: argv.rpc,
    })

    if (!client) {
      console.log(`Chain ${argv.chain} is not supported!`)
    } else {
      const chainId = await client.getChainId()

      CliHelper.writeOutput({
        format: argv.output,
        filePath: argv.file,
        data: chainId.toString(),
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
