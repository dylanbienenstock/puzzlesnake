window.snake = {};

$(setup);
$(window).resize(resize);

function setup() {
	window.snake.scene = new THREE.Scene();
	window.snake.scene.background = new THREE.Color(0x888888);
	window.snake.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

	window.snake.renderer = new THREE.WebGLRenderer()
	window.snake.renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(window.snake.renderer.domElement);

	window.snake.camera.position.z = 5;

	window.snake.controls = new THREE.TrackballControls(window.snake.camera);
	window.snake.controls.rotateSpeed = 1.5;
	window.snake.controls.zoomSpeed = 1.2;
	window.snake.controls.panSpeed = 0.8;
	window.snake.controls.noZoom = false;
	window.snake.controls.noPan = true;
	window.snake.controls.staticMoving = true;
	window.snake.controls.dynamicDampingFactor = 0.3;

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

function createSnake() {

}

function createSnakeSegment() {
	var segment = new THREE.Geometry();

	segment.vertices = [
		new THREE.Vector3(-1, -1, -1),
		new THREE.Vector3(-1, 1, -1),
		new THREE.Vector3(1, -1, -1),
		new THREE.Vector3(1, 1, -1),
		new THREE.Vector3(-1, -1, 1),
		new THREE.Vector3(1, -1, 1)
	];

	segment.faces = [
		new THREE.Face3(0, 1, 2),
		new THREE.Face3(3, 2, 1),
		new THREE.Face3(4, 0, 5),
		new THREE.Face3(5, 0, 2),
		new THREE.Face3(3, 1, 4),
		new THREE.Face3(3, 4, 5),
		new THREE.Face3(2, 3, 5),
		new THREE.Face3(1, 0, 4)
	];

	segment.computeFaceNormals();

	return new THREE.Mesh(segment, new THREE.MeshNormalMaterial());
}