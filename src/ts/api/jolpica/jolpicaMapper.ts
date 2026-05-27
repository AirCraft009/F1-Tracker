

// DataTypes to match the Jolpica responses
export type JolpicaDriver = {
    driverId: string
    permanentNumber: number
    code: string
    url: string
    givenName: string
    familyName: string
    dateOfBirth: string
    nationality: string
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



// combinations
export type JolpicaDriverResponse = JolpicaResponseHeader<JolpicaDriverTable>;


// Mappers - Jolpica Objects to normal