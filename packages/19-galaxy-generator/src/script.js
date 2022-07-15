import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'

/**
 * Base
 */

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// Config
const config = {}
config.count = 100_000
config.size = 0.01
config.radius = 5
config.branches = 6
config.spin = 5
config.spinPower = -0.4
config.randomness = 0.8
config.randomnessPower = 3.5
config.insideColor = '#ff6030'
config.outsideColor = '#1b7184'
config.rotationSpeed = -0.001

// Debug
const gui = new dat.GUI({ width: 400 })
gui.add(config, 'count').min(100).max(1_000_000).step(100).onFinishChange(generateGalaxy)
gui.add(config, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(config, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(config, 'branches').min(1).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(config, 'spin').min(-10).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.add(config, 'spinPower').min(-10).max(10).step(0.01).onFinishChange(generateGalaxy)
gui.add(config, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(config, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(config, 'insideColor').onFinishChange(generateGalaxy)
gui.addColor(config, 'outsideColor').onFinishChange(generateGalaxy)
gui.add(config, 'rotationSpeed').min(-0.05).max(0.05).step(0.001).onFinishChange(generateGalaxy)

/**
 * Galaxy
 */
let geometry
let material
let points

export default function lerp(norm, min, max) {
  return (max - min) * norm + min
}

function generateGalaxy() {
  if (points) {
    geometry.dispose()
    material.dispose()
    scene.remove(points)
    points = null
  }

  geometry = new THREE.BufferGeometry()

  const positions = new Float32Array(config.count * 3)
  const colors = new Float32Array(config.count * 3)

  const insideColor = new THREE.Color(config.insideColor)
  const outsideColor = new THREE.Color(config.outsideColor)

  for (let i = 0; i < config.count; i++) {
    const i3 = i * 3

    const { randomness: r1, randomnessPower: r2 } = config

    // positions
    const branchIdx = i % config.branches
    const slice = (Math.PI * 2) / config.branches
    const randomRadius = Math.random() * config.radius
    const angleOffset = Math.pow(randomRadius, config.spinPower) * config.spin
    const angle = branchIdx * slice + angleOffset

    const radiusR2 = lerp(randomRadius / config.radius, r2, 1)
    const randomX = Math.pow(Math.random(), radiusR2) * (Math.random() < 0.5 ? 1 : -1) * r1
    const randomY = Math.pow(Math.random(), radiusR2) * (Math.random() < 0.5 ? 1 : -1) * r1
    const randomZ = Math.pow(Math.random(), radiusR2) * (Math.random() < 0.5 ? 1 : -1) * r1

    positions[i3 + 0] = Math.cos(angle) * randomRadius + randomX
    positions[i3 + 1] = randomY * (Math.random() < 0.2 ? (config.radius - randomRadius) / 3 : 0.5)
    positions[i3 + 2] = Math.sin(angle) * randomRadius + randomZ

    // colors
    const mixedColor = insideColor.clone()
    mixedColor.lerp(outsideColor, randomRadius / config.radius)

    colors[i3 + 0] = mixedColor.r
    colors[i3 + 1] = mixedColor.g
    colors[i3 + 2] = mixedColor.b
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // Material

  material = new THREE.PointsMaterial({
    size: config.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  // Points

  points = new THREE.Points(geometry, material)
  scene.add(points)
}

generateGalaxy()

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
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
 * Resize
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
// const clock = new THREE.Clock()

const tick = () => {
  // const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)

  if (geometry) {
    geometry.rotateY(config.rotationSpeed)
  }
}

tick()
