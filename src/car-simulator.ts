import { Car } from "./car/car";
import { NeuralNetwork } from "./network/network";
import { Visualizer } from "./visualizer/visualizer";
import { Graph } from "./world/math/graph";
import { angle, scale } from "./world/math/utils";
import { Point } from "./world/primitives/point";
import { Viewport } from "./world/viewport";
import { World } from "./world/world";
import defaultWorld from "./world/saves/default.json";
import { MiniMap } from "./visualizer/minimap";

export class CarSimulation {
	private simulationContainer: HTMLDivElement;
	private worldCanvas: HTMLCanvasElement;
	private networkCanvas: HTMLCanvasElement;
	private minimapCanvas: HTMLCanvasElement;
	private saveNetworkBtn: HTMLButtonElement;
	private discardNetworkBtn: HTMLButtonElement;
	private carCtx: CanvasRenderingContext2D | null;
	private networkCtx: CanvasRenderingContext2D | null;
	private world: World;
	private viewport: Viewport;
	private minimap: MiniMap;
	private cars: Car[];
	private bestCar: Car;
	private traffic: Car[] = [];
	private roadBorders: Borders;

	constructor() {
		this.worldCanvas = document.getElementById(
			"car-canvas",
		) as HTMLCanvasElement;
		this.networkCanvas = document.getElementById(
			"network-canvas",
		) as HTMLCanvasElement;
		this.minimapCanvas = document.getElementById(
			"minimap-canvas",
		) as HTMLCanvasElement;
		this.saveNetworkBtn = document.getElementById(
			"save-network",
		) as HTMLButtonElement;
		this.discardNetworkBtn = document.getElementById(
			"discard-network",
		) as HTMLButtonElement;

		this.simulationContainer = document.getElementById(
			"simulation-container",
		) as HTMLDivElement;

		this.saveNetworkBtn.addEventListener("click", this.save.bind(this));
		this.discardNetworkBtn.addEventListener("click", this.discard.bind(this));

		this.networkCanvas.height = window.innerHeight * 0.9 - 300;
		this.worldCanvas.width = window.innerWidth - 350;
		this.worldCanvas.height = window.innerHeight * 0.9;

		// const worldString = localStorage.getItem("world");
		// const worldInfo: World = worldString ? JSON.parse(worldString) : null;

		this.carCtx = this.worldCanvas.getContext("2d");
		this.networkCtx = this.networkCanvas.getContext("2d");

		if (!this.carCtx || !this.networkCtx) {
			throw new Error("Could not get 2d context");
		}

		//@ts-check
		this.world = defaultWorld
			? World.load(defaultWorld)
			: new World(new Graph());
		this.viewport = new Viewport(
			this.worldCanvas,
			this.world.zoom,
			this.world.offset,
		);

		this.minimap = new MiniMap(this.minimapCanvas, this.world.graph);

		this.roadBorders = this.world.roadBorders.map((s) => [s.p1, s.p2]);

		this.cars = this.generateCars(1);
		this.bestCar = this.cars[0];

		if (localStorage.getItem("bestBrain")) {
			for (let i = 0; i < this.cars.length; i++) {
				this.cars[i].brain = JSON.parse(
					localStorage.getItem("bestBrain") as string,
				);
				if (i !== 0) {
					NeuralNetwork.mutate(this.cars[i].brain!, 0.1);
				}
			}
		}

		this.animate(10);
	}

	private save() {
		localStorage.setItem("bestBrain", JSON.stringify(this.bestCar.brain));
	}

	private discard() {
		localStorage.removeItem("bestBrain");
	}

	private generateCars(N: number): Car[] {
		const startPoints = this.world.markings.filter((m) => m.type === "start");
		const startPoint =
			startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);
		const dir =
			startPoints.length > 0
				? startPoints[0].directionVector
				: new Point(0, -1);
		const startAngle = -angle(dir) + Math.PI / 2;

		const cars = [];
		for (let i = 1; i <= N; i++) {
			cars.push(new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle));
		}
		return cars;
	}

	public hide() {
		if (this.worldCanvas) {
			this.simulationContainer.style.display = "none";
		}
	}

	public show() {
		if (this.worldCanvas) {
			this.simulationContainer.style.display = "flex";
		}
	}

	private animate(time: number) {
		if (!this.carCtx || !this.networkCtx) {
			throw new Error("Could not get 2d context");
		}

		for (let i = 0; i < this.traffic.length; i++) {
			this.traffic[i].update(this.roadBorders, []);
		}

		for (let i = 0; i < this.cars.length; i++) {
			this.cars[i].update(this.roadBorders, this.traffic);
		}

		this.bestCar =
			this.cars.find(
				(car) =>
					car.fitness === Math.max(...this.cars.map((car) => car.fitness)),
			) || this.cars[0];

		this.world.cars = this.cars;
		this.world.bestCar = this.bestCar;

		this.viewport.offset.x = -this.bestCar.x;
		this.viewport.offset.y = -this.bestCar.y;

		this.viewport.reset();

		const viewPoint = scale(this.viewport.getOffset(), -1);
		this.world.draw(this.carCtx, viewPoint, false);
		this.minimap.update(viewPoint);
		for (let i = 0; i < this.traffic.length; i++) {
			this.traffic[i].draw(this.carCtx);
		}

		this.networkCtx.lineDashOffset = -time / 50;
		this.networkCtx.clearRect(
			0,
			0,
			this.networkCanvas.width,
			this.networkCanvas.height,
		);
		if (this.bestCar) {
			Visualizer.drawNetwork(this.networkCtx, this.bestCar.brain!);
		}

		requestAnimationFrame(this.animate.bind(this));
	}
}
