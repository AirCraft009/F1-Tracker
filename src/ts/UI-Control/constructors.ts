import { ConstructorStanding, DriverStanding, F1DataSource } from "../api/generic/DataSource";
import {nationalityToFlag} from "./sharedElements";


// Build a lookup map: constructorId -> DriverStanding[]
// DriverStanding already carries driver.teamId
function buildDriverMap(driverStandings: DriverStanding[]): Map<string, DriverStanding[]> {
    const map = new Map<string, DriverStanding[]>();
    for (const ds of driverStandings) {
        const teamId = ds.driver.teamId;
        if (!teamId) continue;
        if (!map.has(teamId)) map.set(teamId, []);
        map.get(teamId)!.push(ds);
    }
    return map;
}

// Entry point called from constructorMain.ts
// Both standings are fetched in parallel; driver data enriches every builder.
export async function setupConstructors(dSource: F1DataSource, season: number | string) {
    let constructorStandings: ConstructorStanding[];
    let driverStandings:      DriverStanding[];

    try {
        [constructorStandings, driverStandings] = await Promise.all([
            dSource.getConstructorStandings(season),
            dSource.getDriverStandings(season),
        ]);
    } catch (e) {
        alert("Failed to load standings: " + e);
        throw new Error("Failed to get standings: " + e);
    }

    const driverMap = buildDriverMap(driverStandings);
    const maxPts    = constructorStandings[0].points;


    const leaderBanner = document.querySelector("#leader-banner");
    if (!leaderBanner) throw new Error("failed to locate #leader-banner");
    buildLeaderBanner(constructorStandings[0], driverMap, leaderBanner);

    const cardsGrid = document.querySelector("#constructors-grid");
    if (!cardsGrid) throw new Error("failed to locate #constructors-grid");
    for (const standing of constructorStandings) {
        buildConstructorCard(standing, driverMap, cardsGrid, maxPts);
    }

    const tableBody = document.querySelector("#full-standing-top");
    if (!tableBody) throw new Error("failed to locate #full-standing-top");
    for (const standing of constructorStandings) {
        buildTableRow(standing, driverMap, tableBody, maxPts);
    }
}

// Leader banner
//
// <div class="leader-banner">
//   <div>
//     <div class="leader-tag">Constructors' Leader</div>
//     <div class="leader-name">{name}</div>
//     <div class="leader-subtitle">{nationality flag + nationality}</div>
//     <div class="leader-drivers">
//       <span class="driver-chip">#{num} {lastName} · {pts} pts</span>  ← one per driver
//     </div>
//   </div>
//   <div class="leader-pts-block">
//     <div class="leader-pts-num">{points}</div>
//     <div class="leader-pts-label">Total Points</div>
//   </div>
// </div>
function buildLeaderBanner(
    standing:  ConstructorStanding,
    driverMap: Map<string, DriverStanding[]>,
    appendElem: Element
) {
    const banner = document.createElement("div");
    banner.classList.add("leader-banner");
    appendElem.appendChild(banner);

    // Left side
    const left = document.createElement("div");
    banner.appendChild(left);

    const tag = document.createElement("div");
    tag.classList.add("leader-tag");
    tag.textContent = "Constructors' Leader";
    left.appendChild(tag);

    const name = document.createElement("div");
    name.classList.add("leader-name");
    name.textContent = standing.constructor.name;
    left.appendChild(name);

    if (standing.constructor.nationality) {
        const sub = document.createElement("div");
        sub.classList.add("leader-subtitle");
        sub.textContent =
            nationalityToFlag(standing.constructor.nationality) +
            " " +
            standing.constructor.nationality;
        left.appendChild(sub);
    }

    // Driver chips
    const drivers = driverMap.get(standing.constructor.constructorId);
    if (drivers && drivers.length > 0) {
        const driversDiv = document.createElement("div");
        driversDiv.classList.add("leader-drivers");
        left.appendChild(driversDiv);

        for (const ds of drivers) {
            const chip = document.createElement("span");
            chip.classList.add("driver-chip");
            chip.textContent =
                "#" + (ds.driver.num ?? "?") +
                " " + ds.driver.lastName +
                " · " + ds.points + " pts";
            driversDiv.appendChild(chip);
        }
    }

    // Right side — points block
    const right = document.createElement("div");
    right.classList.add("leader-pts-block");
    banner.appendChild(right);

    const ptsNum = document.createElement("div");
    ptsNum.classList.add("leader-pts-num");
    ptsNum.textContent = String(standing.points);
    right.appendChild(ptsNum);

    const ptsLabel = document.createElement("div");
    ptsLabel.classList.add("leader-pts-label");
    ptsLabel.textContent = "Total Points";
    right.appendChild(ptsLabel);
}

