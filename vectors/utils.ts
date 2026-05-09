export async function readGzippedJson(path: string) {
  const vectorFile = Bun.file(path)
  const vectorsChunk = Bun.gunzipSync(
    new Uint8Array(await vectorFile.arrayBuffer()),
  )
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(vectorsChunk)
      controller.close()
    },
  })
  return Bun.readableStreamToJSON(stream)
}
