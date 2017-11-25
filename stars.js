var container;
var count = 0;
var camera, scene, renderer, particles, geometry, i, h, color;
var shaderMaterial, metalMaterial;
var mouseX = 0, mouseY = 0;
var spheres = [];
var centers;
var clock;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

init();
animate();

function marsaglia() {
  var x1 = Math.random() * 2.0 - 1.0;
  var x2 = Math.random() * 2.0 - 1.0;

  // Marsaglia's method
  while (x1 * x1 + x2 * x2 > 1) {
    x1 = Math.random() * 2.0 - 1.0;
    x2 = Math.random() * 2.0 - 1.0;
  }
  var x = 2 * x1 * Math.sqrt(1 - x1 * x1 - x2 * x2);
  var y = 2 * x2 * Math.sqrt(1 - x1 * x1 - x2 * x2);
  var z = (1 - 2 * (x1 * x1 + x2 * x2));
  return {x: x, y: y, z: z};
}

function createSphere(n, size, angle, speed) {
  var clouds = n;
  var stars = n;

  var vertices = new Float32Array((clouds + stars) * 3);
  var colors = new Float32Array((clouds + stars) * 3);
  var alphas = new Float32Array((clouds + stars) * 1);
  var sizes = new Float32Array((clouds + stars) * 1);
  var centers = new Float32Array((clouds + stars) * 3);

  var r1 = 1.0;
  var g1 = 1.0;
  var b1 = 0.9;

  var r2 = 0;
  var g2 = 140 / 255;
  var b2 = 186 / 255;

  var oz = Math.random() * 400.0 - 200.0;

  for (i = 0; i < clouds; ++i) {
    var f = (clouds - i) / clouds;
    var g = i / clouds;
    var x1 = Math.random() * 2.0 - 1.0;
    var x2 = Math.random() * 2.0 - 1.0;

    // Marsaglia's method
    while (x1 * x1 + x2 * x2 > 1) {
      x1 = Math.random() * 2.0 - 1.0;
      x2 = Math.random() * 2.0 - 1.0;
    }

    var r = size;//Math.random() * size + size / 4;
    var x = r * 2 * x1 * Math.sqrt(1 - x1 * x1 - x2 * x2);
    var y = r * 2 * x2 * Math.sqrt(1 - x1 * x1 - x2 * x2);
    var z = r * (1 - 2 * (x1 * x1 + x2 * x2));

    vertices[i * 3 + 0] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;

    var c = Math.random();
    colors[i * 3 + 0] = c * r1 + (1.0 - c) * r2;
    colors[i * 3 + 1] = c * g1 + (1.0 - c) * g2;
    colors[i * 3 + 2] = c * b1 + (1.0 - c) * b2;

    alphas[i] = 0.25;
    sizes[i] = 0.5 * size;

    centers[i * 3 + 0] = 0;
    centers[i * 3 + 1] = 0;
    centers[i * 3 + 2] = oz;
  }

  for (i = clouds; i < clouds + stars; ++i) {
    var f = (clouds + stars - i) / (clouds + stars);
    var g = i / (clouds + stars);
    var a = Math.random() * 3.14159 * 2.0;

    x = vertices[(i - clouds) * 3 + 0];
    y = vertices[(i - clouds) * 3 + 1];
    z = vertices[(i - clouds) * 3 + 2];

    vertices[i * 3 + 0] = x;
    vertices[i * 3 + 1] = y;
    vertices[i * 3 + 2] = z;

    colors[i * 3 + 0] = 1.0;
    colors[i * 3 + 1] = 1.0;
    colors[i * 3 + 2] = 1.0;

    var s = Math.pow(512.0, Math.pow(f * Math.random(), 0.3));
    alphas[i] = 1.0;//Math.pow(alphas[i - clouds], 0.5);
    //alphas[i] = 1.0;//0.2 + Math.random() * 0.8;
    sizes[i] = size / 32.0;//Math.random() * Math.random() * 8.0;
    centers[i * 3 + 0] = centers[(i - clouds) * 3 + 0];
    centers[i * 3 + 1] = centers[(i - clouds) * 3 + 1];
    centers[i * 3 + 2] = centers[(i - clouds) * 3 + 2];
  }

  return {
    speed: speed,
    angle: angle,
    vertices: vertices,
    colors: colors,
    alphas: alphas,
    sizes: sizes,
    centers: centers
  };
}

