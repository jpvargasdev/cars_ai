import { GraphEditor } from "./world/editors/graph-editor";
import { World } from "./world/world";
import { Graph } from "./world/math/graph";
import { Viewport } from "./world/viewport";
import { scale } from "./world/math/utils";
import { StopEditor } from "./world/editors/stop-editor";
import { CrossEditor } from "./world/editors/cross-editor";
import { StartEditor } from "./world/editors/start-editor";
import { TargetEditor } from "./world/editors/target-editor";
import { ParkingEditor } from "./world/editors/parking-editor";
import { LightEditor } from "./world/editors/light-editor";
import { YieldEditor } from "./world/editors/yield-editor";

export class WorldEditor {
	private btnSave: HTMLElement | null;
	private btnDelete: HTMLElement | null;
	private btnGraph: HTMLElement | null;
	private btnStop: HTMLElement | null;
	private yieldBtn: HTMLElement | null;
	private crossingBtn: HTMLElement | null;
	private parkingBtn: HTMLElement | null;
	private lightBtn: HTMLElement | null;
	private startBtn: HTMLElement | null;
	private targetBtn: HTMLElement | null;
	private input: HTMLElement | null;
	private title: HTMLElement | null;
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D | null;
	private world: World;
	private worldContainer: HTMLDivElement;
	private graph: Graph;
	private viewport: Viewport;
	private oldGraphHash: string;
	private tools: { [key: string]: { button: HTMLElement | null; editor: any } };

	constructor() {
		this.btnSave = document.getElementById("btn-save");
		this.btnDelete = document.getElementById("btn-dispose");
		this.btnGraph = document.getElementById("graphBtn");
		this.btnStop = document.getElementById("stopBtn");
		this.yieldBtn = document.getElementById("yieldBtn");
		this.crossingBtn = document.getElementById("crossingBtn");
		this.parkingBtn = document.getElementById("parkingBtn");
		this.lightBtn = document.getElementById("lightBtn");
		this.startBtn = document.getElementById("startBtn");
		this.targetBtn = document.getElementById("targetBtn");
		this.input = document.getElementById("fileInput");
		this.title = document.getElementById("title");
		this.worldContainer = document.getElementById(
			"world-container",
		) as HTMLDivElement;
		this.ctx = null;

		this.canvas = document.getElementById("world-canvas") as HTMLCanvasElement;
		if (this.canvas) {
			this.canvas.width = window.innerWidth;
			this.canvas.height = window.innerHeight;
			this.ctx = this.canvas.getContext("2d");

			if (!this.ctx) {
				throw new Error("Could not get 2d context");
			}
		}

		const worldString = localStorage.getItem("world");
		const worldInfo: World = worldString ? JSON.parse(worldString) : null;
		this.world = worldInfo ? World.load(worldInfo) : new World(new Graph());
		this.graph = this.world.graph;

		this.viewport = new Viewport(
			this.canvas,
			this.world.zoom,
			this.world.offset,
		);
		this.oldGraphHash = this.graph.hash();

		this.tools = {
			graph: {
				button: this.btnGraph,
				editor: new GraphEditor(this.viewport, this.graph),
			},
			stop: {
				button: this.btnStop,
				editor: new StopEditor(this.viewport, this.world),
			},
			crossing: {
				button: this.crossingBtn,
				editor: new CrossEditor(this.viewport, this.world),
			},
			start: {
				button: this.startBtn,
				editor: new StartEditor(this.viewport, this.world),
			},
			target: {
				button: this.targetBtn,
				editor: new TargetEditor(this.viewport, this.world),
			},
			parking: {
				button: this.parkingBtn,
				editor: new ParkingEditor(this.viewport, this.world),
			},
			light: {
				button: this.lightBtn,
				editor: new LightEditor(this.viewport, this.world),
			},
			yield: {
				button: this.yieldBtn,
				editor: new YieldEditor(this.viewport, this.world),
			},
		};

		this.initEventListeners();
		this.setMode("graph");

		window.addEventListener("DOMContentLoaded", this.resizeCanvas.bind(this));
		window.addEventListener("resize", this.resizeCanvas.bind(this));

		this.animate();
	}

