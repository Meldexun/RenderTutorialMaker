
class Vec3 {

	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}

	add(vec) {
		return new Vec3(this.x + vec.x, this.y + vec.y, this.z + vec.z);
	}

	subtract(vec) {
		return new Vec3(this.x - vec.x, this.y - vec.y, this.z - vec.z);
	}

	length() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	}

	normalize() {
		const f = 1.0 / this.length();
		return new Vec3(this.x * f, this.y * f, this.z * f);
	}

	crossProduct(vec) {
		return new Vec3(this.y * vec.z - this.z * vec.y, this.z * vec.x - this.x * vec.z, this.x * vec.y - this.y * vec.x);
	}

}
