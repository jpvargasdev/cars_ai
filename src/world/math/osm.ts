import { Point } from "../primitives/point";
import { Segment } from "../primitives/segment";
import { Graph } from "./graph";
import { degToRad, invLerp } from "./utils";

type Node = {
	type: "node";
	id: number;
	lat: number;
	lon: number;
};

type Ways = {
	type: "way";
	id: number;
	nodes: number[];
	tags: { [key: string]: string | number };
};

type Element = Node | Ways;

type OsmData = {
	elements: Element[];
};

export const Osm = {
	parseRoads: (data: OsmData) => {
		const nodes = data.elements.filter(
			(n: Element) => n.type === "node",
		) as Node[];
		const lats = nodes.map((n: Node) => n.lat);
		const lons = nodes.map((n: Node) => n.lon);

		const minLat = Math.min(...lats);
		const maxLat = Math.max(...lats);
		const minLon = Math.min(...lons);
		const maxLon = Math.max(...lons);
		const deltaLat = maxLat - minLat;
		const deltaLon = maxLon - minLon;

		const ar = deltaLon / deltaLat;
		const height = deltaLat * 111000 * 10;
		const width = height * ar * Math.cos(degToRad(maxLat));

		const points = [];
		const segments = [];
		for (const node of nodes) {
			const y = invLerp(maxLat, minLat, node.lat) * height;
			const x = invLerp(minLon, maxLon, node.lon) * width;
			const point = new Point(x, y, node.id);
			points.push(point);
		}

		const ways = data.elements.filter(
			(n: Element) => n.type === "way",
		) as Ways[];
		for (const way of ways) {
			const ids = way.nodes;
			for (let i = 1; i < ids.length; i++) {
				const prev = points.find((p: Point) => p.id === ids[i - 1]);
				const current = points.find((p: Point) => p.id === ids[i]);
				if (prev && current) {
					const oneWay = way.tags.oneway || way.tags.lanes === 1;
					const segment = new Segment(prev, current, !!oneWay);
					segments.push(segment);
				}
			}
		}

		return {
			points,
			segments,
		};
	},
};
