import { Car } from "./car";
import { getIntersection, lerp } from "../utils";

export class Sensor {
	car: Car;
	rayCount: number;
	rayLength: number;
	raySpread: number;
	rays: Rays;
	readings: Readings;

	constructor(car: Car) {
		this.car = car;
		this.rayCount = 5;
		this.rayLength = 150;
		this.raySpread = Math.PI / 2;

		this.rays = [];
		this.readings = [];
	}

	update(roadBorders: Borders, traffic: Car[]) {
		this.castRays();
		this.readings = [];
		for (let i = 0; i < this.rays.length; i++) {
			const reading = this.getReading(this.rays[i], roadBorders, traffic);
			this.readings.push(reading);
		}
	}

	getReading(ray: Ray, roadBorders: Borders, traffic: Car[]): Point | null {
		let touches = [];

		for (let i = 0; i < roadBorders.length; i++) {
			const touch = getIntersection(
				ray[0],
				ray[1],
				roadBorders[i][0],
				roadBorders[i][1],
			);
			if (touch) {
				touches.push(touch);
			}
		}
		for (let i = 0; i < traffic.length; i++) {
			const poly = traffic[i].polygon;
			for (let j = 0; j < poly.length; j++) {
				const touch = getIntersection(
					ray[0],
					ray[1],
					poly[j],
					poly[(j + 1) % poly.length],
				);

				if (touch) {
					touches.push(touch);
				}
			}
		}

		if (touches.length === 0) {
			return null;
		} else {
			const offsets = touches.map((e) => e.offset);
			const minOffset = Math.min(...offsets);
			const touch = touches.find((e) => e.offset == minOffset);
			if (!touch) return null;
			return touch;
		}
	}

	castRays() {
		this.rays = [];
		for (let i = 0; i < this.rayCount; i++) {
			const rayAngle =
				lerp(
					this.raySpread / 2,
					-this.raySpread / 2,
					this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1),
				) + this.car.angle;

			const start = { x: this.car.x, y: this.car.y };
			const end = {
				x: this.car.x - Math.sin(rayAngle) * this.rayLength,
				y: this.car.y - Math.cos(rayAngle) * this.rayLength,
			};
			this.rays.push([start, end]);
		}
	}

	draw(ctx: CanvasRenderingContext2D) {
		if (this.rays.length < 1) return;

		for (let i = 0; i < this.rayCount; i++) {
			let end = this.rays[i][1];
			const reading = this.readings[i];
			if (reading) {
				end = reading;
			}

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "yellow";
			ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.strokeStyle = "black";
			ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
			ctx.lineTo(end.x, end.y);
			ctx.stroke();
		}
	}
}
