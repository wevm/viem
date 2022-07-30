export async function request(url: string, options: RequestInit) {
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
