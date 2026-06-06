import {dateTime} from "../jolpica/jolpicaMapper";

export interface F1DataSource {
    getDrivers(): Promise<Driver[]>;                                                        // gets all current drivers
    getDriversInSeason(season: number | string): Promise<Driver[]>;                         // gets all drivers in a season
    getRaceResults(season: number | string): Promise<RaceResults[]>;                        // gets the results in a given season
    getRaceResult(season: number | string, round: number | string): Promise<RaceResults>;   // gets the results in a given season
    getDriverById(id: string): Promise<Driver>;                                             // get an entire driver via ID
    getDriverStandings(season: number | string): Promise<DriverStanding[]>;                 // get the drivers ranked with points
    getCalender(season: number | string): Promise<Race[]>;                                           // get all races(future) in a season
    getRaceByRound(season: number | string, round: number | string): Promise<Race>;
    getConstructorStandings(season: number | string): Promise<ConstructorStanding[]>
}

export type DriverStanding = {
    position:       number
    points:         number
    wins:           number
    driver:         Driver
    constructor:    Constructor
}


export type ConstructorStanding = {
    position:       number,
    points:         number,
    wins:           number,
    constructor:    Constructor,
}

export type Driver = {
    driverId:   string;
    firstName:  string;
    lastName:   string;
    teamId?:     string;
    num?:       number;
    birthDate?: string;
    nationality?: string;
}

export type Constructor = {
    constructorId:  string;
    name:           string;
    nationality?:   string;
}

export type RaceResults = {
    race: Race;
    results: Result[]
}

export type Result = {
    driver:     Driver;
    teamP1:    Constructor;
    pos:        number;
    points:     number;
    grid:       number;
    laps:       number;
    status:     string;
    milliTime:  number;
}

export type Circuit = {
    id:       string;
    name:     string;
    location: string;       // location format (Locality Country) ex. Melbourne Australia
}





export type Race = {
    season:     number;
    round:      number;
    name:       string;
    circuit:    Circuit;
    date:       string;
    time:       string;
    pract1:     dateTime,
    pract2:     dateTime,
    pract3:     dateTime,
    qualify:    dateTime
}