	private initEventListeners() {
		if (this.btnSave) {
			this.btnSave.addEventListener("click", this.save.bind(this));
		}
		if (this.btnDelete) {
			this.btnDelete.addEventListener("click", this.dispose.bind(this));
		}
		if (this.btnGraph) {
			this.btnGraph.addEventListener("click", () => this.setMode("graph"));
		}
		if (this.btnStop) {
			this.btnStop.addEventListener("click", () => this.setMode("stop"));
		}
		if (this.crossingBtn) {
			this.crossingBtn.addEventListener("click", () =>
				this.setMode("crossing"),
			);
		}
		if (this.startBtn) {
			this.startBtn.addEventListener("click", () => this.setMode("start"));
		}
		if (this.targetBtn) {
			this.targetBtn.addEventListener("click", () => this.setMode("target"));
		}
		if (this.parkingBtn) {
			this.parkingBtn.addEventListener("click", () => this.setMode("parking"));
		}
		if (this.lightBtn) {
			this.lightBtn.addEventListener("click", () => this.setMode("light"));
		}
		if (this.yieldBtn) {
			this.yieldBtn.addEventListener("click", () => this.setMode("yield"));
		}
		if (this.input) {
			this.input.addEventListener("change", this.load.bind(this));
		}
	}

	private resizeCanvas() {
		this.canvas.width = window.innerWidth * 0.8;
		this.canvas.height = window.innerHeight * 0.8;
	}

	private animate() {
		if (!this.ctx) {
			return;
		}
		this.viewport.reset();
		if (this.graph.hash() !== this.oldGraphHash) {
			this.world.generate();
			this.oldGraphHash = this.graph.hash();
		}

		const viewPoint = scale(this.viewport.getOffset(), -1);
		this.world.draw(this.ctx, viewPoint);
		this.ctx.globalAlpha = 0.3;

		for (const tool of Object.values(this.tools)) {
			tool.editor.display();
		}

		requestAnimationFrame(this.animate.bind(this));
	}

	private dispose() {
		this.tools.graph.editor.dispose();
		this.world.markings.length = 0;
		if (this.title) {
			this.title.textContent = "World Editor";
			this.world.title = "World Editor";
		}
	}

	private save() {
		this.world.zoom = this.viewport.zoom;
		this.world.offset = this.viewport.offset;

		const fileName = window.prompt("Enter file name:", "");
		if (fileName) {
			const element = document.createElement("a");
			element.setAttribute(
				"href",
				"data:application/json;charset=utf-8," +
					encodeURIComponent(JSON.stringify(this.world)),
			);
			element.setAttribute("download", `${fileName}.world`);
			element.click();
			localStorage.setItem("world", JSON.stringify(this.world));
			alert("File saved as: " + fileName);
		}
	}

	private load(event: Event) {
		const file = (event.target as HTMLInputElement).files![0];
		if (!file) {
			alert("No file selected");
			return;
		}

		const reader = new FileReader();
		reader.readAsText(file);
		reader.onload = (evt) => {
			const fileContent = evt!.target!.result;
			const jsonData = JSON.parse(String(fileContent));
			this.world = World.load(jsonData);

			const fileName = file.name;
			if (this.title) {
				const worldTitle = `World Editor - ${fileName}`;
				this.world.title = worldTitle;
			}

			localStorage.setItem("world", JSON.stringify(this.world));
			location.reload();
		};
	}

	private setMode(mode: keyof typeof this.tools) {
		this.disableEditors();
		const { button, editor } = this.tools[mode];
		if (button && editor) {
			button.style.backgroundColor = "white";
			button.style.filter = "";
			editor.enable();
		}
	}

	public hide() {
		if (this.worldContainer) {
			this.worldContainer.style.display = "none";
		}
	}

	public show() {
		if (this.worldContainer) {
			this.worldContainer.style.display = "flex";
		}
	}

	private disableEditors() {
		for (const tool of Object.values(this.tools)) {
			if (tool.button && tool.editor) {
				tool.button.style.backgroundColor = "gray";
				tool.button.style.filter = "grayscale(0%)";
				tool.editor.disable();
			}
		}
	}
}
