// core API Logic
// call jolpica to function as F1DataSource

import {ConstructorStanding, Driver, DriverStanding, F1DataSource, Race, RaceResults} from "../generic/DataSource";
import {concatPaths} from "../../util/pathBuild";
import {
    JolpicaConstructorStandingResponse,
    JolpicaDriverResponse,
    JolpicaDriverStandingResponse, JolpicaRaceResponse, JolpicaRaceResultResponse, mapJolpicaConstructorStanding,
    mapJolpicaDriver,
    mapJolpicaDriverStanding,
    mapJolpicaRace, mapJolpicaRaceResults
} from "./jolpicaMapper";

const JolpicaBase = "https://api.jolpi.ca/ergast/f1/"


export class JolpicaF1DataSource implements  F1DataSource {
    static driverMod    = "drivers"
    static resultMod    = "results"
    static dStandingsMod= "driverstandings"
    static cStandingsMod= "constructorstandings"
    static raceMod= "races"
    retries: number
    delay: number

    /**
     *
     * @param retries how often an API failure should be retry
     * @param delay how much time should be between calls in ms
     */
    constructor(retries: number, delay: number) {
        if(retries < 0){
            throw new Error("Retries can't be less than 0.");
        }
        this.retries = retries
        if(delay < 0){
            throw new Error("Delay can't be less than 0.");
        }
        this.delay = delay
    }

    async retryLoop(path: string): Promise<Response>{
        let res : Response | undefined = undefined;
        console.log(path)
        for (let i = 0; i < this.retries + 1; i++) {

            try {
                res = await fetch(path)
            }catch(err){
                if(i === this.retries)        // final retry (error out)
                    throw new Error("Jolpica failed on fetch call. Check Internet connection: " + err);

                console.error("API call failed on fetch call: " + err);
                await new Promise(r => setTimeout(r, this.delay));
                continue;
            }

            if (res.status >= 500 || res.status === 429) {
                console.error("API call failed: ", res.statusText);

                // Source - https://stackoverflow.com/a/39914235
                // Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
                // Retrieved 2026-05-27, License - CC BY-SA 4.0
                await new Promise(r => setTimeout(r, this.delay));

                if(i === this.retries) {        // final retry (error out)
                    throw new Error("Jolpica didn't deliver a response. Check status")
                }
                continue
            }
            break

        }

        if(!res){
            throw new Error("Response shouldn't be undefined. Illegal State Check getDriverById logic")
        }
        return res;
    }


    async getDriverById(id: string): Promise<Driver> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, JolpicaF1DataSource.driverMod, id));
        let driverRes : JolpicaDriverResponse = await res.json()

        // only one driver should exist if one id is queried
        if(driverRes.MRData.DriverTable.Drivers.length != 1){
            throw new Error("Not only one driver returned on ID query.")
        }

        return (mapJolpicaDriver(driverRes.MRData.DriverTable.Drivers[0]))
    }

    async getDriverStandings(season: number | string): Promise<DriverStanding[]> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), JolpicaF1DataSource.dStandingsMod))
        let standingRes : JolpicaDriverStandingResponse = await res.json();

        let list = standingRes.MRData.StandingsTable.StandingsLists[0]
        if(!list){
            throw new Error("No standings found: Illegal query?\n season: " + season)
        }

        let len = list.DriverStandings.length;
        let standings : DriverStanding[] = new Array<DriverStanding>(len);

        for (let i = 0; i < len; i++) {
            standings[i] = mapJolpicaDriverStanding(list.DriverStandings[i]);
        }

        return (standings);
    }

    async getConstructorStandings(season: number | string): Promise<ConstructorStanding[]> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), JolpicaF1DataSource.cStandingsMod))
        let standingRes : JolpicaConstructorStandingResponse = await res.json();

        let list = standingRes.MRData.StandingsTable.StandingsLists[0]
        if(!list){
            throw new Error("No constructor standings found: Illegal query?\n season: " + season)
        }

        let len = list.ConstructorStandings.length;
        let standings : ConstructorStanding[] = new Array<ConstructorStanding>(len);

        for (let i = 0; i < len; i++) {
            standings[i] = mapJolpicaConstructorStanding(list.ConstructorStandings[i]);
        }

        return (standings);
    }


    async getDrivers(): Promise<Driver[]> {
        return this.getDriversInSeason("current")
    }

    async getDriversInSeason(season: number | string): Promise<Driver[]> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), JolpicaF1DataSource.driverMod))
        let driverRes : JolpicaDriverResponse = await res.json();

        let len = driverRes.MRData.DriverTable.Drivers.length;
        let drivers : Driver[] = new Array<Driver>(len);

        for (let i = 0; i < len; i++) {
            drivers[i] = mapJolpicaDriver(driverRes.MRData.DriverTable.Drivers[i]);
        }
        return (drivers);
    }

    async getRaceByRound(season: number | string, round: number | string): Promise<Race> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), String(round), JolpicaF1DataSource.raceMod))
        let raceRes : JolpicaRaceResponse = await res.json();

        let len = raceRes.MRData.RaceTable.Races.length;
        if(len > 1){
            throw new Error("More than one race returned on season + round query.")
        }else if (len < 1){
            throw new Error("No Race returned on season + round query. API down? internet connection? invalid params?")
        }

        return (
            mapJolpicaRace(
                raceRes.MRData.RaceTable.Races[0]
            ));
    }

    getRaceResults(season: number | string): Promise<RaceResults[]> {
        return Promise.resolve([]);
    }

    async getRaceResult(season: number | string, round : number | string): Promise<RaceResults> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), String(round), JolpicaF1DataSource.resultMod))
        let rResult : JolpicaRaceResultResponse = await res.json();

        let len = rResult.MRData.RaceTable.Races.length;
        if(len != 1){
            throw new Error("Not exactly one race-result returned on season + round query. " + len)
        }

        return mapJolpicaRaceResults(rResult.MRData.RaceTable.Races[0])
    }

    async getCalender(season: number): Promise<Race[]> {
        let res = await this.retryLoop(concatPaths(JolpicaBase, String(season), JolpicaF1DataSource.raceMod))
        let raceRes : JolpicaRaceResponse = await res.json();

        let len = raceRes.MRData.RaceTable.Races.length;
        let calenderRaces : Race[] = new Array<Race>(len);
        for (let i = 0; i < len; i++) {
            calenderRaces[i] = mapJolpicaRace(raceRes.MRData.RaceTable.Races[i]);
        }
        return (calenderRaces);
    }
}

async function main() {
    let f = new JolpicaF1DataSource(0, 200);
    console.log(await f.getDriverById("max_verstappen"));
    console.log(await f.getDrivers());
    console.log(await f.getDriverStandings(2024))
}