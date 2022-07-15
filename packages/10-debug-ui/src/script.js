import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import gsap from 'gsap'
import * as dat from 'dat.gui'

// Base
const canvas = document.getElementById('canvas')
const scene = new THREE.Scene()
const gui = new dat.GUI({ closed: true, width: 400 })
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
const parameters = {
  color: 0xff0000,
  spin: () => {
    // eslint-disable-next-line no-use-before-define
    gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + 10 })
  },
}

// Object
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: parameters.color }),
)
scene.add(mesh)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Debug
gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation')
gui.add(mesh.material, 'wireframe')
gui.add(mesh, 'visible')
gui.addColor(parameters, 'color').onChange(() => {
  mesh.material.color.set(parameters.color)
})
gui.add(parameters, 'spin')

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// Resize
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

// Animations
// const clock = new THREE.Clock()

function tick() {
  // const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}

tick()
