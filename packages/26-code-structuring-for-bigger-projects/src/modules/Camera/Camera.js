import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import Experience from '../Experience'

export default class Camera {
  constructor() {
    this.canvas = Experience.default.canvas
    this.sizes = Experience.default.sizes
    this.scene = Experience.default.scene

    this.instance = new THREE.PerspectiveCamera(35, this.sizes.width / this.sizes.height, 0.1, 100)
    this.instance.position.set(6, 4, 8)

    this.controls = new OrbitControls(this.instance, this.canvas)
    this.controls.enableDamping = true

    this.scene.add(this.instance)
  }

  resize() {
    this.instance.aspect = this.sizes.width / this.sizes.height
    this.instance.updateProjectionMatrix()
  }

  update() {
    this.controls.update()
  }
}
