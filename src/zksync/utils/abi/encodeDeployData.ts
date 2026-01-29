import type { Abi } from 'abitype'

import { zeroHash } from '../../../constants/bytes.js'
import {
  AbiConstructorNotFoundError,
  AbiConstructorParamsNotFoundError,
} from '../../../errors/abi.js'
import type { ErrorType } from '../../../errors/utils.js'
import type { ContractConstructorArgs } from '../../../types/contract.js'
import type { Hash, Hex } from '../../../types/misc.js'
import { encodeAbiParameters } from '../../../utils/abi/encodeAbiParameters.js'
import type {
  EncodeDeployDataParameters as EncodeDeployDataParameters_,
  EncodeDeployDataReturnType,
} from '../../../utils/abi/encodeDeployData.js'
import {
  type EncodeFunctionDataErrorType,
  encodeFunctionData,
} from '../../../utils/abi/encodeFunctionData.js'
import { toHex } from '../../../utils/encoding/toHex.js'
import { contractDeployerAbi } from '../../constants/abis.js'
import { accountAbstractionVersion1 } from '../../constants/contract.js'
import type { ContractDeploymentType } from '../../types/contract.js'
import { type HashBytecodeErrorType, hashBytecode } from '../hashBytecode.js'

const docsPath = '/docs/contract/encodeDeployData'

/** @internal */
export type EncodeDeployDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
  hasConstructor = abi extends Abi
    ? Abi extends abi
      ? true
      : [Extract<abi[number], { type: 'constructor' }>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractConstructorArgs<abi>,
> = EncodeDeployDataParameters_<abi, hasConstructor, allArgs> & {
  deploymentType?: ContractDeploymentType | undefined
  salt?: Hash | undefined
}

export type EncodeDeployDataErrorType =
  | EncodeFunctionDataErrorType
  | HashBytecodeErrorType
  | ErrorType

export function encodeDeployData<const abi extends Abi | readonly unknown[]>(
  parameters: EncodeDeployDataParameters<abi>,
): EncodeDeployDataReturnType {
  const { abi, args, bytecode, deploymentType, salt } =
    parameters as EncodeDeployDataParameters

  if (!args || args.length === 0) {
    const { functionName, argsContractDeployer } = getDeploymentDetails(
      deploymentType,
      salt ?? zeroHash,
      toHex(hashBytecode(bytecode)),
      '0x',
    )
    return encodeFunctionData({
      abi: contractDeployerAbi,
      functionName,
      args: argsContractDeployer,
    })
  }

  const description = abi.find((x) => 'type' in x && x.type === 'constructor')
  if (!description) throw new AbiConstructorNotFoundError({ docsPath })
  if (!('inputs' in description))
    throw new AbiConstructorParamsNotFoundError({ docsPath })
  if (!description.inputs || description.inputs.length === 0)
    throw new AbiConstructorParamsNotFoundError({ docsPath })

  const data = encodeAbiParameters(description.inputs, args)
  const { functionName, argsContractDeployer } = getDeploymentDetails(
    deploymentType,
    salt ?? zeroHash,
    toHex(hashBytecode(bytecode)),
    data,
  )

  return encodeFunctionData({
    abi: contractDeployerAbi,
    functionName,
    args: argsContractDeployer,
  })
}

function getDeploymentDetails(
  deploymentType: ContractDeploymentType,
  salt: Hash,
  bytecodeHash: Hex,
  data: Hex,
): {
  functionName: string
  argsContractDeployer: readonly unknown[]
} {
  const contractDeploymentArgs = [salt, bytecodeHash, data]

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
      argsContractDeployer: [
        ...contractDeploymentArgs,
        accountAbstractionVersion1,
      ],
    },
    create2Account: {
      functionName: 'create2Account',
      argsContractDeployer: [
        ...contractDeploymentArgs,
        accountAbstractionVersion1,
      ],
    },
  }

  const deploymentKey = deploymentType || 'create'
  return deploymentOptions[deploymentKey]
}
