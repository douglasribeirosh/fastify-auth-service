import fastify from 'fastify'

class Server {
  async start() {
    const server = fastify()

    server.get('/ping', async (/*request, reply*/) => {
      return 'pong\n'
    })

    server.get('/tag', async (/*request, reply*/) => {
      return process.env[`IMAGE_VERSION`] ?? 'latest'
    })

    const host = '0.0.0.0'
    const port = process.env[`PORT`] ? +process.env[`PORT`] : 33666
    await server.listen(
      { host ,  port},
      (err) => {
        if (err) {
          process.exit(1)
        }
      },
    )
    console.log(`Listening on ${host}:${port}`)
  }
}

export { Server }
