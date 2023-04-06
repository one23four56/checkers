import Controller from "./controller";
import * as Controllers from './controllers/index'

const controllers = Object.entries(Controllers).map(c => c[1])
const selected = []

export function loadMenu() {
    const teams = [document.getElementById("team1") as HTMLDivElement, document.getElementById("team2") as HTMLDivElement]

    for (const [index, team] of teams.entries())
        for (const constructor of controllers) {
            const controller: Controller = new constructor();
            const div = team.appendChild(document.createElement("div"));

            div.appendChild(document.createElement("b")).innerText = controller.name;
            div.appendChild(document.createElement("span")).innerText = "Difficulty: " + controller.difficulty;
            div.appendChild(document.createElement("br"))
            div.appendChild(document.createElement("p")).innerText = controller.description;

            div.addEventListener("click", () => {
                document.querySelectorAll(`div#team${index + 1} > div`).forEach(i => i.classList.remove("selected"))
                div.classList.add("selected")
                selected[index] = controller;
                document.querySelector<HTMLSpanElement>(`span.team${index + 1}`).innerText = ": " + controller.name;
            })
        }
} 

export function getControllers(): Promise<[Controller, Controller]> {
    return new Promise(res => {
        document.querySelector("button").addEventListener("click", () => {
            if (!selected[0] || !selected[1])
                return;
            
            res(selected as [Controller, Controller])
        })
    })
}

export function hideMenu() {
    document.body.className = "game"
    for (const child of document.body.children) {
        if (child.tagName.toLowerCase() === "script")
            continue;

        child.classList.add("start-menu-item", "hidden"); 
    }
}

export function showMenu() {
    document.body.className = "menu"
    document.querySelectorAll(":not(.start-menu-item, script)").forEach(e => e.remove());
    document.querySelectorAll(".start-menu-item").forEach(e => e.classList.remove("start-menu-item", "hidden"))
}