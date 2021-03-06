const canvasSketch = require('canvas-sketch');

// Ensure ThreeJS is in global scope for the 'examples/'
global.THREE = require('three');

// Include any additional ThreeJS examples below
require('three/examples/js/controls/OrbitControls');

const settings = {
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true }
};

const sketch = ({ context }) => {
  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    context
  });

  // WebGL background color
  renderer.setClearColor('#000', 1);

  // Setup a camera
  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100);
  camera.position.set(3, 3, -5);
  camera.lookAt(new THREE.Vector3());

  // Setup camera controller
  const controls = new THREE.OrbitControls(camera, context.canvas);

  // Setup your scene
  const scene = new THREE.Scene();

  const textureLoader = new THREE.TextureLoader();

  const sphereGeometry = new THREE.SphereGeometry(1, 32, 16);

  const earthTexture = textureLoader.load("earth.jpg");
  const moonTexture = textureLoader.load("moon.jpg");

  const earthMesh = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0,
      map: earthTexture,
    })
  );
  scene.add(earthMesh);


  const moonGroup = new THREE.Group();
  const moonMesh = new THREE.Mesh(
    sphereGeometry,
    new THREE.MeshStandardMaterial({
      roughness: 1,
      metalness: 0,
      map: moonTexture,
    })
  );
  moonGroup.add(moonMesh);
  scene.add(moonGroup);

  moonMesh.position.set(1.5, 1, 0);
  moonMesh.scale.setScalar(0.25);

  // Specify an ambient/unlit colour
  scene.add(new THREE.AmbientLight('#59314f'));

  // Add some light
  const light = new THREE.PointLight('white', 2);
  light.position.set(2.5, 2.5, 2.5)
  scene.add(light);
  scene.add(new THREE.PointLightHelper(light, 0.5));

  // draw each frame
  return {
    // Handle resize events here
    resize ({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render ({ time }) {
      earthMesh.rotation.y = time * 0.15;
      moonMesh.rotation.y = time * 0.075;
      moonGroup.rotation.y = time * 0.5;
      controls.update();
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload () {
      controls.dispose();
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
