

// DataTypes to match the Jolpica responses
import {Circuit, Constructor, ConstructorStanding, Driver, DriverStanding, Race} from "../generic/DataSource";
import {checkObjectsForUndefined} from "../../util/Object-Checker";

// base Types
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

type JolpicaConstructor = {
    constructorId:  string,
    url:            string,
    name:           string,
    nationality:    string
}

type JolpicaCircuit = {
    circuitId:      string
    url:            string
    circuitName:    string
    Location:   {
        lat:          number,
        long:         number,
        locality:     string,
        country:      string
    }
}

export type dateTime = {
    date: string
    time: string
}

type JolpicaRace = {
    season:         number
    round:          number
    url?:           string
    raceName:       string
    Circuit:        JolpicaCircuit
    date:           string,
    time:           string,
    FirstPractice:  dateTime,
    SecondPractice: dateTime,
    ThirdPractice:  dateTime,
    Qualifying:     dateTime,
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

// helper types
type StandingsEntry<T> = {
    season:             number,
    round:              number
    &T
}

type JolpicaDriverStanding = {
    position: number,
    positionText: string,
    points: number,
    wins: number,
    Driver: JolpicaDriver,
    Constructors: JolpicaConstructor[]
}

type JolpicaConstructorStanding = {
    position:       number,
    points:         number,
    positionText:   string,
    wins:           number,
    Constructor:    JolpicaConstructor
}


// specific response header tables
type JolpicaDriverTable = {
    DriverTable: {
        Drivers: JolpicaDriver[]
    }
}

type JolpicaStandingsTable<T> = {
    StandingsTable: {
        season:         number,
        round:          number,
        StandingsLists:  T[]
    }
}

type JolpicaRaceTable = {
    RaceTable: {
        season?:         number,
        round?:          number,
        Races:          JolpicaRace[],
    }
}



// combinations
export type JolpicaDriverResponse = JolpicaResponseHeader<JolpicaDriverTable>;
export type JolpicaDriverStandingResponse = JolpicaResponseHeader<JolpicaStandingsTable<{DriverStandings: JolpicaDriverStanding[]}>>
export type JolpicaConstructorStandingResponse = JolpicaResponseHeader<JolpicaStandingsTable<{ConstructorStandings: JolpicaConstructorStanding[]}>>
export type JolpicaRaceResponse =           JolpicaResponseHeader<JolpicaRaceTable>


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
    let driver = mapJolpicaDriver(standing.Driver);
    driver.teamId = standing.Constructors[0].constructorId;
    return {
        driver: driver,
        points: standing.points,
        position: standing.position,
        wins: standing.wins,
    }
}

export function mapJolpicaCircuit(circuit: JolpicaCircuit): Circuit{
    return {
        id: circuit.circuitId,
        name: circuit.circuitName,
        location:   circuit.Location.locality
                    + " " +
                    circuit.Location.country,
    }
}

export function mapJolpicaRace(race: JolpicaRace): Race{
    return {
        season:     race.season,
        round:      race.round,
        name:       race.raceName,
        circuit:    mapJolpicaCircuit(race.Circuit),
        date:       race.date,
        time:       race.time,
        pract1:     race.FirstPractice,
        pract2:     race.SecondPractice,
        pract3:     race.ThirdPractice,
        qualify:    race.Qualifying,
    }
}

export function mapJolpicaConstructor(constructor: JolpicaConstructor): Constructor {
    return {
        constructorId: constructor.constructorId,
        name: constructor.name,
        nationality: constructor.nationality,
    };
}

export function mapJolpicaConstructorStanding(standing: JolpicaConstructorStanding): ConstructorStanding{
    return {
        position:       standing.position,
        points:         standing.points,
        wins:           standing.wins,
        constructor:    mapJolpicaConstructor(standing.Constructor)
    }
}