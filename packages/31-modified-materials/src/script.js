import './style.css'
// import * as dat from 'lil-gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import * as THREE from 'three'

/**
 * Base
 */
// const gui = new dat.GUI()

const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
}

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()
const cubeTextureLoader = new THREE.CubeTextureLoader()

/**
 * Environment map
 */
const environmentMap = cubeTextureLoader.load([
  '/textures/environmentMaps/0/px.jpg',
  '/textures/environmentMaps/0/nx.jpg',
  '/textures/environmentMaps/0/py.jpg',
  '/textures/environmentMaps/0/ny.jpg',
  '/textures/environmentMaps/0/pz.jpg',
  '/textures/environmentMaps/0/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding

scene.background = environmentMap
scene.environment = environmentMap

/**
 * Material
 */

// Textures
const mapTexture = textureLoader.load('/models/LeePerrySmith/color.jpg')
mapTexture.encoding = THREE.sRGBEncoding

const normalTexture = textureLoader.load('/models/LeePerrySmith/normal.jpg')

// Material
const material = new THREE.MeshStandardMaterial({
  map: mapTexture,
  normalMap: normalTexture,
})

const depthMaterial = new THREE.MeshDepthMaterial({
  depthPacking: THREE.RGBADepthPacking, // For better shadow precision
})

const customUniforms = {
  uTime: { value: 0 },
}

material.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
      #include <common>

      uniform float uTime;

      mat2 get2dRotationMatrix(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }
    `,
  )
  // Only the normal material has a "core" shadow which in this case also needs to be rotated.
  shader.vertexShader = shader.vertexShader.replace(
    '#include <beginnormal_vertex>',
    `
      #include <beginnormal_vertex>

      float angle = (position.y + 4.0) * sin(uTime) * 0.9;
      mat2 rotationMatrix = get2dRotationMatrix(angle);

      objectNormal.xz = objectNormal.xz * rotationMatrix;
    `,
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
      #include <begin_vertex>

      // Not needed as angle & rotationMatrix are already defined within scope
      // float angle = (position.y + uTime) * 0.9;
      // mat2 rotationMatrix = get2dRotationMatrix(angle);

      transformed.xz = transformed.xz * rotationMatrix;
    `,
  )
}

depthMaterial.onBeforeCompile = (shader) => {
  shader.uniforms.uTime = customUniforms.uTime
  shader.vertexShader = shader.vertexShader.replace(
    '#include <common>',
    `
      #include <common>

      uniform float uTime;

      mat2 get2dRotationMatrix(float _angle) {
        return mat2(cos(_angle), -sin(_angle), sin(_angle), cos(_angle));
      }
    `,
  )
  shader.vertexShader = shader.vertexShader.replace(
    '#include <begin_vertex>',
    `
      #include <begin_vertex>

      float angle = (position.y + 4.0) * sin(uTime) * 0.9;
      mat2 rotationMatrix = get2dRotationMatrix(angle);

      transformed.xz = transformed.xz * rotationMatrix;
    `,
  )
}

/**
 * Utils
 */
function updateAllMaterials() {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      child.material.envMapIntensity = 1
      child.material.needsUpdate = true
      child.castShadow = true
      child.receiveShadow = true
    }
  })
}

/**
 * Models
 */
gltfLoader.load('/models/LeePerrySmith/LeePerrySmith.glb', (gltf) => {
  // Model
  const mesh = gltf.scene.children[0]
  mesh.rotation.y = Math.PI * 0.5
  mesh.material = material
  mesh.customDepthMaterial = depthMaterial
  scene.add(mesh)

  // Update materials
  updateAllMaterials()
})

/**
 * Plane
 */
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(15, 15, 15),
  new THREE.MeshStandardMaterial(),
)
plane.rotation.y = Math.PI
plane.position.y = -5
plane.position.z = 5
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 3)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, -2.25)
scene.add(directionalLight)

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(140, sizes.width / sizes.height, 0.1, 100)
camera.position.set(4, 1, -4)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
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

  customUniforms.uTime.value = elapsedTime

  // Update controls
  controls.update()

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()
