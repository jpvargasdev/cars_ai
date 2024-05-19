import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";

/**
 * Returns the nearest point to a given location from an array of points, within a specified threshold.
 * @param loc The location from which to find the nearest point.
 * @param points An array of points to search for the nearest point.
 * @param threshold The maximum distance within which to consider a point as nearest. Defaults to Number.MAX_SAFE_INTEGER.
 * @returns The nearest point from the array, or null if no point is found within the threshold.
 */
export function getNearestPoint(
	loc: Point,
	points: Point[],
	threshold: number = Number.MAX_SAFE_INTEGER,
): Point | null {
	let minDist = Number.MAX_SAFE_INTEGER;
	let nearest: Point | null = null;
	for (const point of points) {
		const dist = distance(point, loc);
		if (dist < minDist && dist < threshold) {
			minDist = dist;
			nearest = point;
		}
	}
	return nearest;
}

export function getNearestSegment(
	loc: Point,
	segments: Segment[],
	threshold: number = Number.MAX_SAFE_INTEGER,
): Segment | null {
	let minDist = Number.MAX_SAFE_INTEGER;
	let nearest: Segment | null = null;
	for (const seg of segments) {
		const dist = seg.distanceToPoint(loc);
		if (dist < minDist && dist < threshold) {
			minDist = dist;
			nearest = seg;
		}
	}
	return nearest;
}

/**
 * Calculates the Euclidean distance between two points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The distance between the two points.
 */
export function distance(p1: Point, p2: Point): number {
	return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Calculates the average point between two given points.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The average point between p1 and p2.
 */
export function average(p1: Point, p2: Point): Point {
	return new Point((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
}

/**
 * Calculates the dot product of two vectors.
 * @param p1 The first vector.
 * @param p2 The second vector.
 * @returns The dot product of p1 and p2.
 */
export function dot(p1: Point, p2: Point): number {
	return p1.x * p2.x + p1.y * p2.y;
}

/**
 * Adds two points together.
 * @param p1 The first point.
 * @param p2 The second point.
 * @returns The sum of p1 and p2.
 */
export function add(
	p1: Point | { x: number; y: number },
	p2: Point | { x: number; y: number },
): Point {
	return new Point(p1.x + p2.x, p1.y + p2.y);
}

/**
 * Subtracts one point from another.
 * @param p1 The minuend point.
 * @param p2 The subtrahend point.
 * @returns The difference between p1 and p2.
 */
export function substract(p1: Point, p2: Point): Point {
	return new Point(p1.x - p2.x, p1.y - p2.y);
}

/**
 * Scales a point by a given scalar value.
 * @param p The point to scale.
 * @param scaler The scalar value to multiply the point by.
 * @returns The scaled point.
 */
export function scale(p: Point, scaler: number): Point {
	return new Point(p.x * scaler, p.y * scaler);
}

/**
 * Normalizes a vector (point) to have unit length.
 * @param p The vector (point) to normalize.
 * @returns The normalized vector (point).
 */
export function normalize(p: Point): Point {
	return scale(p, 1 / magnitude(p));
}

/**
 * Calculates the magnitude (length) of a vector (point).
 * @param p The vector (point) whose magnitude is to be calculated.
 * @returns The magnitude of the vector (point).
 */
export function magnitude(p: Point): number {
	return Math.hypot(p.x, p.y);
}

/**
 * Translates a point by a given angle and offset.
 * @param loc The location (point) to translate from.
 * @param angle The angle in radians by which to translate.
 * @param offset The distance by which to translate.
 * @returns The translated point.
 */
export function translate(loc: Point, angle: number, offset: number): Point {
	return new Point(
		loc.x + Math.cos(angle) * offset,
		loc.y + Math.sin(angle) * offset,
	);
}

/**
 * Calculates the angle (in radians) of a vector (point) from the positive x-axis.
 * @param p The vector (point) whose angle is to be calculated.
 * @returns The angle (in radians) of the vector (point).
 */
export function angle(p: Point): number {
	return Math.atan2(p.y, p.x);
}

/**
 * Calculates the intersection point of two line segments AB and CD, if it exists.
 * @param A The start point of line segment AB.
 * @param B The end point of line segment AB.
 * @param C The start point of line segment CD.
 * @param D The end point of line segment CD.
 * @returns The intersection point, or null if the line segments do not intersect.
 */
export function getIntersection(
	A: Point,
	B: Point,
	C: Point,
	D: Point,
): { x: number; y: number; offset: number } | null {
	const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
	const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
	const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

	const eps = 0.001;
	if (Math.abs(bottom) > eps) {
		const t = tTop / bottom;
		const u = uTop / bottom;
		if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
			return {
				x: lerp(A.x, B.x, t),
				y: lerp(A.y, B.y, t),
				offset: t,
			};
		}
	}

	return null;
}

export function degToRad(deg: number) {
	return deg * (Math.PI / 180);
}

/**
 * Performs linear interpolation between two values.
 * @param a The starting value.
 * @param b The ending value.
 * @param t The interpolation parameter (a value between 0 and 1).
 * @returns The interpolated value between a and b.
 */
export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function invLerp(a: number, b: number, v: number) {
	return (v - a) / (b - a);
}

/**
 * Generates a random color in HSL format.
 * @returns A random color string in HSL format.
 */
export function getRandomColor(): string {
	const hue = 290 + Math.random() * 260;
	return `hsl(${hue},·100%,·60%)`;
}

export function lerp2D(A: Point, B: Point, t: number) {
	return new Point(lerp(A.x, B.x, t), lerp(A.y, B.y, t));
}

export function getFake3dPoint(point: Point, viewPoint: Point, height: number) {
	const dir = normalize(substract(point, viewPoint));
	const dist = distance(point, viewPoint);
	const scaler = Math.atan(dist / 300) / (Math.PI / 2);
	return add(point, scale(dir, height * scaler));
}

export function perpendicular(p: Point) {
	return new Point(-p.y, p.x);
}
