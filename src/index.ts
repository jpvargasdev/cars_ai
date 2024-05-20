import { CarSimulation } from "./car-simulator";
import { WorldEditor } from "./world-editor";

const btnWorldEditor = document.getElementById("world-editor");
const btnCarSimulator = document.getElementById("car-simulator");

btnWorldEditor?.addEventListener("click", () => {
	localStorage.setItem("status", "worldEditor");
	worldEditor.show();
	carSimulator.hide();
});
btnCarSimulator?.addEventListener("click", () => {
	localStorage.setItem("status", "carSimulator");
	worldEditor.hide();
	carSimulator.show();
});
const worldEditor = new WorldEditor();
const carSimulator = new CarSimulation();

if (localStorage.getItem("status") === "worldEditor") {
	worldEditor.show();
	carSimulator.hide();
} else {
	worldEditor.hide();
}
