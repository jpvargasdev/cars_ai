import { GraphEditor } from "./editors/graph-editor";
import { World } from "./world";
import { Graph } from "./math/graph";
import { Viewport } from "./viewport";
import { scale } from "./math/utils";
import { StopEditor } from "./editors/stop-editor";
import { CrossEditor } from "./editors/cross-editor";
import { StartEditor } from "./editors/start-editor";
import { TargetEditor } from "./editors/target-editor";
import { ParkingEditor } from "./editors/parking-editor";
import { LightEditor } from "./editors/light-editor";
import { YieldEditor } from "./editors/yield-editor";

const btnSave = document.getElementById("btn-save");
const btnDelete = document.getElementById("btn-dispose");

const btnGraph = document.getElementById("graphBtn");
const btnStop = document.getElementById("stopBtn");
const yieldBtn = document.getElementById("yieldBtn");
const crossingBtn = document.getElementById("crossingBtn");
const parkingBtn = document.getElementById("parkingBtn");
const lightBtn = document.getElementById("lightBtn");
const startBtn = document.getElementById("startBtn");
const targetBtn = document.getElementById("targetBtn");
const input = document.getElementById("fileInput");
const title = document.getElementById("title");

if (btnSave) {
	btnSave.addEventListener("click", save);
}

if (btnDelete) {
	btnDelete.addEventListener("click", dispose);
}

if (btnGraph) {
	btnGraph.addEventListener("click", () => setMode("graph"));
}

if (btnStop) {
	btnStop.addEventListener("click", () => setMode("stop"));
}

if (crossingBtn) {
	crossingBtn.addEventListener("click", () => setMode("crossing"));
}

if (startBtn) {
	startBtn.addEventListener("click", () => setMode("start"));
}

if (targetBtn) {
	targetBtn.addEventListener("click", () => setMode("target"));
}

if (parkingBtn) {
	parkingBtn.addEventListener("click", () => setMode("parking"));
}

if (lightBtn) {
	lightBtn.addEventListener("click", () => setMode("light"));
}

if (yieldBtn) {
	yieldBtn.addEventListener("click", () => setMode("yield"));
}

if (input) {
	input.addEventListener("change", load);
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement;
canvas.width = 800;
canvas.height = 800;

window.addEventListener("DOMContentLoaded", (event) => {
	resizeCanvas();

	window.addEventListener("resize", resizeCanvas);

	function resizeCanvas() {
		canvas.width = window.innerWidth * 0.8; // Set canvas width to 80% of the viewport width
		canvas.height = window.innerHeight * 0.8; // Set canvas height to 80% of the viewport height
	}
});

const ctx = canvas.getContext("2d");

if (!ctx) {
	throw new Error("Could not get 2d context");
}

const worldString = localStorage.getItem("world");
const worldInfo: World = worldString ? JSON.parse(worldString) : null;

let world = worldInfo ? World.load(worldInfo) : new World(new Graph());
const graph = world.graph;

const viewport = new Viewport(canvas, world.zoom, world.offset);

let oldGraphHash = graph.hash();

const tools = {
	graph: {
		button: btnGraph,
		editor: new GraphEditor(viewport, graph),
	},
	stop: {
		button: btnStop,
		editor: new StopEditor(viewport, world),
	},
	crossing: {
		button: crossingBtn,
		editor: new CrossEditor(viewport, world),
	},
	start: {
		button: startBtn,
		editor: new StartEditor(viewport, world),
	},
	target: {
		button: targetBtn,
		editor: new TargetEditor(viewport, world),
	},
	parking: {
		button: parkingBtn,
		editor: new ParkingEditor(viewport, world),
	},
	light: {
		button: lightBtn,
		editor: new LightEditor(viewport, world),
	},
	yield: {
		button: yieldBtn,
		editor: new YieldEditor(viewport, world),
	},
} as const;

setMode("graph");

function animate() {
	viewport.reset();
	if (graph.hash() !== oldGraphHash) {
		world.generate();
		oldGraphHash = graph.hash();
	}

	if (!ctx) {
		throw new Error("Could not get 2d context");
	}

	const viewPoint = scale(viewport.getOffset(), -1);

	world.draw(ctx, viewPoint);
	ctx.globalAlpha = 0.3;

	for (const tool of Object.values(tools)) {
		tool.editor.display();
	}

	requestAnimationFrame(animate);
}

animate();

function dispose() {
	tools.graph.editor.dispose();
	world.markings.length = 0;
	if (title) {
		title.textContent = "World Editor";
		world.title = "World Editor";
	}
}

function save() {
	world.zoom = viewport.zoom;
	world.offset = viewport.offset;

	const fileName = window.prompt("Enter file name:", "");
	if (fileName) {
		const element = document.createElement("a");
		element.setAttribute(
			"href",
			"data:application/json;charset=utf-8," +
				encodeURIComponent(JSON.stringify(world)),
		);
		element.setAttribute("download", `${fileName}.world`);
		element.click();
		localStorage.setItem("world", JSON.stringify(world));
		alert("File saved as: " + fileName);
	}
}

function load(event: any) {
	const file = event.target.files[0];

	if (!file) {
		alert("No file selected");
		return;
	}

	const reader = new FileReader();
	reader.readAsText(file);
	reader.onload = (evt) => {
		const fileContent = evt.target!.result;
		const jsonData = JSON.parse(String(fileContent));
		world = World.load(jsonData);

		// Get the file name and append it to the title
		const fileName = file.name;
		if (title) {
			const worldTitle = `World Editor - ${fileName}`;
			world.title = worldTitle;
		}

		localStorage.setItem("world", JSON.stringify(world));
		location.reload();
	};
}

function setMode(mode: keyof typeof tools) {
	disableEditors();
	const { button, editor } = tools[mode];
	if (button && editor) {
		button.style.backgroundColor = "white";
		button.style.filter = "";
		editor.enable();
	}
}

function disableEditors() {
	for (const tool of Object.values(tools)) {
		if (tool.button && tool.editor) {
			tool.button.style.backgroundColor = "gray";
			tool.button.style.filter = "grayscale(0%)";
			tool.editor.disable();
		}
	}
}
