import EventEmitter from '../EventEmitter'

export default class Time extends EventEmitter {
  constructor() {
    super()

    this.start = Date.now()
    this.current = this.start
    this.elapsed = 0
    this.delta = 16

    window.requestAnimationFrame(this.handleRaf)
  }

  handleRaf = () => {
    const current = new Date()
    this.delta = current - this.current
    this.current = current
    this.elapsed = this.current - this.start

    this.trigger('raf')

    window.requestAnimationFrame(this.handleRaf)
  }
}
