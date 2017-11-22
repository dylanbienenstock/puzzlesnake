window.snake = {};

$(setup);
$(window).resize(resize);
$(window).mousemove(mousemove);

window.snake.segments = [];
window.snake.wireframeSegments = [];
window.snake.ghostSegments = [ [], [], [], [] ];
window.snake.hypotenuse = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);
window.snake.mouse = new THREE.Vector2();
window.snake.intersected = null;

function setup() {
$("body").on("mousedown", "*", mousedown);

	window.snake.scene = new THREE.Scene();
	window.snake.scene.background = new THREE.CubeTextureLoader()
		.setPath("img/envmap/sahara_")
		.load([
			"ft.png",
			"bk.png",
			"up.png",
			"dn.png",
			"rt.png",
			"lf.png"
		]);

	window.snake.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
	window.snake.camera.position.z = 5;

	window.snake.renderer = new THREE.WebGLRenderer()
	window.snake.renderer.setPixelRatio( window.devicePixelRatio);
	window.snake.renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(window.snake.renderer.domElement);

	window.snake.controls = new THREE.TrackballControls(window.snake.camera);
	window.snake.controls.rotateSpeed = 1.5;
	window.snake.controls.zoomSpeed = 1.2;
	window.snake.controls.panSpeed = 0.8;
	window.snake.controls.noZoom = false;
	window.snake.controls.noPan = false;
	window.snake.controls.staticMoving = true;
	window.snake.controls.dynamicDampingFactor = 0.3;

	window.snake.scene.add(window.snake.camera);
	window.snake.scene.add(new THREE.AmbientLight(0x404040));

	var light = new THREE.PointLight(0xffffff, 1.2); 
	light.position.set(0, 0, 0); 

	window.snake.camera.add(light);

	window.snake.raycaster = new THREE.Raycaster();

	createSnake(0x222222, 0x00AA00);

	render();
}

function resize() {
	window.snake.camera.aspect = window.innerWidth / window.innerHeight;
    window.snake.camera.updateProjectionMatrix();

    window.snake.renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {
	window.requestAnimationFrame(render);

	window.snake.controls.update();

	raycast();

	window.snake.renderer.render(window.snake.scene, window.snake.camera);
}

function raycast() {
	window.snake.raycaster.setFromCamera(window.snake.mouse, window.snake.camera);

	var intersects = window.snake.raycaster.intersectObjects(window.snake.segments, true);
	var childIndex = 2;

	if (intersects.length > 0) {
		if (window.snake.intersected != intersects[0].object) {
			if (window.snake.intersected) {
				window.snake.intersected.material.emissive.setHex(window.snake.intersected.currentHex);
			}

			window.snake.intersected = intersects[0].object;
			window.snake.intersected.currentHex = window.snake.intersected.material.emissive.getHex();
			window.snake.intersected.material.emissive.setHex(0x888888);
		}
	} else {
		if (window.snake.intersected != undefined) {
			window.snake.intersected.material.emissive.setHex(window.snake.intersected.currentHex);
		}

		window.snake.intersected = null;
	}
}

function mousemove(event) {
	event.preventDefault();

	window.snake.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	window.snake.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function mousedown() {
	if (window.snake.intersected != undefined) {
		rotateSnakeSegment(window.snake.intersected.index, 90);
	}
}

function rotateSnakeSegment(index, degrees) {
	window.snake.segments[index].rotateOnAxis(window.snake.segments[index].jointAngle, degrees * Math.PI / 180);
}

function createSnake(color1, color2) {
	window.snake.scene.remove(window.snake.segments[0]);
	window.snake.segments.length = 0;

	var color1 = new THREE.Color(color1);
	var color2 = new THREE.Color(color2);
	var alt = false;
	var lastSegment;

	for (var i = 0; i < 24; i++) {
		var segment = createSnakeSegment(color1, color2, alt);
		segment.index = i;
		segment.position.x = window.snake.hypotenuse;
		segment.position.y = alt ? -window.snake.hypotenuse : window.snake.hypotenuse;

		if (lastSegment != undefined) {
			lastSegment.add(segment);
		} else {
			segment.position.x -= 8;
			window.snake.scene.add(segment);
		}

		window.snake.segments.push(segment);

		alt = !alt;
		lastSegment = segment;
	}
}

var lastGeometry;

function createSnakeSegment(color1, color2, alt) {
	var geometry = new THREE.Geometry();

	geometry.vertices = [
		new THREE.Vector3(-0.5, -0.5, -0.5),
		new THREE.Vector3(-0.5, 0.5, -0.5),
		new THREE.Vector3(0.5, -0.5, -0.5),
		new THREE.Vector3(0.5, 0.5, -0.5),
		new THREE.Vector3(-0.5, -0.5, 0.5),
		new THREE.Vector3(0.5, -0.5, 0.5)
	];

	geometry.faces = [
		new THREE.Face3(0, 1, 2, null, alt ? color2 : color1),
		new THREE.Face3(3, 2, 1, null, alt ? color2 : color1),
		new THREE.Face3(4, 0, 5, null, alt ? color2 : color1),
		new THREE.Face3(5, 0, 2, null, alt ? color2 : color1),
		new THREE.Face3(3, 1, 4, null, alt ? color1 : color2),
		new THREE.Face3(3, 4, 5, null, alt ? color1 : color2),
		new THREE.Face3(2, 3, 5, null, alt ? color2 : color1),
		new THREE.Face3(1, 0, 4, null, alt ? color2 : color1)
	];

	geometry.applyMatrix(new THREE.Matrix4().makeRotationY(90 * Math.PI / 180));
	geometry.applyMatrix(new THREE.Matrix4().makeRotationZ((alt ? 225 : 45) * Math.PI / 180));

	geometry.computeFaceNormals();

	var material = new THREE.MeshLambertMaterial({ 
		envMap: window.snake.scene.background,
		reflectivity: 0.3,
		emissive: 0x000000,
		flatShading: true,
    	vertexColors: THREE.VertexColors
    });

	var segment = new THREE.Mesh(geometry, material);
	segment.jointAngle = geometry.faces[0].normal;

	if (alt) {
		segment.jointAngle = segment.jointAngle.clone().cross(new THREE.Vector3(0, 0, 1))
	}

	lastGeometry = geometry;

	return segment;
}