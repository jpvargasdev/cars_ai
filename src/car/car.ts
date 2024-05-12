import { Controls } from "./controls";
import { Sensor } from "./sensor";
import { polysIntersect } from "../utils";
import { NeuralNetwork } from "../network/network";
const car = require("../assets/car.png");

export class Car {
	x: number;
	y: number;
	width: number;
	height: number;
	speed: number = 0;
	acceleration: number = 0.9;
	maxSpeed: number = 1;
	friction: number = 0.05;
	angle: number = 0;
	sensor: Sensor | null = null;
	controls: Controls;
	polygon: Point[] = [];
	damaged: boolean = false;
	brain: NeuralNetwork | null = null;
	useBrain: boolean = false;
	img: HTMLImageElement;
	mask: HTMLCanvasElement;
	fitness = 0;

	constructor(
		x: number,
		y: number,
		width: number,
		height: number,
		controlType: ControlType,
		angle: number = 0,
		maxSpeed: number = 1,
		color = "blue",
	) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.maxSpeed = maxSpeed;
		this.angle = angle;

		this.useBrain = controlType === "AI";

		if (controlType !== "DUMMY") {
			this.sensor = new Sensor(this);
			this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
		}
		this.controls = new Controls(controlType);

		this.img = new Image();
		this.img.src = car;

		this.mask = document.createElement("canvas");
		this.mask.width = width;
		this.mask.height = height;

		const maskCtx = this.mask.getContext("2d") as CanvasRenderingContext2D;
		this.img.onload = () => {
			maskCtx.fillStyle = color;
			maskCtx.rect(0, 0, this.width, this.height);
			maskCtx.fill();

			maskCtx.globalCompositeOperation = "destination-atop";
			maskCtx.drawImage(this.img, 0, 0, this.width, this.height);
			maskCtx.globalCompositeOperation = "source-over";
			this.mask = maskCtx.canvas;
		};
	}

	private assessDamage(roadBorders: Borders, traffic: Car[]) {
		for (let i = 0; i < roadBorders.length; i++) {
			if (polysIntersect(this.polygon, roadBorders[i])) {
				return true;
			}
		}

		for (let i = 0; i < traffic.length; i++) {
			if (polysIntersect(this.polygon, traffic[i].polygon)) {
				return true;
			}
		}
		return false;
	}

	private createPolygon(): Point[] {
		const points = [];
		const rad = Math.hypot(this.width, this.height) / 2;
		const alpha = Math.atan2(this.width, this.height);

		points.push({
			x: this.x - Math.sin(this.angle - alpha) * rad,
			y: this.y - Math.cos(this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(this.angle + alpha) * rad,
			y: this.y - Math.cos(this.angle + alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
		});
		points.push({
			x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
			y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
		});

		return points;
	}

	draw(ctx: CanvasRenderingContext2D, drawSensor: boolean = false) {
		if (this.sensor && drawSensor) {
			this.sensor.draw(ctx);
		}

		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.angle);

		if (!this.damaged) {
			ctx.drawImage(
				this.mask,
				-this.width / 2,
				-this.height / 2,
				this.width,
				this.height,
			);
			ctx.globalCompositeOperation = "multiply";
		}
		ctx.drawImage(
			this.img,
			-this.width / 2,
			-this.height / 2,
			this.width,
			this.height,
		);

		ctx.restore();
	}

	update(roadBorders: Borders, traffic: Car[]) {
		if (!this.damaged) {
			this.move();
			this.fitness += this.speed;
			this.polygon = this.createPolygon();
			this.damaged = this.assessDamage(roadBorders, traffic);
		}
		if (this.sensor && this.brain) {
			this.sensor.update(roadBorders, traffic);
			const offsets = this.sensor.readings.map((s) =>
				s === null ? 0 : 1 - (s.offset || 0),
			);

			const outputs = NeuralNetwork.feedForward(offsets, this.brain);

			if (this.useBrain) {
				this.controls.forward = !!outputs[0];
				this.controls.left = !!outputs[1];
				this.controls.right = !!outputs[2];
				this.controls.reverse = !!outputs[3];
			}
		}
	}

	private move() {
		if (this.controls.forward) {
			this.speed += this.acceleration;
		}
		if (this.controls.reverse) {
			this.speed -= this.acceleration;
		}

		if (this.speed > this.maxSpeed) {
			this.speed = this.maxSpeed;
		}
		if (this.speed < -this.maxSpeed / 2) {
			this.speed = -this.maxSpeed / 2;
		}

		if (this.speed > 0) {
			this.speed -= this.friction;
		}
		if (this.speed < 0) {
			this.speed += this.friction;
		}
		if (Math.abs(this.speed) < this.friction) {
			this.speed = 0;
		}

		if (this.speed != 0) {
			const flip = this.speed > 0 ? 1 : -1;
			if (this.controls.left) {
				this.angle += 0.03 * flip;
			}
			if (this.controls.right) {
				this.angle -= 0.03 * flip;
			}
		}

		this.x -= Math.sin(this.angle) * this.speed;
		this.y -= Math.cos(this.angle) * this.speed;
	}
}
