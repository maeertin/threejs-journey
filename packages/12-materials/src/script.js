import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'

// Base
const gui = new dat.GUI({ closed: true, width: 400 })
const loadingManager = new THREE.LoadingManager()
const canvas = document.getElementById('canvas')
const clock = new THREE.Clock()
const scene = new THREE.Scene()
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

// Assets
const textureLoader = new THREE.TextureLoader(loadingManager)
const alphaTexture = textureLoader.load('/textures/door/alpha.jpg')
const ambientOcclusionTexture = textureLoader.load('/textures/door/ambientOcclusion.jpg')
const colorTexture = textureLoader.load('/textures/door/color.jpg')
const heightTexture = textureLoader.load('/textures/door/height.jpg')
const metalnessTexture = textureLoader.load('/textures/door/metalness.jpg')
const normalTexture = textureLoader.load('/textures/door/normal.jpg')
const roughnessTexture = textureLoader.load('/textures/door/roughness.jpg')
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
const matcapTexture = textureLoader.load('/textures/matcaps/8.png')

const cubeTextureLoader = new THREE.CubeTextureLoader(loadingManager)
const environmentMapTexture = cubeTextureLoader.load([
  '/textures/environmentMaps/custom/px.png',
  '/textures/environmentMaps/custom/nx.png',
  '/textures/environmentMaps/custom/py.png',
  '/textures/environmentMaps/custom/ny.png',
  '/textures/environmentMaps/custom/pz.png',
  '/textures/environmentMaps/custom/nz.png',
])

loadingManager.onProgress = (...args) => {
  console.log(...args)
}

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(pointLight)

// Object
// const material = new THREE.MeshBasicMaterial()
// material.map = colorTexture
// material.color = new THREE.Color('hotpink')
// material.wireframe = true
// material.transparent = true
// material.opacity = 0.5
// material.alphaMap = alphaTexture
// material.side = THREE.DoubleSide

// const material = new THREE.MeshNormalMaterial()
// material.flatShading = true

// const material = new THREE.MeshMatcapMaterial({ matcap: matcapTexture })

// const material = new THREE.MeshDepthMaterial()

// const material = new THREE.MeshLambertMaterial()

// const material = new THREE.MeshPhongMaterial()
// material.shininess = 100
// material.specular = new THREE.Color(0xff0000)

// const material = new THREE.MeshToonMaterial()
// gradientTexture.minFilter = THREE.NearestFilter
// gradientTexture.magFilter = THREE.NearestFilter
// gradientTexture.generateMipmap = false
// material.gradientMap = gradientTexture

// const material = new THREE.MeshStandardMaterial()
// material.metalness = 0
// material.roughness = 1
// material.map = colorTexture
// material.aoMap = ambientOcclusionTexture
// material.aoMapIntensity = 1
// material.displacementMap = heightTexture
// material.displacementScale = 0.05
// material.metalnessMap = metalnessTexture
// material.roughnessMap = roughnessTexture
// material.normalMap = normalTexture
// material.normalScale.set(0.5, 0.5)
// material.alphaMap = alphaTexture
// material.transparent = true

const material = new THREE.MeshStandardMaterial()
material.metalness = 0.87
material.roughness = 0.11
material.envMap = environmentMapTexture

gui.add(material, 'metalness').min(0).max(1).step(0.01)
gui.add(material, 'roughness').min(0).max(1).step(0.01)
gui.add(material, 'aoMapIntensity').min(0).max(10).step(0.01)
gui.add(material, 'displacementScale').min(0).max(1).step(0.01)

const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 64, 64), material)
sphere.geometry.setAttribute(
  'uv2',
  new THREE.BufferAttribute(sphere.geometry.attributes.uv.array, 2),
)
sphere.position.x = -1.5

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material)
plane.geometry.setAttribute('uv2', new THREE.BufferAttribute(plane.geometry.attributes.uv.array, 2))

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 16, 32), material)
torus.geometry.setAttribute('uv2', new THREE.BufferAttribute(torus.geometry.attributes.uv.array, 2))
torus.position.x = 1.5

scene.add(plane, sphere, torus)

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(0, 0, 3)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

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
function tick() {
  const elapsedTime = clock.getElapsedTime()

  // Update objects
  plane.rotation.y = elapsedTime * 0.1
  sphere.rotation.y = elapsedTime * 0.1
  torus.rotation.y = elapsedTime * 0.1

  plane.rotation.x = elapsedTime * 0.15
  sphere.rotation.x = elapsedTime * 0.15
  torus.rotation.x = elapsedTime * 0.15

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  requestAnimationFrame(tick)
}

tick()
