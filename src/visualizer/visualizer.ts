import { Level, NeuralNetwork } from "../network/network";
import { getRGBA, lerp } from "../utils";

export class Visualizer {
	static drawNetwork(ctx: CanvasRenderingContext2D, network: NeuralNetwork) {
		const margin = 50;
		const left = margin;
		const top = margin;
		const width = ctx.canvas.width - margin * 2;
		const height = ctx.canvas.height - 200;

		const levelHeight = height / network.levels.length;

		for (let i = network.levels.length - 1; i >= 0; i--) {
			const levelTop =
				top +
				lerp(
					height - levelHeight,
					0,
					network.levels.length === 1 ? 0.5 : i / (network.levels.length - 1),
				);

			ctx.setLineDash([10, 3]);
			Visualizer.drawLevel(
				ctx,
				network.levels[i],
				left,
				levelTop,
				width,
				levelHeight,
				i === network.levels.length - 1 ? ["↑", "←", "→", "↓"] : [],
			);
		}
	}

	private static getNodeX(
		nodes: string | any[],
		index: number,
		left: number,
		right: number,
	) {
		return lerp(
			left,
			right,
			nodes.length === 1 ? 0.5 : index / (nodes.length - 1),
		);
	}

	static drawLevel(
		ctx: CanvasRenderingContext2D,
		level: Level,
		left: number,
		top: number,
		width: number,
		height: number,
		outputLabels: string[],
	) {
		const right = left + width;
		const bottom = top + height;
		const { inputs, outputs, weights, biases } = level;

		const nodeRadius = 18;

		for (let i = 0; i < inputs.length; i++) {
			for (let j = 0; j < outputs.length; j++) {
				ctx.beginPath();
				const bottomX = Visualizer.getNodeX(inputs, i, left, right);
				const topX = Visualizer.getNodeX(outputs, j, left, right);
				ctx.moveTo(bottomX, bottom);
				ctx.lineTo(topX, top);
				ctx.lineWidth = 2;

				ctx.strokeStyle = getRGBA(weights[i][j]);
				ctx.stroke();
			}
		}

		for (let i = 0; i < outputs.length; i++) {
			const x = Visualizer.getNodeX(outputs, i, left, right);
			ctx.beginPath();
			ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
			ctx.fillStyle = "black";
			ctx.fill();

			ctx.beginPath();
			ctx.arc(x, top, nodeRadius * 0.6, 0, Math.PI * 2);
			ctx.fillStyle = getRGBA(outputs[i]);
			ctx.fill();

			ctx.beginPath();
			ctx.lineWidth = 2;
			ctx.arc(x, top, nodeRadius, 0, Math.PI * 2);
			ctx.strokeStyle = getRGBA(biases[i]);
			ctx.setLineDash([3, 3]);
			ctx.stroke();
			ctx.setLineDash([]);

			if (outputLabels[i]) {
				ctx.beginPath();
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillStyle = "black";
				ctx.strokeStyle = "white";
				ctx.font = nodeRadius * 1 + "px Arial";
				ctx.fillText(outputLabels[i], x, top);
				ctx.lineWidth = 1;
				ctx.strokeText(outputLabels[i], x, top);
			}
		}

		for (let i = 0; i < inputs.length; i++) {
			const x = Visualizer.getNodeX(inputs, i, left, right);

			ctx.beginPath();
			ctx.arc(x, bottom, nodeRadius, 0, Math.PI * 2);
			ctx.fillStyle = "black";
			ctx.fill();

			ctx.beginPath();
			ctx.arc(x, bottom, nodeRadius * 0.6, 0, Math.PI * 2);
			ctx.fillStyle = getRGBA(inputs[i]);
			ctx.fill();
		}
	}
}
