import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import * as dat from 'lil-gui'

/**
 * Base
 */
const gui = new dat.GUI()
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

const config = {}
let foxAnimationMixer
let foxAnimations

/**
 * Debug
 */
config.standAnimation = () => {
  foxAnimationMixer.stopAllAction()
  foxAnimationMixer.clipAction(foxAnimations[0]).play()
}
gui.add(config, 'standAnimation')

config.walkAnimation = () => {
  foxAnimationMixer.stopAllAction()
  foxAnimationMixer.clipAction(foxAnimations[1]).play()
}
gui.add(config, 'walkAnimation')

config.runAnimation = () => {
  foxAnimationMixer.stopAllAction()
  foxAnimationMixer.clipAction(foxAnimations[2]).play()
}
gui.add(config, 'runAnimation')

/**
 * Models
 */
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')

const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

// gltfLoader.load('/models/FlightHelmet/glTF/FlightHelmet.gltf', (gltf) => {
//   // console.log('success', gltf)
//   const meshes = [...gltf.scene.children]
//   meshes.forEach((mesh) => {
//     scene.add(mesh)
//   })
// })

// gltfLoader.load('/models/Duck/glTF-Draco/Duck.gltf', (gltf) => {
//   // console.log('success', gltf)
//   scene.add(gltf.scene.children[0])
// })

gltfLoader.load('/models/Fox/glTF/Fox.gltf', (gltf) => {
  // console.log('success', gltf)

  foxAnimationMixer = new THREE.AnimationMixer(gltf.scene)
  foxAnimations = gltf.animations

  foxAnimationMixer.clipAction(gltf.animations[0]).play()

  gltf.scene.scale.set(0.025, 0.025, 0.025)
  scene.add(gltf.scene)
})

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(10, 10),
  new THREE.MeshStandardMaterial({
    color: '#444444',
    metalness: 0,
    roughness: 0.5,
  }),
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.camera.left = -7
directionalLight.shadow.camera.top = 7
directionalLight.shadow.camera.right = 7
directionalLight.shadow.camera.bottom = -7
directionalLight.position.set(5, 5, 5)
scene.add(directionalLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(2, 2, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.target.set(0, 0.75, 0)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Event listeners
 */
window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

function tick() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update animation mixer
  if (foxAnimationMixer) {
    foxAnimationMixer.update(deltaTime)
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