function init() {
  THREE.ImageUtils.crossOrigin = '';
  container = document.createElement('div');
  document.body.appendChild(container);

  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
  scene = new THREE.Scene();

  clock = new THREE.Clock();
  clock.start();

  var nvertices = 0;
  var ncolors = 0;
  var nalphas = 0;
  var nsizes = 0;
  var ncenters = 0;

  for (var i = 0; i < 32; ++i) {
    //var position = marsaglia();
    //var x = position.x * spread;
    //var y = position.y * spread;
    var angle = Math.random() * 3.14159 * 2.0;
    var s = Math.round(Math.random() * 5) * 20 + 20;
    var speed = 10.0 / s + 0.1 * Math.random();
    var n = Math.round(Math.pow(s, 1.1));
    var sphere = createSphere(n, s, angle, speed);
    spheres[i] = sphere;
    nvertices += sphere.vertices.length;
    ncolors += sphere.colors.length;
    nalphas += sphere.alphas.length;
    nsizes += sphere.sizes.length;
    ncenters += sphere.centers.length;
  }
  geometry = new THREE.Geometry();

  var vertices = new Float32Array(nvertices);
  var colors = new Float32Array(ncolors);
  var alphas = new Float32Array(nalphas);
  var sizes = new Float32Array(nsizes);
  centers = new Float32Array(ncenters);
  var ivertices = 0;
  var icolors = 0;
  var ialphas = 0;
  var isizes = 0;
  var icenters = 0;

  for (var i = 0; i < spheres.length; ++i) {
    for (var j = 0; j < spheres[i].vertices.length; ++j) {
      vertices[ivertices++] = spheres[i].vertices[j];
    }
    for (var j = 0; j < spheres[i].colors.length; ++j) {
      colors[icolors++] = spheres[i].colors[j];
    }
    for (var j = 0; j < spheres[i].alphas.length; ++j) {
      alphas[ialphas++] = spheres[i].alphas[j];
    }
    for (var j = 0; j < spheres[i].sizes.length; ++j) {
      sizes[isizes++] = spheres[i].sizes[j];
    }
    for (var j = 0; j < spheres[i].centers.length; ++j) {
      //centers[icenters++] = spheres[i].centers[j];
    }
  }

  var bufferGeometry = new THREE.BufferGeometry();
  var centerAttribute = new THREE.BufferAttribute(centers, 3);
  centerAttribute.dynamic = true;
  bufferGeometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
  bufferGeometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));
  bufferGeometry.addAttribute('alpha', new THREE.BufferAttribute(alphas, 1));
  bufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
  bufferGeometry.addAttribute('center', centerAttribute);

  var cameraPosition = new Float32Array(3);
  cameraPosition[0] = 0;//camera.position.x;
  cameraPosition[1] = 0;//camera.position.y;
  cameraPosition[2] = 0;//camera.position.z;

  uniforms = {
    texture: { type: "t", value: THREE.ImageUtils.loadTexture('sphere.png') },
    uCameraPos: { type: "3f", value: cameraPosition },
    uReflection: { type: "1f", value: 0.0 }
  };

  shaderMaterial = new THREE.ShaderMaterial({
    uniforms:       uniforms,
    vertexShader:   document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    transparent:    true,
    depthTest:      true,
    depthWrite:     false,
    blending:       THREE.AdditiveBlending
  });

  particles = new THREE.Points(bufferGeometry, shaderMaterial);
  scene.add(particles);

  cubeCamera1 = new THREE.CubeCamera(1, 10000, 1024);
  cubeCamera1.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(cubeCamera1);

  cubeCamera2 = new THREE.CubeCamera(1, 10000, 1024);
  cubeCamera2.renderTarget.texture.minFilter = THREE.LinearMipMapLinearFilter;
  scene.add(cubeCamera2);

  var baseColor = new THREE.Color(0, 140 / 255, 186 / 255);
  metalMaterial = new THREE.MeshStandardMaterial({
    //color: baseColor,
    emissive: baseColor,
    emissiveIntensity: 0.1,
    envMap: cubeCamera2.renderTarget.texture,
    metalness: 0.9,
    roughness: 0
  });

  //cube = new THREE.Mesh(new THREE.BoxBufferGeometry(512.0, 16.0, 128.0), metalMaterial);
  //scene.add(cube);

  var loader = new THREE.FontLoader();
  loader.load('IndustryInc.json', function (font) {
    textGeo = new THREE.TextBufferGeometry('Nitor', {
      font: font,
      size: 100,
      height: 20,
      curveSegments: 4,
      bevelThickness: 2,
      bevelSize: 2,
      bevelEnabled: true,
      material: 0,
      extrudeMaterial: 1
    });
    textGeo.computeBoundingBox();
    textGeo.computeVertexNormals();
    var centerOffset = 0.5 * ( textGeo.boundingBox.max.x - textGeo.boundingBox.min.x );
    var halfHeight = 0.5 * (textGeo.boundingBox.max.y - textGeo.boundingBox.min.y);
    textMesh1 = new THREE.Mesh( textGeo, metalMaterial );
    textMesh1.position.x = centerOffset;
    textMesh1.position.y = 0;
    textMesh1.position.z = -halfHeight;
    textMesh1.rotation.x = Math.PI * 0.5;
    textMesh1.rotation.y = Math.PI;
    scene.add(textMesh1);
  });

  var ambientlight = new THREE.AmbientLight(0xffffff);
  scene.add(ambientlight);

  var pointLight = new THREE.PointLight(0xffffe0, 0.5, 10000);
  pointLight.position.set(0, 500, 50);
  scene.add(pointLight);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('touchmove', onDocumentTouchMove, false);

  window.addEventListener('resize', onWindowResize, false);
}

