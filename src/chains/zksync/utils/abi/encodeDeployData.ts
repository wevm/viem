import type { Abi } from 'abitype'

import { zeroHash } from '../../../../constants/bytes.js'
import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../../../errors/abi.js'
import type { ContractConstructorArgs } from '../../../../types/contract.js'
import { encodeAbiParameters } from '../../../../utils/abi/encodeAbiParameters.js'
import {
  type EncodeDeployDataParameters,
  type EncodeDeployDataReturnType,
} from '../../../../utils/abi/encodeDeployData.js'
import { encodeFunctionData } from '../../../../utils/abi/encodeFunctionData.js'
import { toHex } from '../../../../utils/encoding/toHex.js'
import { contractDeployerAbi } from '../../constants/abis.js'
import type { ContractDeploymentType } from '../../types/contract.js'
import { hashBytecode } from '../hashBytecode.js'

const docsPath = '/docs/contract/encodeDeployData'

export type EncodeDeployDataParametersExtended<
  abi extends Abi | readonly unknown[] = Abi,
  hasConstructor = abi extends Abi
    ? Abi extends abi
      ? true
      : [Extract<abi[number], { type: 'constructor' }>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractConstructorArgs<abi>,
> = EncodeDeployDataParameters<abi, hasConstructor, allArgs> & {
  deploymentType?: ContractDeploymentType
}

export function encodeDeployData<const abi extends Abi | readonly unknown[]>(
  parameters: EncodeDeployDataParametersExtended<abi>,
): EncodeDeployDataReturnType {
  const {
    abi,
    args: initialArgs,
    bytecode,
    deploymentType,
  } = parameters as EncodeDeployDataParametersExtended
  const args = initialArgs || []

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const data = encodeAbiParameters(description.inputs || [], args)

  const contractDeploymentArgs = [zeroHash, toHex(hashBytecode(bytecode)), data]
  const accountDeploymentArgs = [...contractDeploymentArgs, 1]

  const deploymentOptions = {
    create: {
      functionName: 'create',
      argsContractDeployer: contractDeploymentArgs,
    },
    create2: {
      functionName: 'create2',
      argsContractDeployer: contractDeploymentArgs,
    },
    createAccount: {
      functionName: 'createAccount',
      argsContractDeployer: accountDeploymentArgs,
    },
    create2Account: {
      functionName: 'create2Account',
      argsContractDeployer: accountDeploymentArgs,
    },
  }

  const deploymentKey = deploymentType || 'create'
  const { functionName, argsContractDeployer } =
    deploymentOptions[deploymentKey]

  return encodeFunctionData({
    abi: contractDeployerAbi,
    functionName,
    args: argsContractDeployer,
  })
}
