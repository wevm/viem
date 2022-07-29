let id = 0

async function request(url: string, options: RequestInit) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
  const json = await response.json()
  if (json.error) {
    throw json.error
  }
  return json
}

export async function jsonRpc(
  url: string,
  { body }: { body: { [key: string]: any } },
) {
  return await request(url, {
    method: 'POST',
    body: JSON.stringify({ jsonrpc: '2.0', id: id++, ...body }),
  })
}
