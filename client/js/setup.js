window.snake = {};

$(setup);
$(window).resize(resize);
$(window).mousemove(mousemove);

var segmentCount = 24;
var lastRotateTime = 0;
var centerDelay = 300;

window.snake.segments = [];

window.snake.hypotenuse = Math.sqrt(0.5 * 0.5 + 0.5 * 0.5);
window.snake.mouse = new THREE.Vector2();
window.snake.lastClientX = 0;
window.snake.lastClientY = 0;
window.snake.hoveringSegment = null;
window.snake.rotatingSegment = null;

function setup() {
	$("body").on("mousedown", "*", mousedown);
	$("body").on("mouseup", "*", mouseup);

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
	window.snake.renderer.setPixelRatio(window.devicePixelRatio);
	window.snake.renderer.setSize(window.innerWidth, window.innerHeight);

	document.body.appendChild(window.snake.renderer.domElement);

	window.snake.controls = new THREE.TrackballControls(window.snake.camera);
	window.snake.controls.rotateSpeed = 1.5;
	window.snake.controls.zoomSpeed = 1.2;
	window.snake.controls.panSpeed = 0.8;
	window.snake.controls.noZoom = false;
	window.snake.controls.noPan = false;
	window.snake.controls.staticMoving = false;
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
	correctSegmentAngles();

	if (Date.now() - lastRotateTime >= centerDelay && $("#checkbox-autocenter").is(":checked")) {
		centerSnake();
	}

	window.snake.renderer.render(window.snake.scene, window.snake.camera);
}

function raycast() {
	if (window.snake.rotatingSegment != undefined) return;

	window.snake.raycaster.setFromCamera(window.snake.mouse, window.snake.camera);

	var intersects = window.snake.raycaster.intersectObjects(window.snake.segments, true);
	var childIndex = 2;

	if (intersects.length > 0) {
		if (window.snake.hoveringSegment != intersects[0].object) {
			if (window.snake.hoveringSegment) {
				window.snake.hoveringSegment.material.emissive.setHex(window.snake.hoveringSegment.currentHex);
			}

			window.snake.hoveringSegment = intersects[0].object;
			window.snake.hoveringSegment.currentHex = window.snake.hoveringSegment.material.emissive.getHex();
			window.snake.hoveringSegment.material.emissive.setHex(0x888888);

			document.body.style.cursor = "pointer";
		}
	} else {
		if (window.snake.hoveringSegment != undefined) {
			window.snake.hoveringSegment.material.emissive.setHex(window.snake.hoveringSegment.currentHex);
		}

		window.snake.hoveringSegment = null;
	}
}

function shortAngleDistance(a0, a1) {
    var max = Math.PI * 2;
    var da = (a1 - a0) % max;
    return 2 * da % max - da;
}

function correctSegmentAngles() {
	window.snake.segments.forEach(function(segment) {
		if (window.snake.rotatingSegment != undefined && segment.index == window.snake.rotatingSegment.index) return;

		if (segment.jointRotation % 90 != 0) {
			var snapAngle = segment.jointRotation;

			snapAngle = Math.round(segment.jointRotation / 90);
			snapAngle *= 90;

			rotateSnakeSegment(segment.index, snapAngle - segment.jointRotation);
		}
	});
}

function mousemove(event) {
	window.snake.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
	window.snake.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

	document.body.style.cursor = "initial";

	if (window.snake.hoveringSegment != undefined) {
		document.body.style.cursor = "pointer";
	}

	if (window.snake.rotatingSegment != undefined) {
		document.body.style.cursor = "move";

		var difference = event.clientX - window.snake.lastClientX;

		rotateSnakeSegment(window.snake.rotatingSegment.index, difference * 0.45);
	}

	window.snake.lastClientX = event.clientX;
	window.snake.lastClientY = event.clientY;
}

function mousedown(event) {
	if (window.snake.hoveringSegment != undefined) {
		document.body.style.cursor = "move";

		window.snake.rotatingSegment = window.snake.hoveringSegment;
		window.snake.controls.enabled = false;
	}
}

function mouseup(event) {
	document.body.style.cursor = "initial";

	window.snake.rotatingSegment = null;
	window.snake.controls.enabled = true;
}

function rotateSnakeSegment(index, degrees) {
	window.snake.segments[index].rotateOnAxis(window.snake.segments[index].jointNormal, degrees * Math.PI / 180);

	window.snake.segments[index].jointRotation += degrees;

	if (window.snake.segments[index].jointRotation < 0) {
		window.snake.segments[index].jointRotation += 360;
	}

	window.snake.segments[index].jointRotation = window.snake.segments[index].jointRotation % 360;

	lastRotateTime = Date.now();
}

function createSnake(color1, color2) {
	window.snake.scene.remove(window.snake.segments[0]);
	window.snake.segments.length = 0;

	var color1 = new THREE.Color(color1);
	var color2 = new THREE.Color(color2);
	var alt = false;
	var lastSegment;

	for (var i = 0; i < segmentCount; i++) {
		var segment = createSnakeSegment(color1, color2, alt);
		segment.index = i;
		segment.position.x = window.snake.hypotenuse;
		segment.position.y = alt ? -window.snake.hypotenuse : window.snake.hypotenuse;

		if (lastSegment != undefined) {
			lastSegment.add(segment);
		} else {
			window.snake.scene.add(segment);
		}

		window.snake.segments.push(segment);

		alt = !alt;
		lastSegment = segment;
	}

	centerSnake(true);
}

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
	segment.jointNormal = geometry.faces[0].normal;
	segment.jointRotation = 0;

	if (alt) {
		segment.jointNormal = segment.jointNormal.clone().cross(new THREE.Vector3(0, 0, 1))
	}

	return segment;
}

function centerSnake(snap) { // TO DO: Make this frame-rate independent
	var center = (new THREE.Box3().setFromObject(window.snake.segments[0])).getCenter();

	if (center.length() >= 0.2 && !snap) {
		center.normalize();
		center.multiply(new THREE.Vector3(0.2, 0.2, 0.2));
	}
	
	window.snake.segments[0].position.sub(center);
}

function importCode(code) {
	createSnake(0x222222, 0x00AA00);

	for (var i = 0; i < Math.min(code.length, segmentCount); i++) {
		rotateSnakeSegment(i, parseInt(code.charAt(i)) * 90);
	}
}

function exportCode() {
	var exportString = "";

	window.snake.segments.forEach(function(segment) {
		exportString += Math.round(segment.jointRotation / 90);
	});

	var temp = document.createElement("textarea");
	document.body.appendChild(temp);
	$(temp).val(exportString);
	temp.select();
	document.execCommand("copy");
	document.body.removeChild(temp);

	alert("Code copied to clipboard.");
}