// Constructor card
//
// <div class="constructor-card">
//   <span class="cc-accent team-{id}"></span>
//   <span class="cc-pos-bg">{pos}</span>
//   <div class="cc-top">
//     <div>
//       <div class="cc-pos-badge">P{pos}</div>
//       <div class="cc-name">{name}</div>
//       <div class="cc-engine">{flag} {nationality}</div>
//     </div>
//     <div>
//       <div class="cc-pts">{points}</div>
//       <div class="cc-pts-label">{"points" | "−N pts"}</div>
//     </div>
//   </div>
//   <div class="cc-bar"><div class="cc-bar-fill team-{id}" style="width:{pct}%"></div></div>
//   <div class="cc-drivers-row">
//     <span class="cc-driver-pill">#{num} {lastName} · {pts}</span>  ← one per driver
//   </div>
// </div>
function buildConstructorCard(
    standing:  ConstructorStanding,
    driverMap: Map<string, DriverStanding[]>,
    appendElem: Element,
    maxPoints:  number
) {
    const card = document.createElement("div");
    card.classList.add("constructor-card");
    appendElem.appendChild(card);

    const accent = document.createElement("span");
    accent.classList.add("cc-accent", "team-" + standing.constructor.constructorId);
    card.appendChild(accent);

    const posBg = document.createElement("span");
    posBg.classList.add("cc-pos-bg");
    posBg.textContent = String(standing.position);
    card.appendChild(posBg);

    // Top row
    const top = document.createElement("div");
    top.classList.add("cc-top");
    card.appendChild(top);

    const nameBlock = document.createElement("div");
    top.appendChild(nameBlock);

    const posBadge = document.createElement("div");
    posBadge.classList.add("cc-pos-badge");
    posBadge.textContent = "P" + standing.position;
    nameBlock.appendChild(posBadge);

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("cc-name");
    nameDiv.textContent = standing.constructor.name;
    nameBlock.appendChild(nameDiv);

    if (standing.constructor.nationality) {
        const natDiv = document.createElement("div");
        natDiv.classList.add("cc-engine");
        natDiv.textContent =
            nationalityToFlag(standing.constructor.nationality) +
            " " +
            standing.constructor.nationality;
        nameBlock.appendChild(natDiv);
    }

    const ptsBlock = document.createElement("div");
    top.appendChild(ptsBlock);

    const ptsDiv = document.createElement("div");
    ptsDiv.classList.add("cc-pts");
    ptsDiv.textContent = String(standing.points);
    ptsBlock.appendChild(ptsDiv);

    const ptsLabel = document.createElement("div");
    ptsLabel.classList.add("cc-pts-label");
    ptsLabel.textContent =
        standing.points === maxPoints ? "points" : String(standing.points - maxPoints) + " pts";
    ptsBlock.appendChild(ptsLabel);

    // Points bar
    const barWrap = document.createElement("div");
    barWrap.classList.add("cc-bar");
    card.appendChild(barWrap);

    const barFill = document.createElement("div");
    barFill.classList.add("cc-bar-fill", "team-" + standing.constructor.constructorId);
    const pct = maxPoints > 0 ? Math.round((standing.points / maxPoints) * 100) : 0;
    barFill.setAttribute("style", "width:" + pct + "%");
    barWrap.appendChild(barFill);

    // Driver pills from cross-reference
    const drivers = driverMap.get(standing.constructor.constructorId);
    if (drivers && drivers.length > 0) {
        const driversRow = document.createElement("div");
        driversRow.classList.add("cc-drivers-row");
        card.appendChild(driversRow);

        for (const ds of drivers) {
            const pill = document.createElement("span");
            pill.classList.add("cc-driver-pill");
            pill.textContent =
                "#" + (ds.driver.num ?? "?") +
                " " + ds.driver.lastName +
                " · " + ds.points;
            driversRow.appendChild(pill);
        }
    }
}

// Full standings table row
//
// <tr>
//   <td class="pos-num [p1 top3]">{pos}</td>
//   <td> constructor-cell: bar + name + id </td>
//   <td class="flag-emoji">{flag}</td>
//   <td class="team-name-small">{lastName} · {lastName}</td>   ← drivers cross-ref
//   <td class="pts-cell">{points}</td>
//   <td class="gap-to-leader">{gap | —}</td>
// </tr>
function buildTableRow(
    standing:  ConstructorStanding,
    driverMap: Map<string, DriverStanding[]>,
    appendElem: Element,
    maxPoints:  number
) {
    const row = document.createElement("tr");
    appendElem.appendChild(row);


    const pos = document.createElement("td");
    pos.classList.add("pos-num");
    if (standing.position <= 3) pos.classList.add("top3", "p" + standing.position);
    pos.textContent = String(standing.position);
    row.appendChild(pos);

    // Constructor name cell
    const nameTd = document.createElement("td");
    row.appendChild(nameTd);

    const cell = document.createElement("div");
    cell.classList.add("constructor-cell");
    nameTd.appendChild(cell);

    const bar = document.createElement("span");
    bar.classList.add("constructor-bar", "team-" + standing.constructor.constructorId);
    cell.appendChild(bar);

    const textBlock = document.createElement("div");
    cell.appendChild(textBlock);

    const nameDiv = document.createElement("div");
    nameDiv.classList.add("constructor-name");
    nameDiv.textContent = standing.constructor.name;
    textBlock.appendChild(nameDiv);

    const chassisDiv = document.createElement("div");
    chassisDiv.classList.add("constructor-chassis");
    chassisDiv.textContent = standing.constructor.name;
    textBlock.appendChild(chassisDiv);

    // Flag
    const flagTd = document.createElement("td");
    flagTd.classList.add("flag-emoji");
    flagTd.textContent = standing.constructor.nationality
        ? nationalityToFlag(standing.constructor.nationality)
        : "🏁";
    row.appendChild(flagTd);

    // Drivers cell last names from cross-reference
    const driversTd = document.createElement("td");
    driversTd.classList.add("team-name-small");
    const drivers = driverMap.get(standing.constructor.constructorId);
    if (drivers && drivers.length > 0) {
        driversTd.textContent = drivers
            .map(ds => ds.driver.lastName)
            .join(" · ");
    } else {
        driversTd.textContent = "—";
    }
    row.appendChild(driversTd);


    const ptsTd = document.createElement("td");
    ptsTd.classList.add("pts-cell");
    ptsTd.textContent = String(standing.points);
    row.appendChild(ptsTd);


    const gapTd = document.createElement("td");
    gapTd.classList.add("gap-to-leader");
    gapTd.textContent = standing.points === maxPoints ? "—" : String(standing.points - maxPoints);
    row.appendChild(gapTd);
}