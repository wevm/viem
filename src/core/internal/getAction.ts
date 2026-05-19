export function getAction<client, parameters, returnType>(
  client: client,
  action: (client: client, parameters: parameters) => returnType,
  name: getAction.Name,
): (parameters: parameters) => returnType {
  const implicit = get(client, action.name)
  if (typeof implicit === 'function')
    return implicit as (parameters: parameters) => returnType

  const explicit = get(client, name)
  if (typeof explicit === 'function')
    return explicit as (parameters: parameters) => returnType

  return (parameters) => action(client, parameters)
}

export declare namespace getAction {
  type Name = string | readonly [namespace: string, name: string]
}

function get(client: unknown, name: getAction.Name) {
  if (typeof name === 'string') {
    if (!isRecord(client)) return undefined
    return client[name]
  }

  const [namespace, key] = name
  if (!isRecord(client)) return undefined
  const target = client[namespace]
  if (!isRecord(target)) return undefined
  return target[key]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}
