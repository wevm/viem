import { Abi } from 'abitype'

export function getAbiItem({ abi, name }: { abi: Abi; name: string }) {
  return abi.find((x) => 'name' in x && x.name === name)
}
