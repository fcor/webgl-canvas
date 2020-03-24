global.THREE = require("three");
require("three/examples/js/controls/OrbitControls");
const canvasSketch = require("canvas-sketch");

const text = "Code & Pixels";
const height = 20;
const size = 70;
const hover = 30;
const curveSegments = 4;
const bevelThickness = 2;
const bevelSize = 1.5;
const bevelEnabled = true;
let font = undefined;
const fontName = "helvetiker"; // helvetiker, optimer, gentilis, droid sans, droid serif
const fontWeight = "regular"; // normal bold
let targetRotation = 0;
let targetRotationOnMouseDown = 0;
let mouseX = 0;
let mouseXOnMouseDown = 0;
const windowHalfX = window.innerWidth / 2;

const settings = {
  fps: 30,
  duration: 10,
  // Make the loop animated
  animate: true,
  // Get a WebGL canvas rather than 2D
  context: 'webgl',
  // Turn on MSAA
  attributes: { antialias: true },
};

const sketch = ({ context }) => {

  const createText = () => {

    let textGeo = new THREE.TextGeometry( text, {

      font: font,

      size: size,
      height: height,
      curveSegments: curveSegments,

      bevelThickness: bevelThickness,
      bevelSize: bevelSize,
      bevelEnabled: bevelEnabled

    } );

    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();

    // "fix" side normals by removing z-component of normals for side faces
    // (this doesn't work well for beveled geometry as then we lose nice curvature around z-axis)

    if ( ! bevelEnabled ) {

      const triangleAreaHeuristics = 0.1 * ( height * size );

      for ( const i = 0; i < textGeo.faces.length; i ++ ) {

        const face = textGeo.faces[ i ];

        if ( face.materialIndex == 1 ) {

          for ( const j = 0; j < face.vertexNormals.length; j ++ ) {

            face.vertexNormals[ j ].z = 0;
            face.vertexNormals[ j ].normalize();

          }

          const va = textGeo.vertices[ face.a ];
          const vb = textGeo.vertices[ face.b ];
          const vc = textGeo.vertices[ face.c ];

          const s = GeometryUtils.triangleArea( va, vb, vc );

          if ( s > triangleAreaHeuristics ) {

            for ( const j = 0; j < face.vertexNormals.length; j ++ ) {

              face.vertexNormals[ j ].copy( face.normal );

            }

          }

        }

      }

    }

    var centerOffset = - 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );

    textGeo = new THREE.BufferGeometry().fromGeometry( textGeo );

    textMesh1 = new THREE.Mesh( textGeo, materials );

    textMesh1.position.x = centerOffset;
    textMesh1.position.y = hover;
    textMesh1.position.z = 0;

    textMesh1.rotation.x = 0;
    textMesh1.rotation.y = Math.PI * 2;

    group.add( textMesh1 );

  }

  // Create a renderer
  const renderer = new THREE.WebGLRenderer({
    canvas: context.canvas
  });
  renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );

  // Setup a camera
  const camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 1, 1500 );
  camera.position.set( 0, 100, 800 );
  const cameraTarget = new THREE.Vector3(0, 150, 0);

  const loader = new THREE.TextureLoader();

  const map = loader.load("./img/Tiles32_col.jpg");
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2, 1).multiplyScalar(30);

  const normalMap = loader.load("./img/Tiles32_nrm.jpg");
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;
  normalMap.repeat.copy(map.repeat);

  const roughnessMap = loader.load("./img/Tiles32_rgh.jpg");
  roughnessMap.wrapS = roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.copy(map.repeat);

  // Setup a material
  const normalStrength = 0.5;
  const material = new THREE.MeshStandardMaterial({
    roughness: 0.85,
    metalness: 0.5,
    normalScale: new THREE.Vector2(1, 1).multiplyScalar(normalStrength),
    normalMap,
    map,
    roughnessMap,
  });

  const materials = [
    material,
    material,
  ];

  // Setup your scene
  const scene = new THREE.Scene();
  const group = new THREE.Group();
	group.position.y = 100;
  scene.add( group );
  scene.background = new THREE.Color( 0x000000 );
  scene.fog = new THREE.Fog( 0x000000, 250, 1400 );


  // Setup font
  const fontLoader = new THREE.FontLoader();
  fontLoader.load( 'fonts/' + fontName + '_' + fontWeight + '.typeface.json', function ( response ) {
    font = response;
    createText();
  } );

  const plane = new THREE.Mesh(
    new THREE.PlaneBufferGeometry( 10000, 10000 ),
    new THREE.MeshBasicMaterial( { color: 0xffffff, opacity: 0.5, transparent: true } )
  );
  plane.position.y = 100;
  plane.rotation.x = - Math.PI / 2;
  scene.add( plane );

  const dirLight = new THREE.DirectionalLight( 0xffffff, 0.125 );
  dirLight.position.set( 0, 0, 1 ).normalize();
  scene.add( dirLight );

  const lightGroup = new THREE.Group();
  const pointLight1 = new THREE.PointLight( 0xffffff, 1.5 );
  pointLight1.position.set( 0, 120, 120 );
  const pointLight2 = new THREE.PointLight( 0xffffff, 1.5 );
  pointLight2.position.set( 200, 120, 120 );
  const pointLight3 = new THREE.PointLight( 0xffffff, 1.5 );
  pointLight3.position.set( -200, 120, 120 );
  
  
  lightGroup.add(pointLight1);
  lightGroup.add(pointLight2);
  lightGroup.add(pointLight3);
  scene.add( lightGroup );

  document.addEventListener( 'mousedown', onDocumentMouseDown, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );

  function onDocumentMouseDown( event ) {
    event.preventDefault();
    document.addEventListener( 'mousemove', onDocumentMouseMove, false );
    document.addEventListener( 'mouseup', onDocumentMouseUp, false );
    document.addEventListener( 'mouseout', onDocumentMouseOut, false );
    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDown = targetRotation;
  }

  function onDocumentMouseMove( event ) {
    mouseX = event.clientX - windowHalfX;
    targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
  }

  function onDocumentMouseUp() {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
  }

  function onDocumentMouseOut() {
    document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
    document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
    document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
  }

  function onDocumentTouchStart( event ) {
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
      targetRotationOnMouseDown = targetRotation;
    }
  }

  function onDocumentTouchMove( event ) {
    if ( event.touches.length == 1 ) {
      event.preventDefault();
      mouseX = event.touches[ 0 ].pageX - windowHalfX;
      targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;
    }
  }

  // draw each frame
  return {
    // Handle resize events here
    resize({ pixelRatio, viewportWidth, viewportHeight }) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(viewportWidth, viewportHeight, false);
      camera.aspect = viewportWidth / viewportHeight;
      camera.updateProjectionMatrix();
    },
    // Update & render your scene here
    render({ time }) {
      const autoRotation = 0.3 * Math.sin(time * 0.7);
      group.rotation.y += ( autoRotation - group.rotation.y ) * 0.05;
			camera.lookAt( cameraTarget );
      renderer.render(scene, camera);
    },
    // Dispose of events & renderer for cleaner hot-reloading
    unload() {
      renderer.dispose();
    }
  };
};

canvasSketch(sketch, settings);
