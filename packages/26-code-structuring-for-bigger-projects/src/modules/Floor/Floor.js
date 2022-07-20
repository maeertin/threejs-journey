import * as THREE from 'three'
import Experience from '../Experience'

export default class Floor {
  constructor() {
    this.scene = Experience.default.scene
    this.resources = Experience.default.resources

    this.textures = {}

    this.textures.color = this.resources.items.grassColorTexture
    this.textures.color.encoding = THREE.sRGBEncoding
    this.textures.color.repeat.set(1.5, 1.5)
    this.textures.color.wrapS = THREE.RepeatWrapping
    this.textures.color.wrapT = THREE.RepeatWrapping

    this.textures.normal = this.resources.items.grassNormalTexture
    this.textures.normal.repeat.set(1.5, 1.5)
    this.textures.normal.wrapS = THREE.RepeatWrapping
    this.textures.normal.wrapT = THREE.RepeatWrapping

    this.mesh = new THREE.Mesh(
      new THREE.CircleGeometry(5, 64),
      new THREE.MeshStandardMaterial({
        map: this.textures.color,
        normalMap: this.textures.normal,
      }),
    )
    this.mesh.rotation.x = -Math.PI * 0.5
    this.mesh.receiveShadow = true

    this.scene.add(this.mesh)
  }
}
