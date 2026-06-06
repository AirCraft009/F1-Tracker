import {DriverStanding, F1DataSource} from "../api/generic/DataSource";

const podium_select = "#podium-top"

export async function setupDriver(dSource: F1DataSource, season: number | string) {
    let standings: DriverStanding[];

    try {
        standings = await dSource.getDriverStandings(season);
    }catch (e){
        alert("Failed to load Driver Standings: " + e);
        throw new Error("Failed to get driver standings: " + e);
    }


    let podium = document.querySelector("#podium-top");



    if(!podium) {
        throw new Error("couldn't find podium top");
    }


    for (let i = 0; i < 3; i++) {
        buildPodium(standings[i], podium);
    }

    let standings_top = document.querySelector("#full-standing-top");
    if(!standings_top) {
        throw new Error("couldn't find the full standings");
    }
    for(let i = 0; i < standings.length; i++) {
        if(!standings[i])
            continue

        buildFullStandingsEntry(standings[i], standings_top, standings[0].points)
    }

}

/*
<tr>
                    <td class="pos-num p1 top3">1</td>
                    <td>
                        <div class="driver-cell">
                            <span class="team-dot team-mercedes"></span>
                            <div>
                                <div class="driver-name">Kimi Antonelli</div>
                                <div class="driver-number">#12 · Mercedes AMG</div>
                            </div>
                        </div>
                    </td>
                    <td class="flag-emoji">🇮🇹</td>
                    <td class="pts-cell">106</td>
                    <td>
                        <div class="pts-bar-wrap">
                            <div class="pts-bar-bg"><div class="pts-bar-fill team-mercedes" style="width:100%"></div></div>
                        </div>
                    </td>
                </tr>
 */
function buildFullStandingsEntry(standing: DriverStanding, appendElement: Element, maxPoints: number) {
    let row = document.createElement("tr");
    appendElement.appendChild(row);

    let pos = document.createElement("td");
    pos.classList.add("pos-num");
    if(standing.position <= 3)
        pos.classList.add("top3", "p"+standing.position);
    pos.textContent = String(standing.position);
    row.appendChild(pos);

    let driverTd = document.createElement("td");
    row.appendChild(driverTd);

    let driverContainer = document.createElement("div")
    driverContainer.classList.add("driver-cell")
    driverTd.appendChild(driverContainer);

    let teamColor = document.createElement("span")
    teamColor.classList.add("team-dot", "team-"+standing.driver.teamId);
    driverContainer.appendChild(teamColor);

    let container = document.createElement("div");
    driverContainer.appendChild(container);

    let name = document.createElement("div")
    name.classList.add("driver-name");
    name.textContent = standing.driver.firstName + " " + standing.driver.lastName;
    container.appendChild(name);

    let team_number = document.createElement("div")
    name.classList.add("driver-number");
    name.textContent = "#" + standing.driver.num + " · " + standing.driver.teamId;
    container.appendChild(team_number);

    let flag = document.createElement("td")
    flag.classList.add("flag-emoji");
    flag.textContent = "🇬🇧"
    row.appendChild(flag);

    let pts = document.createElement("td");
    pts.classList.add("pts-cell");
    pts.textContent = String(standing.points);

    let barContainer = document.createElement("td")
    row.appendChild(barContainer);

    let ptsBar = document.createElement("div")
    ptsBar.classList.add("pts-bar-wrap");
    barContainer.appendChild(ptsBar);

    let barBg = document.createElement("div")
    let barFill = document.createElement("div")
    barBg.classList.add("pts-bar-bg");
    console.log(standing.driver.teamId);
    barFill.classList.add("pts-bar-fill", "team-"+standing.driver.teamId);
    barFill.setAttribute("style", "width:"+Math.round((standing.points/maxPoints)*100)+"%");
    ptsBar.appendChild(barBg);
    ptsBar.appendChild(barFill);

    let gap = document.createElement("span")
    gap.classList.add("gap-badge");
    gap.textContent = String(standing.points - maxPoints);
    ptsBar.appendChild(gap);

}


/*
        <div class="podium-card p1">
            <span class="podium-pos">1</span>
            <div class="podium-num">#12 · ITA 🇮🇹</div>
            <div class="podium-driver-name">Andrea Kimi<br>Antonelli</div>
            <div class="podium-team">
                <span class="podium-team-dot team-mercedes"></span> Mercedes AMG
            </div>
            <div class="podium-pts">106</div>
            <div class="podium-pts-label">Points</div>
        </div>
 */
function buildPodium(res: DriverStanding, appendElem: Element) {
    let card = document.createElement("div");
    card.classList.add("podium-card", "p" + res.position);
    appendElem.appendChild(card);

    let pos = document.createElement("span");
    pos.classList.add("podium-pos");
    pos.textContent = String(res.position)
    card.appendChild(pos);

    let num = document.createElement("div");
    num.classList.add("podium-num");
    num.textContent = "#" + res.driver.num;
    card.appendChild(num);

    let name = document.createElement("div");
    let nBreak = document.createElement("br")
    name.classList.add("podium-driver-name");
    name.append(
        res.driver.firstName,
        nBreak,
        res.driver.lastName,
    )
    card.appendChild(name);

    //TODO: add null checks
    let team = document.createElement("div");
    let team_color = document.createElement("span");
    team.classList.add("podium-team", "podium-team-dot", "team-"+res.driver.teamId!);
    team.append(
        team_color,
        res.constructor.name
    );
    card.appendChild(team);


    let points = document.createElement("div");
    points.classList.add("podium-pts");
    points.textContent = String(res.points);
    card.appendChild(points);

    let point_label = document.createElement("div");
    point_label.classList.add("podium-pts-label");
    point_label.textContent = "Points"
    card.appendChild(point_label);
}
