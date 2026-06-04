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
    card.classList.add("podium-card");
    card.classList.add("p" + res.position);
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
    team.classList.add("podium-team");
    team_color.classList.add("podium-team-dot");
    team_color.classList.add("team-"+res.driver.teamId!);
    team.append(
        team_color,
        res.driver.teamId!
    );
    card.appendChild(team);


}