export interface F1DataSource {
    getDrivers(): Promise<Driver[]>;                        // gets all current drivers
    getDrivers(season: number): Promise<Driver[]>;          // gets all drivers in a season
    getRaceResults(season: number): Promise<RaceResult[]>;
    getDriverById(id: string): Promise<Driver>;
    getDriverStandings(season: number): Promise<DriverStanding[]>;
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
    num: number;
    birthDate: string;
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