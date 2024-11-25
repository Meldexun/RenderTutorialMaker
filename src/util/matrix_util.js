
window.perspective = function perspective(fov, aspectRatio, nearPlane, farPlane) {
	const f = 1.0 / Math.tan((fov / 180.0 * Math.PI) * 0.5);
	const matrix = new DOMMatrix();
	matrix.m11 = f / aspectRatio;
	matrix.m22 = f;
	matrix.m33 = (farPlane + nearPlane) / (nearPlane - farPlane);
	matrix.m34 = -1.0;
	matrix.m43 = 2.0 * farPlane * nearPlane / (nearPlane - farPlane);
	matrix.m44 = 0.0;
	return matrix;
}

window.lookAt = function lookAt(eye, center, up) {
	const matrix = new DOMMatrix();
	const f = center.subtract(eye).normalize();
	const s = f.crossProduct(up.normalize());
	const u = s.normalize().crossProduct(f);
	matrix.m11 = s.x;
	matrix.m21 = s.y;
	matrix.m31 = s.z;
	matrix.m12 = u.x;
	matrix.m22 = u.y;
	matrix.m32 = u.z;
	matrix.m13 = -f.x;
	matrix.m23 = -f.y;
	matrix.m33 = -f.z;
	return matrix;
}
