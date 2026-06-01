import {F1DataSource} from "../generic/DataSource";
import {addCircuit, drawCircuitId} from "../../util/mapSvgConverter";

// selectors
const date_select = ".date-val"
const lap_select = ".lap-val"
const dist_select = ".distance-val"
const turn_select = ".turn-val"
const country_select = ".country-val"
const circuit_name_select = ".race-circuit-name"
const race_name_select = ".race-name"




export async function setupIndex(dataSource: F1DataSource) {
    let nextRace = await dataSource.getRaceByRound("current", "next")
    if (!nextRace) {
        throw new Error("No next race found.");
    }

    console.log("Loading circuit: " + nextRace.circuit.name);
    console.log("getting HTML elements")
    let lap         = document.querySelectorAll(lap_select);
    let dist        = document.querySelectorAll(dist_select);
    let turns       = document.querySelectorAll(turn_select);
    let country     = document.querySelectorAll(country_select);
    let raceName    = document.querySelectorAll(race_name_select);
    let circuitName = document.querySelectorAll(circuit_name_select);
    let date        = document.querySelectorAll(date_select);

    if(lap.length == 0 || dist.length == 0 || turns.length == 0 || country.length == 0 || circuitName.length == 0 || raceName.length == 0 || circuitName.length == 0) {
        throw new Error("Circuit Attribute Fields weren't found.");
    }

    await addCircuit(nextRace.circuit, ".track-svg-wrap", turns, dist, lap, country);

    raceName.forEach((raceName) => {
        raceName.textContent = nextRace.name;
    })

    circuitName.forEach((circuitName) => {
        circuitName.textContent = nextRace.circuit.name;
    })

    date.forEach((date) => {
        date.textContent = nextRace.date;
    })
}