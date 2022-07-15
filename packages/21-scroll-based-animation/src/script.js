import './style.css'
import * as THREE from 'three'
import * as dat from 'lil-gui'
import gsap from 'gsap'

/**
 * Debug
 */
const gui = new dat.GUI()

const parameters = {
  materialColor: '#ffeded',
}

gui.addColor(parameters, 'materialColor').onChange(() => {
  // eslint-disable-next-line no-use-before-define
  material.color.set(parameters.materialColor)
  // eslint-disable-next-line no-use-before-define
  particlesMaterial.color.set(parameters.materialColor)
})

/**
 * Base
 */
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
const objectsDistance = 4
const mouse = { x: 0, y: 0 }
const easing = 5
let currentSectionIdx = 0
let scrollY = 0

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const gradientTexture = textureLoader.load('/textures/gradients/3.jpg')
gradientTexture.magFilter = THREE.NearestFilter

/**
 * Objects
 */
const material = new THREE.MeshToonMaterial({
  color: parameters.materialColor,
  gradientMap: gradientTexture,
})

const meshes = [
  new THREE.Mesh(new THREE.TorusGeometry(1, 0.4, 16, 60), material),
  new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material),
  new THREE.Mesh(new THREE.TorusKnotGeometry(0.8, 0.35, 100, 16), material),
]

meshes.forEach((mesh, idx) => {
  mesh.position.x = idx % 2 ? 1 : -1
  mesh.position.y = -objectsDistance * idx
})

scene.add(...meshes)

/**
 * Particles
 */
const particlesCount = 200
const positions = new Float32Array(particlesCount * 3)

for (let i = 0; i < particlesCount; i++) {
  const i3 = i * 3

  positions[i3 + 0] = (Math.random() - 0.5) * 10
  positions[i3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * meshes.length
  positions[i3 + 2] = (Math.random() - 0.5) * 10
}

const particlesGeometry = new THREE.BufferGeometry()
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

const particlesMaterial = new THREE.PointsMaterial({
  color: parameters.materialColor,
  sizeAttenuation: true,
  size: 0.03,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 1)
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight)

/**
 * Camera
 */
const cameraGroup = new THREE.Group()
scene.add(cameraGroup)

const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  alpha: true,
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

window.addEventListener('scroll', () => {
  scrollY = window.scrollY

  const newSectionIdx = Math.round(scrollY / sizes.height)
  if (currentSectionIdx !== newSectionIdx) {
    gsap.to(meshes[newSectionIdx].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
      z: '+=1.5',
    })

    currentSectionIdx = newSectionIdx
  }
})

window.addEventListener('pointermove', (event) => {
  mouse.x = (event.clientX / sizes.width - 0.5) * 1
  mouse.y = (event.clientY / sizes.height - 0.5) * -1
})

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

const tick = () => {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Animate camera
  camera.position.y = -(scrollY / sizes.height) * objectsDistance

  const parallaxX = mouse.x * 0.5
  const parallaxY = mouse.y * 0.5
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * easing * deltaTime
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * easing * deltaTime

  // Animate meshes
  meshes.forEach((mesh) => {
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.12
  })

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