function onDocumentMouseMove(event) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentTouchMove(event) {
  if (event.touches.length === 1) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onWindowResize(event) {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  var spread = 1024;
  var icenters = 0;

  var pcenters = particles.geometry.attributes.center.array;
  var t = clock.getElapsedTime();
  for (i = 0; i < spheres.length; ++i) {
    var angle = (spheres[i].angle * 3.14159 * 2.0 + spheres[i].speed * t * 3.14159 * 2.0 / 10) % (3.14159 * 2.0);
    var x = 0.6 * Math.cos(angle) * spread;
    var y = 0.6 * Math.sin(angle) * spread;

    for (var j = 0; j < spheres[i].centers.length / 3; ++j) {
      pcenters[icenters + j * 3 + 0] = x;
      pcenters[icenters + j * 3 + 1] = y;
      pcenters[icenters + j * 3 + 2] = spheres[i].centers[j * 3 + 2];
    }
    icenters += spheres[i].centers.length;
  }
  //console.log(particles.geometry.attributes.center);
  particles.geometry.attributes.center.needsUpdate = true;

  var a = 2 * mouseX / windowHalfX;
  var b = 2 * mouseY / windowHalfY;
  var x = 0.0;
  var y = 500;
  var z = 1000 * b;

  camera.position.x = x * Math.cos(a) - y * Math.sin(a);
  camera.position.y = - x * Math.sin(a) + y * Math.cos(a);
  camera.position.z = z;

  camera.lookAt(scene.position);
  camera.rotation.order = 'XYZ';
  camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), a / 10.0);
  camera.up = new THREE.Vector3(0, 0, 1);

  render();
}

function render() {
  var cameraPosition = new Float32Array(3);
  cameraPosition[0] = camera.position.x;
  cameraPosition[1] = camera.position.y;
  cameraPosition[2] = camera.position.z;

  shaderMaterial.uniforms.uCameraPos.value = cameraPosition;

  if (count % 2 === 0) {
    metalMaterial.envMap = cubeCamera1.renderTarget.texture;
    shaderMaterial.uniforms.uReflection.value = camera.position.distanceTo(0, 0, 0);
    cubeCamera2.update(renderer, scene);
  } else {
    metalMaterial.envMap = cubeCamera2.renderTarget.texture;
    shaderMaterial.uniforms.uReflection.value = camera.position.distanceTo(0, 0, 0);
    cubeCamera1.update(renderer, scene);
  }
  ++count;

  shaderMaterial.uniforms.uReflection.value = 0.0;

  renderer.render(scene, camera);
}
