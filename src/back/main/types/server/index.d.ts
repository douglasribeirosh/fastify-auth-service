export interface ServerT {
  start(): Promise<void>
  stop(): Promise<void>
}