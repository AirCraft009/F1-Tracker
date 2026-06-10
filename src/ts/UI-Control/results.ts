import  { F1DataSource, Race, RaceResults, Result } from "../api/generic/DataSource";

export async function setupResults(dSource: F1DataSource, season: number | string) {
    let calendar: Race[];

    try {
        calendar = await dSource.getCalender(season);
    } catch (e) {
        alert("Failed to load race calendar: " + e);
        throw new Error("Failed to load race calendar: " + e);
    }

    if (calendar.length === 0) {
        throw new Error("No races found for season: " + season);
    }

    // Determine which rounds are in the past (date <= today)
    const today     = new Date();
    const nextRace  = calendar.find(r => new Date(r.date) > today) ?? null;

    // Fetch all past race results in parallel
    let results: RaceResults[] = [];
    try {
        results = await dSource.getRaceResults(season);
        console.log(results);
    } catch (e) {
        alert("Failed to load race results: " + e);
        throw new Error("Failed to load race results: " + e);
    }



    const sidebar = document.querySelector("#races-sidebar-list");
    if (!sidebar) throw new Error("failed to locate #races-sidebar-list");
    buildSidebarNav(calendar, nextRace, sidebar);


    const resultsCol = document.querySelector("#results-col");
    if (!resultsCol) throw new Error("failed to locate #results-col");

    const reversedResults = [...results].reverse();
    for (const raceResult of reversedResults) {
        buildRaceResultBlock(raceResult, resultsCol);
    }
}


// Sidebar nav
//
// <div class="race-nav-item [active|future]">
//   <span class="rni-dot [done|live|future]"></span>
//   <span class="rni-round">R{round}</span>
//   <div class="rni-country">{circuit.location first word}</div>
//   <div class="rni-winner">{winner lastName | date | LIVE}</div>
// </div>

function buildSidebarNav(
    calendar:  Race[],
    nextRace:  Race | null,
    appendElem: Element
) {
    const today = new Date();

    for (let i = 0; i < calendar.length; i++) {
        const race    = calendar[i];
        const raceDate = new Date(race.date);
        const isPast   = raceDate <= today;
        const isNext   = nextRace?.round === race.round;
        const isFuture = !isPast && !isNext;

        const item = document.createElement("div");
        item.classList.add("race-nav-item");
        if (isFuture) item.classList.add("future");

        if (isPast && (i === 0 || new Date(calendar[i - 1]?.date) > today || i === calendar.filter(r => new Date(r.date) <= today).length - 1)) {
            // last past race = active
        }
        appendElem.appendChild(item);

        const dot = document.createElement("span");
        dot.classList.add("rni-dot");
        if (isPast)   dot.classList.add("done");
        else if (isNext) dot.classList.add("live");
        else          dot.classList.add("future");
        item.appendChild(dot);

        const round = document.createElement("span");
        round.classList.add("rni-round");
        round.textContent = "R" + race.round;
        item.appendChild(round);

        const country = document.createElement("div");
        country.classList.add("rni-country");

        country.textContent = race.circuit.location.split(" ")[0];
        item.appendChild(country);

        const winner = document.createElement("div");
        winner.classList.add("rni-winner");
        if (isNext) {
            winner.textContent = formatShortDate(race.date);
        } else if (isFuture) {
            winner.textContent = formatShortDate(race.date);
        } else {
            winner.textContent = "—";
        }
        item.appendChild(winner);


        item.dataset["round"] = String(race.round);
    }
}

// Fill winner names into sidebar after results are known
export function fillSidebarWinners(results: RaceResults[]) {
    for (const rr of results) {
        const item = document.querySelector(`.race-nav-item[data-round="${rr.race.round}"]`);
        if (!item) continue;
        const winnerEl = item.querySelector(".rni-winner");
        if (!winnerEl) continue;
        const winner = rr.results[0];
        if (winner) winnerEl.textContent = winner.driver.lastName;
    }
}


