export async function wait(time: number) {
  return new Promise((res) => setTimeout(res, time))
}
