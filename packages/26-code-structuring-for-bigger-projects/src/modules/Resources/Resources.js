import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'
import EventEmitter from '../EventEmitter'

export default class Resources extends EventEmitter {
  constructor(sources) {
    super()

    this.sources = sources

    this.loaders = {
      gltfModel: new GLTFLoader(), // Potentially add the draco loader
      texture: new THREE.TextureLoader(),
      cubeTexture: new THREE.CubeTextureLoader(),
    }

    this.items = {}
    this.toLoad = this.sources.length
    this.loaded = 0

    this.startLoading()
  }

  startLoading() {
    this.sources.forEach((source) => {
      this.loaders[source.type].load(source.path, (file) => {
        this.sourceLoaded(source, file)
      })
    })
  }

  sourceLoaded(source, file) {
    this.items[source.name] = file
    this.loaded++

    if (this.loaded === this.toLoad) {
      this.trigger('ready')
    }
  }
}