// Race result block
//
// <div class="race-result-block">
//   <div class="rrb-header">
//     <div>
//       <div class="rrb-round">Round {round} · {circuit.name}</div>
//       <div class="rrb-race-name">{race.name}</div>
//       <div class="rrb-circuit">{circuit.location}</div>
//     </div>
//     <div class="rrb-date-badge">{date}</div>
//   </div>
//   <div class="podium-trio">  ← top 3 slots  </div>
//   <table class="rr-table">  ← all results   </table>
// </div>

function buildRaceResultBlock(rr: RaceResults, appendElem: Element) {
    const block = document.createElement("div");
    block.classList.add("race-result-block");
    appendElem.appendChild(block);

    // Header
    const header = document.createElement("div");
    header.classList.add("rrb-header");
    block.appendChild(header);

    const headerLeft = document.createElement("div");
    header.appendChild(headerLeft);

    const roundDiv = document.createElement("div");
    roundDiv.classList.add("rrb-round");
    roundDiv.textContent = "Round " + rr.race.round + " · " + rr.race.circuit.name;
    headerLeft.appendChild(roundDiv);

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("rrb-race-name");
    nameDiv.textContent = rr.race.name;
    headerLeft.appendChild(nameDiv);

    const circuitDiv = document.createElement("div");
    circuitDiv.classList.add("rrb-circuit");
    circuitDiv.textContent = rr.race.circuit.location;
    headerLeft.appendChild(circuitDiv);

    const dateBadge = document.createElement("div");
    dateBadge.classList.add("rrb-date-badge");
    dateBadge.textContent = formatDisplayDate(rr.race.date);
    header.appendChild(dateBadge);

    // Podium trio (top 3)
    if (rr.results.length >= 3) {
        const trio = document.createElement("div");
        trio.classList.add("podium-trio");
        block.appendChild(trio);

        const podiumPositions = ["Race Winner", "2nd Place", "3rd Place"];
        for (let i = 0; i < 3; i++) {
            buildPodiumSlot(rr.results[i], podiumPositions[i], trio);
        }
    }

    // Full results table
    buildResultsTable(rr.results, block);
}


// Podium slot
//
// <div class="podium-slot p{1|2|3}">
//   <span class="ps-num">{pos}</span>
//   <div class="ps-pos">{posLabel}</div>
//   <div class="ps-driver">{firstName} {lastName}</div>
//   <div class="ps-team"><span class="ps-team-dot team-{teamId}"></span> {team.name}</div>
//   <div class="ps-time">{time | status}</div>
// </div>

function buildPodiumSlot(result: Result, posLabel: string, appendElem: Element) {
    const slot = document.createElement("div");
    slot.classList.add("podium-slot", "p" + result.pos);
    appendElem.appendChild(slot);

    const num = document.createElement("span");
    num.classList.add("ps-num");
    num.textContent = String(result.pos);
    slot.appendChild(num);

    const posDiv = document.createElement("div");
    posDiv.classList.add("ps-pos");
    posDiv.textContent = posLabel;
    slot.appendChild(posDiv);

    const driverDiv = document.createElement("div");
    driverDiv.classList.add("ps-driver");
    driverDiv.textContent = result.driver.firstName + " " + result.driver.lastName;
    slot.appendChild(driverDiv);

    const teamDiv = document.createElement("div");
    teamDiv.classList.add("ps-team");
    const teamDot = document.createElement("span");
    teamDot.classList.add("ps-team-dot", "team-" + result.teamP1.constructorId);
    teamDiv.appendChild(teamDot);
    teamDiv.append(" " + result.teamP1.name);
    slot.appendChild(teamDiv);

    const timeDiv = document.createElement("div");
    timeDiv.classList.add("ps-time");
    timeDiv.textContent = result.pos === 1
        ? formatRaceTime(result.milliTime)
        : result.status !== "Finished"
            ? result.status
            : "+" + formatGapTime(result.milliTime);
    slot.appendChild(timeDiv);
}


