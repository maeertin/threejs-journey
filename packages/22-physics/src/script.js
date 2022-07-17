import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'

/**
 * Base
 */
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()
const world = new CANNON.World()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}
let objectsToUpdate = []

/**
 * Debug
 */
const gui = new dat.GUI()
const debugObject = {}

debugObject.createSphere = () => {
  createSphere(Math.random() * 0.5 + 0.1, {
    x: Math.random() * 3,
    y: 3,
    z: Math.random() * 3,
  })
}
gui.add(debugObject, 'createSphere')

debugObject.createBox = () => {
  createBox(Math.random(), Math.random(), Math.random(), {
    x: Math.random() * 3,
    y: 3,
    z: Math.random() * 3,
  })
}
gui.add(debugObject, 'createBox')

debugObject.reset = () => {
  objectsToUpdate.forEach((obj) => {
    obj.body.removeEventListener('collide', onBodyCollide)
    world.removeBody(obj.body)
    scene.remove(obj.mesh)
  })
  objectsToUpdate = []
}
gui.add(debugObject, 'reset')

/**
 * Sounds
 */
const hitSound = new Audio('/sounds/hit.mp3')
let hitSoundDelay = null

function onBodyCollide(event) {
  const collisionStrength = event.contact.getImpactVelocityAlongNormal()
  const collisionVolume = Math.min(Math.max(collisionStrength, 1), 10) / 10

  if (!hitSoundDelay && collisionStrength > 1) {
    hitSound.volume = collisionVolume
    hitSound.currentTime = 0
    hitSound.play()

    hitSoundDelay = setTimeout(() => {
      hitSoundDelay = null
    }, 50)
  }
}

/**
 * Textures
 */
// const textureLoader = new THREE.TextureLoader()
// const cubeTextureLoader = new THREE.CubeTextureLoader()

// const environmentMapTexture = cubeTextureLoader.load([
//   '/textures/environmentMaps/0/px.png',
//   '/textures/environmentMaps/0/nx.png',
//   '/textures/environmentMaps/0/py.png',
//   '/textures/environmentMaps/0/ny.png',
//   '/textures/environmentMaps/0/pz.png',
//   '/textures/environmentMaps/0/nz.png',
// ])

/**
 * Physics
 */
world.broadphase = new CANNON.SAPBroadphase(world) // Performance
world.allowSleep = true
world.gravity.set(0, -9.82, 0)

// const concreteMaterial = new CANNON.Material('concrete')
// const plasticMaterial = new CANNON.Material('plastic')
// const concretePlasticContactMaterial = new CANNON.ContactMaterial(
//   concreteMaterial,
//   plasticMaterial,
//   {
//     friction: 0.1,
//     restitution: 0.7,
//   },
// )

const defaultMaterial = new CANNON.Material('default')
const defaultContactMaterial = new CANNON.ContactMaterial(defaultMaterial, defaultMaterial, {
  friction: 0.1,
  restitution: 0.7,
})
world.addContactMaterial(defaultContactMaterial)
world.defaultContactMaterial = defaultContactMaterial

// const sphereShape = new CANNON.Sphere(0.5)
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   position: new CANNON.Vec3(0, 3, 0),
//   shape: sphereShape,
//   // material: defaultMaterial,
// })
// sphereBody.applyLocalForce(new CANNON.Vec3(150, 0, 0), new CANNON.Vec3(0, 0, 0))
// world.addBody(sphereBody)

const floorShape = new CANNON.Plane()
const floorBody = new CANNON.Body({
  mass: 0,
  shape: floorShape,
  // material: defaultMaterial,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(-1, 0, 0), Math.PI * 0.5)
world.addBody(floorBody)

/**
 * Test sphere
 */
// const sphere = new THREE.Mesh(
//   new THREE.SphereGeometry(0.5, 32, 32),
//   new THREE.MeshStandardMaterial({
//     metalness: 0.3,
//     roughness: 0.4,
//     envMap: environmentMapTexture,
//     envMapIntensity: 0.5,
//   }),
// )
// sphere.castShadow = true
// sphere.position.y = 0.5
// scene.add(sphere)

/**
 * Floor
 */
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial({
    color: '#777777',
    metalness: 0.3,
    roughness: 0.4,
    // envMap: environmentMapTexture,
    envMapIntensity: 0.5,
  }),
)
floor.receiveShadow = true
floor.rotation.x = -Math.PI * 0.5
scene.add(floor)

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2)
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
camera.position.set(-5, 5, 5)
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
 * Utils
 */
const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20)
const boxGeometry = new THREE.BoxBufferGeometry(1, 1, 1)
const meshMaterial = new THREE.MeshStandardMaterial({
  metalness: 0.3,
  roughness: 0.4,
  // envMap: environmentMapTexture,
})

function createSphere(radius, position) {
  // Three.js mesh
  const mesh = new THREE.Mesh(sphereGeometry, meshMaterial)
  mesh.scale.set(radius, radius, radius)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // Cannon.js body
  const shape = new CANNON.Sphere(radius)
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position)
  body.addEventListener('collide', onBodyCollide)
  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

function createBox(width, height, depth, position) {
  // Three.js mesh
  const mesh = new THREE.Mesh(boxGeometry, meshMaterial)
  mesh.scale.set(width, height, depth)
  mesh.castShadow = true
  mesh.position.copy(position)
  scene.add(mesh)

  // Cannon.js body
  const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2))
  const body = new CANNON.Body({
    mass: 1,
    position: new CANNON.Vec3(0, 3, 0),
    shape,
    material: defaultMaterial,
  })
  body.position.copy(position)
  body.addEventListener('collide', onBodyCollide)
  world.addBody(body)

  objectsToUpdate.push({ mesh, body })
}

createSphere(0.5, { x: 0, y: 3, z: 0 })

/**
 * Animate
 */
const clock = new THREE.Clock()
let previousTime = 0

function tick() {
  const elapsedTime = clock.getElapsedTime()
  const deltaTime = elapsedTime - previousTime
  previousTime = elapsedTime

  // Update physics world
  // sphereBody.applyForce(new CANNON.Vec3(-0.5, 0, 0), sphereBody.position)

  world.step(1 / 60, deltaTime, 3)

  objectsToUpdate.forEach((obj) => {
    obj.mesh.position.copy(obj.body.position)
    obj.mesh.quaternion.copy(obj.body.quaternion)
  })

  // Update three world
  // sphere.position.copy(sphereBody.position)

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
