

// DataTypes to match the Jolpica responses
import {Driver, DriverStanding} from "../generic/DataSource";
import {checkObjectsForUndefined} from "../../util/Object-Checker";

type JolpicaDriver = {
    driverId: string
    permanentNumber?: number
    code?: string
    url?: string
    givenName: string
    familyName: string
    dateOfBirth?: string
    nationality?: string
}

type JolpicaConstrucor = {
    constructorId:  string,
    url:            string,
    name:           string,
    nationality:    string
}

// Generic Response
type JolpicaResponseHeader<T> = {
    MRData: {
        xmlns:  string,
        series: string,
        url:    string,
        limit:  number,
        offset: number,
        total:  number,
    } & T
}

// specific response header helpers
type JolpicaDriverTable = {
    DriverTable: {
        Drivers: JolpicaDriver[]
    }
}

type JolpicaStandingsTable = {
    StandingsTable: {
        season:         number,
        round:          number,
        StandingsLists:  StandingsEntry[]
    }
}

type StandingsEntry = {
    season:             number,
    round:              number,
    DriverStandings:    JolpicaDriverStanding[],
}

type JolpicaDriverStanding = {
    position: number,
    positionText: string,
    points: number,
    wins: number,
    Driver: JolpicaDriver,
    Constructors: JolpicaConstrucor[]
}



// combinations
export type JolpicaDriverResponse = JolpicaResponseHeader<JolpicaDriverTable>;
export type JolpicaDriverStandingResponse = JolpicaResponseHeader<JolpicaStandingsTable>


// Mappers - Jolpica Objects to normal
export function mapJolpicaDriver(driver: JolpicaDriver): Driver {

    return {
        driverId:       driver.driverId,
        firstName:      driver.givenName,
        lastName:       driver.familyName,
        num:            driver.permanentNumber,
        birthDate:      driver.dateOfBirth,
        nationality:    driver.nationality,
    };
}

export function mapJolpicaDriverStanding(standing: JolpicaDriverStanding): DriverStanding{
    return {
        driver: mapJolpicaDriver(standing.Driver),
        points: standing.points,
        position: standing.position,
        wins: standing.wins,
    }
}