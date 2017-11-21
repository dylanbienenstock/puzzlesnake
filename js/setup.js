window.snake = {};

$(setup);
$(window).resize(resize);
$(window).mousemove(mousemove);

window.snake.segments = [];
window.snake.hypotenuse = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);

function setup() {
	window.snake.scene = new THREE.Scene();
	window.snake.scene.background = new THREE.Color(0x888888);

	window.snake.camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
	window.snake.camera.position.z = 5;

	window.snake.renderer = new THREE.WebGLRenderer()
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

	createSnake();

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
	window.snake.renderer.render(window.snake.scene, window.snake.camera);
}

function mousemove(event) {

}

function rotateSnakeSegment(index, degrees) {
	window.snake.segments[index].rotateOnAxis(window.snake.segments[index].jointAngle, degrees * Math.PI / 180);
}

function r(index) { // <-- Shorthand for use in developer console
	rotateSnakeSegment(index, 90);
}

function createSnake() {
	var color1 = new THREE.Color(0x222222);
	var color2 = new THREE.Color(0x00AA00);
	var alt = false;
	var lastSegment;

	for (var i = 0; i < 24; i++) {
		var segment = createSnakeSegment(color1, color2, alt);
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

	var materials = [
		new THREE.MeshLambertMaterial({ 
			flatShading: true,
	    	vertexColors: THREE.VertexColors
	    }),

	    new THREE.MeshBasicMaterial({
	    	color: 0x000000,
	    	wireframe: true
	    })
	];

	var segment = new THREE.SceneUtils.createMultiMaterialObject(geometry, materials)
	segment.jointAngle = geometry.faces[0].normal;

	if (alt) {
		segment.jointAngle = segment.jointAngle.clone().cross(new THREE.Vector3(0, 0, 1))
	}

	lastGeometry = geometry;

	return segment;
}