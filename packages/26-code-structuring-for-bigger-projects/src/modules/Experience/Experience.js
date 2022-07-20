import * as THREE from 'three'
import sources from '../../sources'
import Camera from '../Camera'
import Debug from '../Debug'
import Renderer from '../Renderer'
import Resources from '../Resources'
import Sizes from '../Sizes'
import Time from '../Time'
import World from '../World'

export default class Experience {
  static default

  constructor(canvas) {
    if (!Experience.default) {
      Experience.default = this
    }

    this.canvas = canvas

    this.debug = new Debug()

    // Order might matter...
    this.sizes = new Sizes()
    this.time = new Time()
    this.scene = new THREE.Scene()
    this.resources = new Resources(sources)
    this.camera = new Camera()
    this.renderer = new Renderer()
    this.world = new World()

    this.sizes.on('resize', this.handleResize)
    this.time.on('raf', this.handleRaf)
  }

  handleResize = () => {
    this.camera.resize()
    this.renderer.resize()
  }

  handleRaf = () => {
    this.camera.update()
    this.world.update()
    this.renderer.update()
  }

  destroy() {
    // Ideally create a destroy method for each class.

    this.sizes.off('resize')
    this.time.off('raf')

    this.scene.traverse((child) => {
      // console.log(child.type, child)

      if (child instanceof THREE.Mesh) {
        child.geometry.dispose()

        // console.log(child.material)
        Object.values(child.material).forEach((attribute) => {
          if (attribute && typeof attribute.dispose === 'function') {
            attribute.dispose()
          }
        })
      }
    })

    this.camera.controls.dispose()
    this.renderer.instance.dispose()

    if (this.debug.active) {
      this.debug.ui.destroy()
    }

    // Be careful, if you are using post-processing, you'll need to dispose of
    // the `EffectComposer`, it's `WebGLRenderTarget` and any potential passes
    // you are using.
  }
}
