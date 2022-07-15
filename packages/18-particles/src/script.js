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
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('/textures/particles/13.png')

/**
 * Particles
 */
// Geometry
// const particlesGeometry = new THREE.SpehereGeometry()
const particleCount = 20_000
const particlesGeometry = new THREE.BufferGeometry()
const particleColors = new Float32Array(particleCount * 3)
const particlePositions = new Float32Array(particleCount * 3)
for (let i = 0; i < particleCount * 3; i++) {
  particleColors[i] = Math.random()
  particlePositions[i] = (Math.random() - 0.5) * 10
}
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3))
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial({
  // Different alpha solutions
  alphaMap: particleTexture,
  // alphaTest: 0.001,
  // depthTest: false,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  // other...
  color: '#ff88cc',
  map: particleTexture,
  size: 0.1,
  // sizeAttenuation: false, // Detauls to true
  transparent: true,
  vertexColors: true,
})

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

// Cube
// const cube = new THREE.Mesh(new THREE.BoxGeometry(), new THREE.MeshBasicMaterial())
// scene.add(cube)

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
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update particles
  // particles.rotation.y = elapsedTime * 0.2
  for (let i = 0; i < particles.geometry.attributes.position.count; i++) {
    const i3 = i * 3
    const x = particles.geometry.attributes.position.array[i3]
    particles.geometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime + x)
  }
  particles.geometry.attributes.position.needsUpdate = true

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
