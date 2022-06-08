import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js'
import * as dat from 'dat.gui'

// Scene
const canvas = document.querySelector('canvas.webgl')
const scene = new THREE.Scene()

// Geometries
const geometry = new THREE.TorusGeometry( .7, .2, 16, 100 );

// Materials
const material = new THREE.MeshStandardMaterial()
material.color = new THREE.Color(0xff0000)

const metalness = .7
const roughness = .05
const cubeTextureLoader = new THREE.CubeTextureLoader()
const environmentMapTexture = cubeTextureLoader
    .setPath('textures/environmentMaps/0/')
    .load([
	'px.png',
	'nx.png',
	'py.png',
	'ny.png',
	'pz.png',
	'nz.png',
]) 

const metalMaterial = new THREE.MeshStandardMaterial( {
    color: 0xffffff,
    roughness,
    metalness,
    envMap: environmentMapTexture,
} );

// Mesh
const torus = new THREE.Mesh(geometry,material)
scene.add(torus)
const objectsToTest = [torus]

// Import Models
const models = []
const gltfLoader = new GLTFLoader()
gltfLoader.load('models/celtiberian-logo.glb',
gltf => {
    const children = [...gltf.scene.children]
    for( const child of children){
        child.material = metalMaterial;
        child.rotation.x = Math.PI/2;
        child.receiveShadow = true
        child.castShadow = true
        objectsToTest.push(child)
        scene.add(child)
}
});

// Lights
const pointLight = new THREE.PointLight(0xffffff, 0.2)
pointLight.position.x = 2
pointLight.position.y = 3
pointLight.position.z = 4
pointLight.castShadow = true
scene.add(pointLight)

const rectAreaLightRed = new THREE.RectAreaLight(0xFF4F00, 20, .75, .75)
rectAreaLightRed.position.x = .5
rectAreaLightRed.position.y = .5
rectAreaLightRed.position.z = 1
rectAreaLightRed.rotation.x = 2
rectAreaLightRed.rotation.y = 2.5
scene.add(rectAreaLightRed)

const rectAreaLightBlue = new THREE.RectAreaLight(0x00BCFF, 18, .75, .75)
rectAreaLightBlue.position.x = -.5
rectAreaLightBlue.position.y = -.5
rectAreaLightBlue.position.z = 1
rectAreaLightBlue.rotation.x = -2
rectAreaLightBlue.rotation.y = -2.5
scene.add(rectAreaLightBlue)

const redLightHelper = new RectAreaLightHelper(rectAreaLightRed)
redLightHelper.visible = false
scene.add(redLightHelper)

const blueLightHelper = new RectAreaLightHelper(rectAreaLightBlue)
blueLightHelper.visible = false
scene.add(blueLightHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
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
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 1
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Raycaster
 */
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()
window.addEventListener('click', (event) =>{
    mouse.x = event.clientX / sizes.width * 2 - 1
    mouse.y = - (event.clientY / sizes.height) * 2 + 1
    raycaster.setFromCamera(mouse, camera) 
	const intersects = raycaster.intersectObjects(objectsToTest)
    intersects.forEach((mesh) => {mesh.object.material.wireframe = !mesh.object.material.wireframe
    console.log(models)}
    )

})

/**
 * Renderer
 */

 const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Debug
 */
const gui = new dat.GUI()

const torusFolder = gui.addFolder('torus')
const torusPositionFolder = torusFolder.addFolder('Position')
const torusRotationFolder = torusFolder.addFolder('Rotation')
torusPositionFolder.add(torus.position, 'x').min(-1).max(1).step(0.01).name('X')
torusPositionFolder.add(torus.position, 'y').min(-1).max(1).step(0.01).name('Y')
torusPositionFolder.add(torus.position, 'z').min(-1).max(1).step(0.01).name('Z')

torusRotationFolder.add(torus.rotation, 'x').min(-1).max(1).step(0.01).name('X')
torusRotationFolder.add(torus.rotation, 'y').min(-1).max(1).step(0.01).name('Y')
torusRotationFolder.add(torus.rotation, 'z').min(-1).max(1).step(0.01).name('Z')

const metalFolder = gui.addFolder('Metal material')
metalFolder.add(metalMaterial, 'metalness').min(0).max(1).step(0.01).name('Metalness') 
metalFolder.add(metalMaterial, 'roughness').min(0).max(1).step(0.01).name('Roughness')

const redLightFolder = gui.addFolder('Red Light')
redLightFolder.add(rectAreaLightRed.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1).name('X rotation')
redLightFolder.add(rectAreaLightRed.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name('Y rotation')
redLightFolder.add(rectAreaLightRed.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1).name('Z rotation')
redLightFolder.add(rectAreaLightRed, 'intensity').min(0).max(20).step(0.1).name('Intensity')
redLightFolder.add(redLightHelper, 'visible').name('Helper')

const blueLightFolder = gui.addFolder('Blue Light')
blueLightFolder.add(rectAreaLightBlue.rotation, 'x').min(-Math.PI).max(Math.PI).step(0.1).name('X rotation')
blueLightFolder.add(rectAreaLightBlue.rotation, 'y').min(-Math.PI).max(Math.PI).step(0.1).name('Y rotation')
blueLightFolder.add(rectAreaLightBlue.rotation, 'z').min(-Math.PI).max(Math.PI).step(0.1).name('Z rotation')
blueLightFolder.add(rectAreaLightBlue, 'intensity').min(0).max(20).step(0.1).name('Intensity')
blueLightFolder.add(blueLightHelper, 'visible').name('Helper')

const shadowsFolder = gui.addFolder('Shadows')
shadowsFolder.add(renderer.shadowMap, 'enabled').name('Activate render shadows')
shadowsFolder.add(torus, 'castShadow').name('Cast torus')
shadowsFolder.add(torus, 'receiveShadow').name('Receive torus')

/**
 * Animate 
 */
const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()

    // Update objects
    torus.rotation.y = .5 * elapsedTime

    // Update Orbital Controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()