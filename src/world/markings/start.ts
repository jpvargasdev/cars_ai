import { angle } from "../math/utils";
import { Point } from "../primitives/point";
import { Marking } from "./marking";
import car from "../../assets/car.png";

export class Start extends Marking {
	img: HTMLImageElement;

	constructor(
		center: Point,
		directionVector: Point,
		width: number,
		height: number,
	) {
		super(center, directionVector, width, height, "start");

		this.img = new Image();
		this.img.src = car;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.translate(this.center.x, this.center.y);
		ctx.rotate(angle(this.directionVector) - Math.PI / 2);

		ctx.drawImage(this.img, -this.img.width / 2, -this.img.height / 2);
		ctx.restore();
	}
}
