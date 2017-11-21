window.snake = {};

$(setup);
$(window).resize(resize);
$(window).mousemove(mousemove);

window.snake.segments = [];

function setup() {
	window.snake.scene = new THREE.Scene();
	window.snake.scene.background = new THREE.Color(0x888888);

	window.snake.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	window.snake.camera.position.z = 5;

	window.snake.renderer = new THREE.WebGLRenderer()
	window.snake.renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(window.snake.renderer.domElement);

	window.snake.controls = new THREE.TrackballControls(window.snake.camera);
	window.snake.controls.rotateSpeed = 1.5;
	window.snake.controls.zoomSpeed = 1.2;
	window.snake.controls.panSpeed = 0.8;
	window.snake.controls.noZoom = false;
	window.snake.controls.noPan = true;
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

function createSnake() {
	var color1 = new THREE.Color(0x222222);
	var color2 = new THREE.Color(0x00AA00);
	var alt = false;
	var hypotenuse = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);

	for (var i = -11.5; i < 12; i++) {
		var segment = createSnakeSegment(alt ? color1 : color2, alt ? color2 : color1);
		segment.position.x = i * hypotenuse;
		segment.position.y = alt ? 0 : hypotenuse;

		segment.rotateY(90 * Math.PI / 180);
		segment.rotateX(alt ? -225 * Math.PI / 180 : -45 * Math.PI / 180);

		window.snake.scene.add(segment);
		window.snake.segments.push(segment);

		alt = !alt;
	}
}

function createSnakeSegment(color1, color2) {
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
		new THREE.Face3(0, 1, 2, null, color1),
		new THREE.Face3(3, 2, 1, null, color1),
		new THREE.Face3(4, 0, 5, null, color1),
		new THREE.Face3(5, 0, 2, null, color1),
		new THREE.Face3(3, 1, 4, null, color2),
		new THREE.Face3(3, 4, 5, null, color2),
		new THREE.Face3(2, 3, 5, null, color1),
		new THREE.Face3(1, 0, 4, null, color1)
	];

	geometry.computeFaceNormals();

	var materials = [
		new THREE.MeshLambertMaterial({ 
			flatShading: true,
	    	vertexColors: THREE.VertexColors
	    }),

	    new THREE.MeshBasicMaterial({
	    	color: 0xFFFFFF,
	    	wireframe: true
	    })
	];

	return new THREE.SceneUtils.createMultiMaterialObject(geometry, materials);
}