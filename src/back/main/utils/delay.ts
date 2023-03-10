const delay = async (ms: number, fn: Function) => {
  await new Promise(() => {
    setTimeout(() => {
      fn()
    }, ms)
  })
}

export default delay
