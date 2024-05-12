import { Car } from "./car/car";
import { NeuralNetwork } from "./network/network";
import { Visualizer } from "./visualizer/visualizer";
import { Graph } from "./world/math/graph";
import { angle, scale } from "./world/math/utils";
import { Point } from "./world/primitives/point";
import { Viewport } from "./world/viewport";
import { World } from "./world/world";

const worldCanvas = document.getElementById("car-canvas") as HTMLCanvasElement;
const networkCanvas = document.getElementById("network-canvas") as HTMLCanvasElement;
const saveNetworkBtn = document.getElementById("save-network") as HTMLButtonElement;
const discardNetworkBtn = document.getElementById("discard-network") as HTMLButtonElement;
saveNetworkBtn.addEventListener("click", save);
discardNetworkBtn.addEventListener("click", discard);

networkCanvas.height = window.innerHeight * 0.94;
worldCanvas.width = window.innerWidth - 350;
worldCanvas.height = window.innerHeight * 0.94;

const worldString = localStorage.getItem("world");
const worldInfo: World = worldString ? JSON.parse(worldString) : null;

const carCtx = worldCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");
const world = worldInfo ? World.load(worldInfo) : new World(new Graph());
const viewport = new Viewport(worldCanvas, world.zoom, world.offset);

const CARS = 1;
const traffic: Car[] = [];
const roadBorders: Borders = world.roadBorders.map((s) => [s.p1, s.p2]);

function save() {
	localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
	localStorage.removeItem("bestBrain");
}



if (!carCtx && !networkCtx) {
	throw new Error("Could not get 2d context");
}

function generateCars(N: number) {
	const startPoints = world.markings.filter((m) => m.type === "start" );
	const startPoint =
		startPoints.length > 0 ? startPoints[0].center : new Point(100, 100);

	const dir =
		startPoints.length > 0 ? startPoints[0].directionVector : new Point(0, -1);

	const startAngle = - angle(dir) + Math.PI / 2;

	const cars = [];
	for (let i = 1; i <= N; i++) {
		cars.push(new Car(startPoint.x, startPoint.y, 30, 50, "AI", startAngle));
	}
	return cars;
}

const cars = generateCars(CARS);
let bestCar = cars[0];

if (localStorage.getItem("bestBrain")) {
	for (let i = 0; i < cars.length; i++) {
		cars[i].brain = JSON.parse(localStorage.getItem("bestBrain") as string);
		if (i !== 0) {
			NeuralNetwork.mutate(cars[i].brain!, 0.1);
		}
	}
}

function animate(time: number) {
	if (!carCtx) {
		throw new Error("Could not get 2d context");
	}

	if (!networkCtx) {
		throw new Error("Could not get 2d context");
	}

	for (let i = 0; i < traffic.length; i++) {
		traffic[i].update(roadBorders, []);
	}

	for (let i = 0; i < cars.length; i++) {
		cars[i].update(roadBorders, traffic);
	}

	// fitness function
	bestCar =
		cars.find((car) => car.fitness === Math.max(...cars.map((car) => car.fitness))) ||
		cars[0];

	world.cars = cars;
	world.bestCar = bestCar;

	viewport.offset.x = -bestCar.x;
	viewport.offset.y = -bestCar.y;

	viewport.reset();

	const viewPoint = scale(viewport.getOffset(), -1);
	world.draw(carCtx, viewPoint, false);

	for (let i = 0; i < traffic.length; i++) {
		traffic[i].draw(carCtx);
	}
	
	networkCtx.lineDashOffset = -time / 50;
	networkCtx.clearRect(0, 0, networkCanvas.width, networkCanvas.height);
	if (bestCar) {
		Visualizer.drawNetwork(networkCtx, bestCar.brain!);
	}
	requestAnimationFrame(animate);
}

animate(10);
