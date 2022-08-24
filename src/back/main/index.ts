import fastify from 'fastify'

const server = fastify()

server.get('/ping', async (/*request, reply*/) => {
  return 'pong\n'
})

server.get('/tag', async (/*request, reply*/) => {
  return process.env[`IMAGE_VERSION`] ?? 'latest'
})

server.listen(
  { host: '0.0.0.0', port: process.env[`PORT`] ? +process.env[`PORT`] : 33666 },
  (err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  },
)
