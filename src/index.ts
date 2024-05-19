import { CarSimulation } from "./car-simulator";
import { WorldEditor } from "./world-editor";

const btnWorldEditor = document.getElementById("world-editor");
const btnCarSimulator = document.getElementById("car-simulator");

btnWorldEditor?.addEventListener("click", () => {
	worldEditor.show();
	carSimulator.hide();
});
btnCarSimulator?.addEventListener("click", () => {
	worldEditor.hide();
	carSimulator.show();
});

const worldEditor = new WorldEditor();
const carSimulator = new CarSimulation();
carSimulator.hide();
