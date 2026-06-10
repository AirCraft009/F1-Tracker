import {Constructor, ConstructorStanding, DriverStanding, F1DataSource, Race, Result} from "../api/generic/DataSource";
import {addCircuit} from "../util/mapSvgConverter";
import * as sea from "node:sea";
import {min} from "d3";

// selectors
const date_select = ".race-date-span-val"
const race_date_select = ".race-date-val"
const p1_date_select = ".p1-date-val"
const p2_date_select = ".p2-date-val"
const p3_date_select = ".p3-date-val"
const qual_date_select = ".qual-date-val"
const lap_select = ".lap-val"
const dist_select = ".distance-val"
const turn_select = ".turn-val"
const country_select = ".country-val"
const circuit_name_select = ".race-circuit-name"
const race_name_select = ".race-name-val"
const race_round_select = ".race-round"
const season_select = ".season-val"


/**
 * sets up the index.html
 * @param dataSource the data source to use
 * @param season the season to get the data from
 * @param r the round to get the data from
 * @param n the count of drivers shown in top lists
 */
export async function setupIndex(dataSource: F1DataSource, season: number| string, r : number | string, n: number) {
    let nextRace: Race | null = null
    try {
         nextRace = await dataSource.getRaceByRound(season , r)
    }
    catch (e) {
        alert("Getting Data was unsuccessful: " + e)
        return
    }
    if (!nextRace) {
        throw new Error("No next race found.");
    }

    console.log("Loading circuit: " + nextRace.circuit.id);
    console.log("getting HTML elements")
    let lap         = document.querySelectorAll(lap_select);
    let dist        = document.querySelectorAll(dist_select);
    let turns       = document.querySelectorAll(turn_select);
    let country     = document.querySelectorAll(country_select);
    let raceName    = document.querySelectorAll(race_name_select);
    let circuitName = document.querySelectorAll(circuit_name_select);
    let spanDate    = document.querySelectorAll(date_select);
    let p1          = document.querySelectorAll(p1_date_select);
    let p2          = document.querySelectorAll(p2_date_select);
    let p3          = document.querySelectorAll(p3_date_select);
    let quali       = document.querySelectorAll(qual_date_select);
    let race        = document.querySelectorAll(race_date_select);
    let round       = document.querySelectorAll(race_round_select);
    let seasonElem  = document.querySelectorAll(season_select);

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


    let startDate   = new Date(nextRace.pract1.date);
    let endDate     = new Date(nextRace.date);
    let formatter    = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day:    undefined,
        year:   "2-digit",
    })

    spanDate.forEach((date) => {
        date.textContent = formatDayRange(startDate, endDate) + ". " + formatter.format(endDate);
    })


    let p1Date = new Date(nextRace.pract1.date);
    p1.forEach((p1) => {
        p1.textContent = p1Date.toDateString();
    })

    let p2Date = new Date(nextRace.pract2.date);
    p2.forEach((p2) => {
        p2.textContent = p2Date.toDateString();
    })

    let p3Date = new Date(nextRace.pract3.date);
    p3.forEach((p3) => {
        p3.textContent = p3Date.toDateString();
    })

    let qualDate = new Date(nextRace.qualify.date);
    quali.forEach((qual) => {
        qual.textContent = qualDate.toDateString();
    })

    let raceDate = new Date(nextRace.date);
    race.forEach((race) => {
        race.textContent = raceDate.toDateString();
    })


    round.forEach((round) => {
        round.textContent = "Round " + nextRace.round + " · " + nextRace.season;
    })

    seasonElem.forEach((season) => {
        season.textContent = String(nextRace.season)
    })


    const driverSt = await dataSource.getDriverStandings(season)
    const standingsAppend = document.querySelector("#driver-top")
    if(!standingsAppend) {
        throw new Error("Driver Standings weren't found.")
    }


    let safeLength = Math.min(n, driverSt.length);
    for (let i = 0; i < n; i++) {
        if(!driverSt[i])
            continue;
        addDriverStanding(driverSt[i], standingsAppend)
    }



    const constSt = await dataSource.getConstructorStandings(season)
    const cStandingsAppend = document.querySelector("#constructor-top")
    if(!cStandingsAppend) {
        throw new Error("Driver Standings weren't found.")
    }

    safeLength = Math.min(n, constSt.length);
    for (let i = 0; i < n; i++) {
        if(!constSt[i])
            continue;
        addConstructorStanding(constSt[i], cStandingsAppend)
    }


    const raceRes = await dataSource.getRaceResult(season, "last");

    let baseT = raceRes.results[0].milliTime
    const timeAppend = document.querySelector("#time-top")
    if(!timeAppend) {
        throw new Error("Driver time list wasn't found.")
    }

    safeLength = Math.min(n, raceRes.results.length);
    for (let i = 0; i < safeLength; i++) {
        if(!raceRes.results[i])
            continue;
        addDriverTime(raceRes.results[i], baseT, timeAppend)
    }

    const timeHeader = document.querySelector("#time-header")
    if(!timeHeader) {
        throw new Error("Time header weren't found.")
    }
    timeHeader.textContent = "Latest · " + raceRes.race.name;



    const calender = await dataSource.getCalender(season)
    const calenderAppend = document.querySelector("#calender-top")
    if(!calenderAppend) {
        throw new Error("Calender scroll container wasn't found.")
    }

    for (let i = 0; i < calender.length; i++) {
        addCalenderEntry(calender[i], calenderAppend, nextRace.round)
    }



}

