type Point = { x: number; y: number; offset?: number };
type Ray = { x: number; y: number }[];

type Borders = Point[][];
type Rays = [Point, Point][];
type Readings = (Point | null)[];
type Polygon = Point[];
type ControlType = "KEYS" | "DUMMY" | "AI";

type DrawOptions = {
	size?: number;
	color?: string;
	outline?: boolean;
	fill?: boolean;
	fillStyle?: string;
	stroke?: string;
	lineWidth?: number;
	width?: number;
	dash?: number[];
	join?: CanvasLineJoin;
	cap?: CanvasLineCap;
};

declare module "*.png";

declare module "*.json" {
	const value: any;
	export default value;
}

declare module "*.world" {
	const value: any;
	export default value;
}
