import './style.css'
import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import waterVertexShader from './shaders/water.vs'
import waterFragmentShader from './shaders/water.fs'

/**
 * Base
 */
const gui = new dat.GUI({ width: 340 })
const debugObject = {}

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

/**
 * Water
 */
// Colors
debugObject.depthColor = '#186691'
debugObject.surfaceColor = '#9bd8ff'

// Geometry
const waterGeometry = new THREE.PlaneGeometry(2, 2, 512, 512)

// Material
const waterMaterial = new THREE.ShaderMaterial({
  vertexShader: waterVertexShader,
  fragmentShader: waterFragmentShader,
  uniforms: {
    uTime: { value: 0 },
    // Big waves
    uBigWavesElevation: { value: 0.2 },
    uBigWavesFrequency: { value: new THREE.Vector2(4, 1.5) },
    uBigWavesSpeed: { value: 0.75 },
    // Small waves
    uSmallWavesElevation: { value: 0.15 },
    uSmallWavesFrequency: { value: 3 },
    uSmallWavesSpeed: { value: 0.2 },
    uSmallWavesIterations: { value: 4 },
    // Colors
    uDepthColor: { value: new THREE.Color(debugObject.depthColor) },
    uSurfaceColor: { value: new THREE.Color(debugObject.surfaceColor) },
    uColorOffset: { value: 0.08 },
    uColorMultiplier: { value: 5 },
  },
})

gui
  .add(waterMaterial.uniforms.uBigWavesElevation, 'value')
  .name('uBigWavesElevation')
  .min(0)
  .max(1)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'x')
  .name('uBigWavesFrequencyX')
  .min(0)
  .max(10)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uBigWavesFrequency.value, 'y')
  .name('uBigWavesFrequencyZ')
  .min(0)
  .max(10)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uBigWavesSpeed, 'value')
  .name('uBigWavesSpeed')
  .min(0)
  .max(4)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uSmallWavesElevation, 'value')
  .name('uSmallWavesElevation')
  .min(0)
  .max(1)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uSmallWavesFrequency, 'value')
  .name('uSmallWavesFrequency')
  .min(0)
  .max(30)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uSmallWavesSpeed, 'value')
  .name('uSmallWavesSpeed')
  .min(0)
  .max(4)
  .step(0.001)
gui
  .add(waterMaterial.uniforms.uSmallWavesIterations, 'value')
  .name('uSmallWavesIterations')
  .min(1)
  .max(6)
  .step(1)

gui.addColor(debugObject, 'depthColor').onChange(() => {
  waterMaterial.uniforms.uDepthColor.value.set(debugObject.depthColor)
})
gui.addColor(debugObject, 'surfaceColor').onChange(() => {
  waterMaterial.uniforms.uSuraceColor.value.set(debugObject.surfaceColor)
})
gui.add(waterMaterial.uniforms.uColorOffset, 'value').name('uColorOffset').min(0).max(1).step(0.001)
gui
  .add(waterMaterial.uniforms.uColorMultiplier, 'value')
  .name('uColorMultiplier')
  .min(0)
  .max(10)
  .step(0.001)

// Mesh
const water = new THREE.Mesh(waterGeometry, waterMaterial)
water.rotation.x = -Math.PI * 0.5
scene.add(water)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 1)
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

/**
 * Animate
 */
const clock = new THREE.Clock()

function tick() {
  const elapsedTime = clock.getElapsedTime()

  waterMaterial.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
