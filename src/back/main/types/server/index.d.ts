export type FastifyT = FastifyInstance<
  FastifyServer,
  IncomingMessage,
  ServerResponse,
  FastifyBaseLogger,
  FastifyTypeProviderDefault
> &
  PromiseLike<
    FastifyInstance<
      FastifyServer,
      IncomingMessage,
      ServerResponse,
      FastifyBaseLogger,
      FastifyTypeProviderDefault
    >
  >

export type ServerT = { fastifyServer: fastifyT }
