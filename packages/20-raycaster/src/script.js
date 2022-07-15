import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
// const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Base variables
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const mouse = new THREE.Vector2()
let currentIntersect = null

/**
 * Objects
 */
const object1 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
)
object1.position.x = -2

const object2 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
)

const object3 = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 16, 16),
  new THREE.MeshBasicMaterial({ color: '#ff0000' }),
)
object3.position.x = 2
// object3.position.x = 10
// object3.position.y = 10
// object3.position.z = 10

const objects = [object1, object2, object3]

scene.add(...objects)

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas,
})
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
window.addEventListener('pointermove', (event) => {
  const nx = event.x / sizes.width
  const ny = event.y / sizes.height

  mouse.x = (nx * 2 - 1) * 1
  mouse.y = (ny * 2 - 1) * -1
})
window.addEventListener('click', () => {
  if (currentIntersect) {
    const isRed = currentIntersect.object.material.color.getHexString() === 'ff0000'
    currentIntersect.object.material.color.set(isRed ? '#0000ff' : '#ff0000')
  }
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Exercise 1
  // objects.forEach((obj, idx) => {
  //   obj.material.color.set('#ff0000')
  //   obj.position.y = Math.sin(elapsedTime * (idx + 1))
  // })

  // const rayOrigin = new THREE.Vector3(-3, 0, 0)
  // const rayDirection = new THREE.Vector3(1, 0, 0)
  // rayDirection.normalize()

  // raycaster.set(rayOrigin, rayDirection)

  // const intersects = raycaster.intersectObjects(objects)
  // intersects.forEach((entry) => {
  //   entry.object.material.color.set('#0000ff')
  // })

  // Exercise 2
  objects.forEach((obj, idx) => {
    obj.position.y = Math.sin(elapsedTime * (idx + 1))
  })

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(objects)
  // intersects.forEach((entry) => {
  //   entry.object.material.color.set('#0000ff')
  // })

  if (intersects.length && !currentIntersect) {
    currentIntersect = intersects[0]
  } else if (!intersects.length && currentIntersect) {
    currentIntersect = null
  }

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