// Full results table
//
// <table class="rr-table">
//   <thead><tr> Pos / Driver / Team / Gap / Pts </tr></thead>
//   <tbody>
//     <tr>
//       <td class="rr-pos [top]">{pos}</td>
//       <td><div class="rr-driver">{initial}. {lastName} <span class="rr-num">#{num}</span></div></td>
//       <td class="team-name-small">{team short}</td>
//       <td class="rr-gap">{gap | time | status}</td>
//       <td class="rr-pts [zero]">{points}</td>
//     </tr>
//   </tbody>
// </table>

function buildResultsTable(results: Result[], appendElem: Element) {
    const table = document.createElement("table");
    table.classList.add("rr-table");
    appendElem.appendChild(table);

    // thead
    const thead = document.createElement("thead");
    table.appendChild(thead);
    const hRow = document.createElement("tr");
    thead.appendChild(hRow);
    for (const heading of ["Pos", "Driver", "Team", "Gap / Time", "Pts"]) {
        const th = document.createElement("th");
        if (heading === "Pts") th.classList.add("pts");
        th.textContent = heading;
        hRow.appendChild(th);
    }

    // tbody
    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    const leaderMillis = results[0]?.milliTime ?? 0;

    for (const result of results) {
        const row = document.createElement("tr");
        tbody.appendChild(row);

        const posTd = document.createElement("td");
        posTd.classList.add("rr-pos");
        if (result.pos <= 10) posTd.classList.add("top");
        posTd.textContent = String(result.pos);
        row.appendChild(posTd);

        const driverTd = document.createElement("td");
        row.appendChild(driverTd);
        const driverDiv = document.createElement("div");
        driverDiv.classList.add("rr-driver");
        const initial = result.driver.firstName.charAt(0) + ".";
        driverDiv.textContent = initial + " " + result.driver.lastName + " ";
        const numSpan = document.createElement("span");
        numSpan.classList.add("rr-num");
        numSpan.textContent = "#" + (result.driver.num ?? "?");
        driverDiv.appendChild(numSpan);
        driverTd.appendChild(driverDiv);

        const teamTd = document.createElement("td");
        teamTd.classList.add("team-name-small");
        teamTd.textContent = result.teamP1.name;
        row.appendChild(teamTd);

        const gapTd = document.createElement("td");
        gapTd.classList.add("rr-gap");
        if (result.pos === 1) {
            gapTd.textContent = formatRaceTime(result.milliTime);
        } else if (result.status !== "Finished") {
            gapTd.textContent = result.status;
        } else {
            const gapMs = result.milliTime - leaderMillis;
            gapTd.textContent = "+" + formatGapTime(gapMs);
        }
        row.appendChild(gapTd);

        const ptsTd = document.createElement("td");
        ptsTd.classList.add("rr-pts");
        if (result.points === 0) ptsTd.classList.add("zero");
        ptsTd.textContent = String(result.points);
        row.appendChild(ptsTd);
    }
}



// "2026-03-08" -> "8 Mar 2026"
function formatDisplayDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// "2026-06-05" -> "5–7 Jun"
function formatShortDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

// millis -> "1:23:06.801" race winner time
function formatRaceTime(ms: number): string {
    if (!ms || ms === 0) return "—";
    const totalSec = Math.floor(ms / 1000);
    const millis   = ms % 1000;
    const hours    = Math.floor(totalSec / 3600);
    const minutes  = Math.floor((totalSec % 3600) / 60);
    const seconds  = totalSec % 60;
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(millis).padStart(3, "0")}`;
}

// millis gap -> "2.974" or "1:02.4"
function formatGapTime(ms: number): string {
    if (!ms || ms === 0) return "0.000";
    const totalSec = ms / 1000;
    if (totalSec < 60) {
        return totalSec.toFixed(3);
    }
    const minutes = Math.floor(totalSec / 60);
    const seconds = (totalSec % 60).toFixed(1);
    return `${minutes}:${String(seconds).padStart(4, "0")}`;
}
