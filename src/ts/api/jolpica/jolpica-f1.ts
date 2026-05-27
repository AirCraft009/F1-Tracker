// core API Logic
// call jolpica to function as F1DataSource

import {Driver, DriverStanding, F1DataSource, RaceResult} from "../generic/DataSource";
import {concatPaths} from "../../util/pathBuild";
import {JolpicaDriver, JolpicaDriverResponse} from "./jolpicaMapper";
const JolpicaBase = "https://api.jolpi.ca/ergast/f1/"


class JolpicaF1DataSource implements  F1DataSource {
    static driverMod = "drivers"
    static resultMod = "results"
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


    async getDriverById(id: string): Promise<void> {
        let res : Response | undefined = undefined;
        for (let i = 0; i < this.retries + 1; i++) {
            res = await fetch(concatPaths(JolpicaBase, JolpicaF1DataSource.driverMod, id))
            if (!res.ok) {
                console.error("API call failed: ", res.statusText);


                // Source - https://stackoverflow.com/a/39914235
                // Posted by Dan Dascalescu, modified by community. See post 'Timeline' for change history
                // Retrieved 2026-05-27, License - CC BY-SA 4.0
                await new Promise(r => setTimeout(r, this.delay));

                if(i === this.retries) {        // final retry (error out)
                    throw new Error("Jolpica didn't deliver a response. Check status")
                }
                continue;
            }
            break
        }

        if(!res){
            throw new Error("Response shouldn't be undefined. Illegal State Check getDriverById logic")
        }

        let driverRes : JolpicaDriverResponse = await res.json()
        // only one driver should exist if one id is queried
        if(driverRes.MRData.DriverTable.Drivers.length != 1){
            throw new Error("More than one driver returned on ID query.")
        }

        return
    }

    getDriverStandings(season: number): Promise<DriverStanding[]> {
        return Promise.resolve([]);
    }

    getDrivers(): Promise<Driver[]> {
        return Promise.resolve([]);
    }

    getDriversInSeason(season: number): Promise<Driver[]> {
        return Promise.resolve([]);
    }

    getRaceResults(season: number): Promise<RaceResult[]> {
        return Promise.resolve([]);
    }
}

main()

function main() {
    let f = new JolpicaF1DataSource(0, 200);
    f.getDriverById("verstappen");
}