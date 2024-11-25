const gl_third_person = document.querySelector("#gl_third_person")
	.getContext("webgl2");
if (gl_third_person === null) {
	alert(
		"Unable to initialize WebGL. Your browser or machine may not support it.",
	);
//	return;
}

const gl_first_person = document.querySelector("#gl_first_person")
	.getContext("webgl2");
if (gl_first_person === null) {
	alert(
		"Unable to initialize WebGL. Your browser or machine may not support it.",
	);
//	return;
}

await initTP(gl_third_person);
await initFP(gl_first_person);

requestAnimationFrame(renderLoop)

function renderLoop(time) {
	renderTP(gl_third_person, time);
	renderFP(gl_first_person, time);

	requestAnimationFrame(renderLoop)
}
