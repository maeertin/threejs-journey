import './style.css'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as THREE from 'three'
import * as dat from 'lil-gui'
// import testVertexShader from './shaders/flagRaw.vs'
// import testFragmentShader from './shaders/flagRaw.fs'
import testVertexShader from './shaders/flag.vs'
import testFragmentShader from './shaders/flag.fs'

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

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const flagTexture = textureLoader.load('/textures/flag-sweden.jpg')

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.PlaneGeometry(1, 1, 32, 32)

// const randoms = new Float32Array(geometry.attributes.position.count)
// for (let idx = 0; idx < randoms.length; idx++) {
//   randoms[idx] = Math.random()
// }
// geometry.setAttribute('aRandom', new THREE.BufferAttribute(randoms, 1))

// Material
// const material = new THREE.RawShaderMaterial({
//   vertexShader: testVertexShader,
//   fragmentShader: testFragmentShader,
//   uniforms: {
//     uFrequency: { value: new THREE.Vector2(10, 3) },
//     uTime: { value: 0 },
//     uColor: { value: new THREE.Color('orange') },
//     uTexture: { value: flagTexture },
//   },
//   side: THREE.DoubleSide,
//   // transparent: true,
//   // wireframe: true,
// })
const material = new THREE.ShaderMaterial({
  vertexShader: testVertexShader,
  fragmentShader: testFragmentShader,
  uniforms: {
    uFrequency: { value: new THREE.Vector2(10, 3) },
    uTime: { value: 0 },
    uColor: { value: new THREE.Color('orange') },
    uTexture: { value: flagTexture },
  },
  side: THREE.DoubleSide,
  // transparent: true,
  // wireframe: true,
})

gui.add(material.uniforms.uFrequency.value, 'x').min(0).max(20).step(0.01).name('frequencyX')
gui.add(material.uniforms.uFrequency.value, 'y').min(0).max(20).step(0.01).name('frequencyY')

// Mesh
const mesh = new THREE.Mesh(geometry, material)
mesh.scale.y = 2 / 3
scene.add(mesh)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0.25, -0.25, 1)
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
 * Sizes
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

  material.uniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
