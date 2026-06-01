export interface F1DataSource {
    getDrivers(): Promise<Driver[]>;                                         // gets all current drivers
    getDriversInSeason(season: number | string): Promise<Driver[]>;          // gets all drivers in a season
    getRaceResults(season: number | string): Promise<RaceResult[]>;          // gets the results in a given season
    getDriverById(id: string): Promise<Driver>;                              // get an entire driver via ID
    getDriverStandings(season: number | string): Promise<DriverStanding[]>;  // get the drivers ranked with points
    getCalender(season: number): Promise<Race[]>;                            // get all races(future) in a season
    getRaceByRound(season: number | string, round: number | string): Promise<Race>;
}


export type DriverStanding = {
    position: number
    points:   number
    wins:     number
    driver:   Driver
}

export type Driver = {
    driverId: string;
    firstName: string;
    lastName: string;
    num?: number;
    birthDate?: string;
    nationality?: string;
}

export type Constructor = {
    // TODO: implement Constructor
}

export type RaceResult = {
    race: Race;
    results: Result[]
}

export type Result = {
    driver: Driver;
    teamP1?: Constructor;       // not enforced
    pos:    number;
    points: number;
    grid:   number;
    laps:   number;
    status: "dns" | "dnf" | "finished" | "dnq";
    milliTime: number;
}

export type Circuit = {
    id:       string;
    name:     string;
    location: string;       // location format (Locality Country) ex. Melbourne Australia
}



export type Race = {
    season: number;
    round: number;
    name: string;
    circuit: Circuit;
    date: string;
    time: string;
}