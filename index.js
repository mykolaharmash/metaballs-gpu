const CIRCLE_COUNT = 10

function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
		return shader;
	}

	gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (success) {
		return program;
	}

	gl.deleteProgram(program);
}

function setCircleListUniforms(circleList, gl, program) {
	const uniformLocation = gl.getUniformLocation(program, "u_circleList")
	const uniform = circleList.reduce((acc, circle) => {
		return acc.concat(circle)
	})

	gl.uniform3fv(uniformLocation, uniform)
}

function setGeometry(gl, program) {
	const positions = [
		-1, 1,
		1, 1,
		-1, -1,
		-1, -1,
		1, 1,
		1, -1,
	];
	const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	const positionBuffer = gl.createBuffer();
	const size = 2;
	const type = gl.FLOAT;
	const normalize = false;
	const stride = 0;
	const offset = 0;

	gl.enableVertexAttribArray(positionAttributeLocation);
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	gl.vertexAttribPointer(
		positionAttributeLocation,
		size,
		type,
		normalize,
		stride,
		offset
	);
}

function moveCircle(currentCircle, speed) {
	const [x, y, r] = currentCircle
	let [dx, dy] = speed

	if (x + r + dx > 1 || x - r + dx < -1) {
		dx = -dx
	}

	if (y + r + dy > 1 || y - r + dy < -1) {
		dy = -dy
	}

	return [[x + dx, y + dy, r], [dx, dy]]
}

function moveCircleList(circleList, speedList) {
	let updatedCircleList = []
	let updatedSpeedList = []

	circleList.forEach((circle, index) => {
		const [updatedCircle, updatedSpeed] = moveCircle(circle, speedList[index])

		updatedCircleList.push(updatedCircle)
		updatedSpeedList.push(updatedSpeed)
	})

	return [updatedCircleList, updatedSpeedList]
}

function generateCircleList() {
	let circleList = []

	return Array.from({ length: CIRCLE_COUNT }, () => {
		const x = 0
		const y = 0
		const r = Math.random() * 0.1 + 0.01

		return [x, y, r]
	})
}

function generateSpeeds() {
	return Array.from({ length: CIRCLE_COUNT }, () => {
		const dx = Math.random() * 0.003 - 0.0015
		const dy = Math.random() * 0.003 - 0.0015

		return [dx, dy]
	})
}

function drawScene(gl) {
	const primitiveType = gl.TRIANGLES;
	const offset = 0;
	const count = 6;

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(primitiveType, offset, count);
}

async function main() {
	const vertexSource = await (await fetch('./vertex.glsl')).text()
	const fragmentSource = (await (await fetch('./fragment.glsl')).text()).replace('__CIRCLE_COUNT__', CIRCLE_COUNT)

	const canvas = document.querySelector("#canvas");
	const gl = canvas.getContext("webgl");

	canvas.width = 1000;
	canvas.height = 1000;
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(1, 1, 1, 1);

	const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
	const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
	const program = createProgram(gl, vertexShader, fragmentShader);

	let circleList = generateCircleList()
	let speedList = generateSpeeds()

	gl.useProgram(program)

	setGeometry(gl, program)

	function render() {
		[circleList, speedList] = moveCircleList(circleList, speedList)

		setCircleListUniforms(circleList, gl, program)
		drawScene(gl)
		requestAnimationFrame(render)
	}

	render()
}

document.addEventListener('DOMContentLoaded', main);
