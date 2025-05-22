import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- Global Variables ---
let scene, camera, renderer, controls;
let spaceship, donut;
let starField; // Changed from 'stars' array to a single Points object for the starfield

// --- Initialization ---
function init() {
    // Scene
    scene = new THREE.Scene();

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(-45, 45, 45); // Initial camera position

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // OrbitControls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 200;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 50, 50);
    scene.add(directionalLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.5, 300);
    pointLight.position.set(-40, -30, 30);
    scene.add(pointLight);

    // Create Spaceship
    createSpaceship();
    if (spaceship) {
        controls.target.copy(spaceship.position); // Orbit controls target the spaceship
    }

    // Create Stars
    createStars();

    // Event Listeners
    window.addEventListener('resize', onWindowResize, false);
}

// --- Create Donut ---
function createDonut() {
    const donutGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
    const donutMaterial = new THREE.MeshPhongMaterial({ color: 0x5C3A21, shininess: 50 });
    donut = new THREE.Mesh(donutGeometry, donutMaterial);
    donut.rotation.x = Math.PI / 2; // Rotate to face the camera
    donut.position.set(100, 40, 40); // Position it in front of the spaceship
    scene.add(donut);
    showDonut = true; // Set the flag to true to show the donut
    removeDonutAfterDelay(); // Call the function to remove the donut after a delay
}

function removeDonut() {
  scene.remove(donut);
  donut = null; // Set donut to null to indicate it's removed
  showDonut = false; // Set the flag to false to hide the donut
}

// Function to call removeDonut after 15 seconds
function removeDonutAfterDelay() {
  setTimeout(() => {
    removeDonut();
  }, 15000);
}

// --- Create Spaceship ---
function createSpaceship() {
    spaceship = new THREE.Group();

    // Body (Cone)
    const bodyGeometry = new THREE.ConeGeometry(5, 20, 32);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xcccccc, flatShading: false, shininess: 80 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2; // Pointing the nose of the cone along parent's +Z axis
    spaceship.add(body);

    // Cockpit (Sphere)
    const cockpitGeometry = new THREE.SphereGeometry(3, 32, 32);
    const cockpitMaterial = new THREE.MeshPhongMaterial({
        color: 0x3399ff, transparent: true, opacity: 0.7, shininess: 100, reflectivity: 0.8
    });
    const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
    cockpit.position.y = 5; // Position relative to spaceship group center
    spaceship.add(cockpit);

    // Engine (Cylinder)
    const engineGeometry = new THREE.CylinderGeometry(2.5, 2, 5, 32);
    const engineMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, shininess: 50 });
    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.y = -11; // Position relative to spaceship group center
    engine.rotation.x = Math.PI / 2;
    spaceship.add(engine);

    // Engine Glow
    const engineGlowGeometry = new THREE.CylinderGeometry(1.8, 1.8, 4, 32);
    const engineGlowMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc33 });
    const engineGlow = new THREE.Mesh(engineGlowGeometry, engineGlowMaterial);
    engineGlow.position.y = -12.5; // Position relative to spaceship group center
    engineGlow.rotation.x = Math.PI / 2;
    spaceship.add(engineGlow);

    // Wings
    const wingGeometry = new THREE.BoxGeometry(16, 1.5, 5);
    const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xbbbbbb, shininess: 60 });

    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(-8.5, 0, 0);
    leftWing.rotation.z = Math.PI / 20;
    leftWing.rotation.y = -Math.PI / 10;
    spaceship.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
    rightWing.position.set(8.5, 0, 0);
    rightWing.rotation.z = -Math.PI / 20;
    rightWing.rotation.y = Math.PI / 10;
    spaceship.add(rightWing);

    spaceship.scale.set(0.5, 0.5, 0.5);
    scene.add(spaceship); // Add the whole spaceship group to the scene
}

// --- Create Stars ---
function createStars() {
    const starVertices = [];
    const numStars = 10000;
    const starSpread = 2000; // Stars will be spread in a cube of this size (e.g., -1000 to 1000)

    for (let i = 0; i < numStars; i++) {
        const x = THREE.MathUtils.randFloatSpread(starSpread);
        const y = THREE.MathUtils.randFloatSpread(starSpread);
        const z = THREE.MathUtils.randFloatSpread(starSpread);
        starVertices.push(x, y, z);
    }

    const starsGeometry = new THREE.BufferGeometry();
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        sizeAttenuation: true // Points get smaller further away
    });

    starField = new THREE.Points(starsGeometry, starsMaterial); // Assign to global starField
    scene.add(starField);
}

// --- Event Handlers ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

let movementSpeed = 0.2; // How fast the donut moves
let movementDirection = -1; // 1 for right, -1 for left
let showDonut = false; // Boolean to control donut visibility

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (showDonut) {
      if (!donut) {
        createDonut(); // Create the donut if it doesn't exist
      }
      // Update the donut's position
      donut.position.x += movementSpeed * movementDirection; // Changed 'cube' to 'donut'
      // Optional: Add a little rotation to the donut for visual interest
      donut.rotation.x += 0.01;
      donut.rotation.y += 0.005;
    }

    // Spaceship Animation (subtle movements)
    // if (spaceship) {
        // spaceship.rotation.y += 0.002; // Slow yaw (rotation around its Y-axis) - REMOVED FOR STATIC SPACESHIP
    // }

    // Star Movement (illusion of forward motion)
    if (starField) {
        const positions = starField.geometry.attributes.position;
        const starSpeed = 0.1; // Adjust this value to change the speed of stars
        const Z_EXTENT = 1000; // Half of the starSpread, defines the boundary for wrapping

        for (let i = 0; i < positions.count; i++) {
            // Move star along the negative Z-axis (towards the camera if ship is facing +Z)
            positions.array[i * 3 + 2] -= starSpeed;

            // If a star's Z position moves beyond the negative extent,
            // wrap it around to the positive extent and re-randomize X and Y.
            if (positions.array[i * 3 + 2] < -Z_EXTENT) {
                positions.array[i * 3 + 2] += 2 * Z_EXTENT; // Wrap Z to the far end (+Z_EXTENT)
                // Re-randomize X and Y to prevent stars from reappearing in the same lateral positions,
                // making the starfield feel more infinite and less repetitive.
                positions.array[i * 3] = THREE.MathUtils.randFloatSpread(2 * Z_EXTENT);     // X
                positions.array[i * 3 + 1] = THREE.MathUtils.randFloatSpread(2 * Z_EXTENT); // Y
            }
        }
        positions.needsUpdate = true; // Crucial: informs Three.js that the geometry has changed
    }

    controls.update(); // Required if enableDamping is true
    renderer.render(scene, camera);
}

// --- Start ---
init();
animate();

function triggerShowDonut() {
  showDonut = true;
}
// export the donut to the global namespace
window.triggerShowDonut = triggerShowDonut;

// attach event listener to add donut to scene and show
document.getElementById('createDonut').addEventListener('click', () => {
  triggerShowDonut();
});

// attach event listener to remove donut from scene and hide
document.getElementById('removeDonut').addEventListener('click', () => {
  removeDonut();
});