/*
        <div class="race-chip done">
            <div class="chip-round">Round 1</div>
            <div class="chip-country">Australia</div>
            <div class="chip-date">6–8 Mar 2026</div>
        </div>
 */
/**
 * @param race the race to add
 * @param appendElement the element to add the race to
 * @param nextRound the number of the next round (used to highlight)
 */
function addCalenderEntry(race: Race, appendElement: Element, nextRound: number) {

    let calenderContainer = document.createElement("div");
    calenderContainer.setAttribute("class", "race-chip");
    console.log(race.round);

    if(nextRound == race.round) {
        calenderContainer.classList.add("next");
    }else if((nextRound - 1) == race.round) {
        calenderContainer.classList.add("current");
    }else if(nextRound > (race.round - 1)) {
        calenderContainer.classList.add("done");
    }

    appendElement.appendChild(calenderContainer);
    let roundElem = document.createElement("div");
    roundElem.setAttribute("class", "chip-round");
    roundElem.textContent = "Round " + race.round;
    calenderContainer.appendChild(roundElem);

    let countryElem = document.createElement("div");
    countryElem.setAttribute("class", "chip-country");
    countryElem.textContent = race.circuit.location;
    calenderContainer.appendChild(countryElem);


    let dateElem = document.createElement("div");
    dateElem.setAttribute("class", "chip-date");
    const startDate = new Date(race.pract1.date);
    let endDate = new Date(race.date);

    dateElem.textContent = formatDayRange(startDate, endDate);
    calenderContainer.appendChild(dateElem);
}

/*
 *                 <div class="qs-row">
 *                     <span class="qs-pos p1">1</span>
 *                     <span class="qs-dot team-mercedes"></span>
 *                     <span class="qs-name">G. Russell</span>
 *                     <span class="qs-pts">+0.000</span>
 *                 </div>
 */
function addDriverTime(res: Result, baseT: number, appendElement: Element) {
    let timeDiff = res.milliTime - baseT;

    let row = document.createElement("div");
    row.setAttribute("class", "qs-row");
    appendElement.appendChild(row);

    let pos = document.createElement("span");
    pos.setAttribute("class", "qs-pos");
    pos.textContent = String(res.pos)
    row.appendChild(pos);

    let dot = document.createElement("span");
    console.log(res.teamP1.constructorId)
    dot.setAttribute("class", "qs-dot team-"+res.teamP1.constructorId);
    row.appendChild(dot);

    let name = document.createElement("span");
    name.setAttribute("class", "qs-name");
    name.textContent = res.driver.firstName.substring(0, 1) + ". " + res.driver.lastName;
    row.appendChild(name);

    let points = document.createElement("span");
    points.setAttribute("class", "qs-pts");
    points.textContent = String("+ " + (timeDiff / 1000) + "s");       // put the time in session
    row.appendChild(points);
}

/*
 *<div class="qs-row">
 *  <span class="qs-pos p1">1</span>
 *  <span class="qs-dot team-mercedes"></span>
 *  <span class="qs-name">Mercedes</span>
 *  <span class="qs-pts">194</span>
 *</div>
 */
function addConstructorStanding(constStand: ConstructorStanding, appendElement: Element){
    let row = document.createElement("div");
    row.setAttribute("class", "qs-row");
    appendElement.appendChild(row);

    let pos = document.createElement("span");
    pos.setAttribute("class", "qs-pos");
    pos.textContent = String(constStand.position)
    row.appendChild(pos);

    let dot = document.createElement("span");
    console.log(constStand.constructor.constructorId)
    dot.setAttribute("class", "qs-dot team-"+constStand.constructor.constructorId);
    row.appendChild(dot);

    let name = document.createElement("span");
    name.setAttribute("class", "qs-name");
    name.textContent = constStand.constructor.name
    row.appendChild(name);

    let points = document.createElement("span");
    points.setAttribute("class", "qs-points");
    points.textContent = String(constStand.points);
    row.appendChild(points);
}


/**
 * create this structure from driver
 *
 *<div class="qs-row">
 *  <span class="qs-pos p1">1</span>
 *  <span class="qs-dot team-mercedes"></span>
 *  <span class="qs-name">K. Antonelli</span>
 *  <span class="qs-pts">106</span>
 *</div>
 */
function addDriverStanding(standing: DriverStanding, appendElement: Element) {
    let row = document.createElement("div");
    row.setAttribute("class", "qs-row");
    appendElement.appendChild(row);

    let pos = document.createElement("span");
    pos.setAttribute("class", "qs-pos");
    pos.textContent = String(standing.position)
    row.appendChild(pos);

    let dot = document.createElement("span");
    console.log(standing.driver.teamId)
    dot.setAttribute("class", "qs-dot team-"+standing.driver.teamId);
    row.appendChild(dot);

    let name = document.createElement("span");
    name.setAttribute("class", "qs-name");
    name.textContent = standing.driver.firstName.substring(0, 1) + ". " + standing.driver.lastName;
    row.appendChild(name);

    let points = document.createElement("span");
    points.setAttribute("class", "qs-points");
    points.textContent = String(standing.points);
    row.appendChild(points);
}

function formatDayRange(from: Date, to: Date): string {
    return `${from.getDate()} - ${to.getDate()}`;
}