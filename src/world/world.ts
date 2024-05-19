import { Envelope } from "./primitives/envelope";
import { Polygon } from "./primitives/polygon";
import { Segment } from "./primitives/segment";
import { Point } from "./primitives/point";
import { lerp, distance, add, scale, getNearestPoint } from "./math/utils";
import { Graph } from "./math/graph";
import { Tree } from "./items/tree";
import { Building } from "./items/building";
import { Light } from "./markings/light";
import { Marking } from "./markings/marking";
import { getMarking } from "./markings/utils";
import { Car } from "../car/car";
import { Start } from "./markings/start";

type CenterType = {
	point: Point;
	lights: Light[];
	ticks: number;
};

export class World {
	title: string;
	graph: Graph;
	roadWidth: number;
	roadRoundness: number;
	buildingWidth: number;
	buildingMinLength: number;
	spacing: number;
	treeSize: number;
	envelopes: Envelope[];
	roadBorders: Segment[];
	buildings: Building[];
	trees: Tree[];
	laneGuides: Segment[] = [];
	markings: Marking[] = [];
	frameCount: number;
	zoom: number = 1;
	offset: Point = new Point(0, 0);
	cars: Car[] = [];
	bestCar: Car | null = null;

	constructor(
		graph: Graph,
		roadWidth = 100,
		roadRoundness = 10,
		buildingWidth = 150,
		buildingMinLength = 150,
		spacing = 50,
		treeSize = 160,
	) {
		this.title = "World Editor";
		this.graph = graph;
		this.roadWidth = roadWidth;
		this.roadRoundness = roadRoundness;
		this.buildingWidth = buildingWidth;
		this.buildingMinLength = buildingMinLength;
		this.spacing = spacing;
		this.treeSize = treeSize;

		this.envelopes = [];
		this.roadBorders = [];
		this.buildings = [];
		this.trees = [];
		this.markings = [];
		this.laneGuides = [];

		this.frameCount = 0;

		this.generate();
	}

	static load(info: World): World {
		const world = new World(new Graph());
		world.graph = Graph.load(info.graph);
		world.roadWidth = info.roadWidth;
		world.roadRoundness = info.roadRoundness;
		world.buildingWidth = info.buildingWidth;
		world.buildingMinLength = info.buildingMinLength;
		world.spacing = info.spacing;
		world.treeSize = info.treeSize;
		world.envelopes = info.envelopes.map((e) => Envelope.load(e));
		world.roadBorders = info.roadBorders.map((b) => new Segment(b.p1, b.p2));
		world.buildings = info.buildings.map((b) => Building.load(b));
		world.trees = info.trees.map((t) => new Tree(t.center, info.treeSize));
		world.laneGuides = info.laneGuides.map((g) => new Segment(g.p1, g.p2));
		world.markings = info.markings.map((m) => getMarking(m));
		world.zoom = info.zoom;
		world.offset = info.offset;
		world.title = info.title;

		const title = document.getElementById("title");
		if (title) {
			title.textContent = world.title;
		}

		return world;
	}

	private generateLaneGuides() {
		const tmpEnvelopes: Envelope[] = [];
		for (const seg of this.graph.segments) {
			tmpEnvelopes.push(
				new Envelope(seg, this.roadWidth / 2, this.roadRoundness),
			);
		}

		const segments = Polygon.union(tmpEnvelopes.map((e) => e.poly!));
		return segments;
	}

	generate(): void {
		this.envelopes.length = 0;
		for (const seg of this.graph.segments) {
			this.envelopes.push(
				new Envelope(seg, this.roadWidth, this.roadRoundness),
			);
		}

		this.roadBorders = Polygon.union(this.envelopes.map((e) => e.poly!));
		this.buildings = this.generateBuildings();
		this.trees = this.generateTrees();
		this.laneGuides.length = 0;
		this.laneGuides.push(...this.generateLaneGuides());
	}

	private getIntersections(): Point[] {
		const subset: Point[] = [];
		for (const point of this.graph.points) {
			let degree = 0;
			for (const seg of this.graph.segments) {
				if (seg.includes(point)) {
					degree++;
				}
			}
			if (degree > 2) {
				subset.push(point);
			}
		}
		return subset;
	}

	private updateLights() {
		const lights = this.markings.filter((m) => m.type === "light") as Light[];
		const controlCenters: CenterType[] = [];

		for (const light of lights) {
			const point = getNearestPoint(light.center, this.getIntersections());

			let controlCenter =
				point && controlCenters.find((c) => c.point.equals(point));

			if (!controlCenter) {
				const center = {
					point: new Point(point!.x, point!.y),
					lights: [light],
					ticks: 0,
				};
				controlCenters.push(center);
			} else {
				controlCenter.lights.push(light);
			}
		}

		const greenDuration = 2;
		const yellowDuration = 1;

		for (const center of controlCenters) {
			center.ticks = center.lights.length * (greenDuration + yellowDuration);
		}

		const tick = Math.floor(this.frameCount / 60);

		for (const center of controlCenters) {
			const cTick = tick % center.ticks;
			const greenYellowIndex = Math.floor(
				cTick / (greenDuration + yellowDuration),
			);
			const greenYellowState =
				cTick % (greenDuration + yellowDuration) < greenDuration
					? "green"
					: "yellow";

			for (let i = 0; i < center.lights.length; i++) {
				if (i === greenYellowIndex) {
					center.lights[i].setState(greenYellowState);
				} else {
					center.lights[i].setState("red");
				}
			}
		}

		this.frameCount++;
	}

	private generateTrees(): Tree[] {
		const points: Point[] = [
			...this.roadBorders.flatMap((s) => [s.p1, s.p2]),
			...this.buildings.flatMap((b) => b.base.points),
		];
		const left = Math.min(...points.map((p) => p.x));
		const right = Math.max(...points.map((p) => p.x));
		const top = Math.min(...points.map((p) => p.y));
		const bottom = Math.max(...points.map((p) => p.y));

		const illegalPolys = [
			...this.buildings.map((b) => b.base),
			...this.envelopes.map((e) => e.poly),
		];

		const trees: Tree[] = [];
		let tryCount = 0;
		while (tryCount < 100) {
			const p = new Point(
				lerp(left, right, Math.random()),
				lerp(bottom, top, Math.random()),
			);

			let keep = true;
			for (const poly of illegalPolys) {
				if (
					poly!.containsPoint(p) ||
					poly!.distanceToPoint(p) < this.treeSize / 2
				) {
					keep = false;
					break;
				}
			}

			if (keep) {
				for (const tree of trees) {
					if (distance(tree.center, p) < this.treeSize) {
						keep = false;
						break;
					}
				}
			}

			if (keep) {
				let closeToSomething = false;
				for (const poly of illegalPolys) {
					if (poly!.distanceToPoint(p) < this.treeSize * 2) {
						closeToSomething = true;
						break;
					}
				}
				keep = closeToSomething;
			}

			if (keep) {
				trees.push(new Tree(p, this.treeSize));
				tryCount = 0;
			}
			tryCount++;
		}
		return trees;
	}

	private generateBuildings(): Building[] {
		const tmpEnvelopes: Envelope[] = [];
		for (const seg of this.graph.segments) {
			tmpEnvelopes.push(
				new Envelope(
					seg,
					this.roadWidth + this.buildingWidth + this.spacing * 2,
					this.roadRoundness,
				),
			);
		}

		const guides = Polygon.union(tmpEnvelopes.map((e) => e.poly!));

		for (let i = 0; i < guides.length; i++) {
			const seg = guides[i];
			if (seg.length() < this.buildingMinLength) {
				guides.splice(i, 1);
				i--;
			}
		}

		const supports: Segment[] = [];
		for (const seg of guides) {
			const len = seg.length() + this.spacing;
			const buildingCount = Math.floor(
				len / (this.buildingMinLength + this.spacing),
			);
			const buildingLength = len / buildingCount - this.spacing;

			const dir = seg.directionVector();

			let q1 = seg.p1;
			let q2 = add(q1, scale(dir, buildingLength));
			supports.push(new Segment(q1, q2));

			for (let i = 2; i <= buildingCount; i++) {
				q1 = add(q2, scale(dir, this.spacing));
				q2 = add(q1, scale(dir, buildingLength));
				supports.push(new Segment(q1, q2));
			}
		}

		const bases: Polygon[] = [];
		for (const seg of supports) {
			bases.push(new Envelope(seg, this.buildingWidth).poly!);
		}

		const eps = 0.001;
		for (let i = 0; i < bases.length - 1; i++) {
			for (let j = i + 1; j < bases.length; j++) {
				if (
					bases[i].intersectsPoly(bases[j]) ||
					bases[i].distanceToPoly(bases[j]) < this.spacing - eps
				) {
					bases.splice(j, 1);
					j--;
				}
			}
		}

		return bases.map((b) => new Building(b));
	}

	draw(
		ctx: CanvasRenderingContext2D,
		viewPoint: Point,
		showStartMarkings = true,
	): void {
		this.updateLights();

		for (const env of this.envelopes) {
			env.draw(ctx, { fillStyle: "#BBB", stroke: "#BBB", lineWidth: 15 });
		}
		for (const marking of this.markings) {
			if (!(marking.type === "start") || showStartMarkings) {
				marking.draw(ctx);
			}
		}
		for (const seg of this.graph.segments) {
			seg.draw(ctx, { color: "white", width: 4, dash: [10, 10] });
		}
		for (const seg of this.roadBorders) {
			seg.draw(ctx, { color: "white", width: 4 });
		}

		ctx.globalAlpha = 0.2;
		for (const car of this.cars) {
			car.draw(ctx);
		}

		ctx.globalAlpha = 1;
		if (this.bestCar) {
			this.bestCar.draw(ctx, true);
		}

		const items = [...this.buildings, ...this.trees];
		items.sort(
			(a, b) =>
				b.base.distanceToPoint(viewPoint) - a.base.distanceToPoint(viewPoint),
		);
		for (const item of items) {
			item.draw(ctx, viewPoint);
		}
	}
}
