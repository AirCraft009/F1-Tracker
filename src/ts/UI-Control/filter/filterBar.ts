import { ConstructorStanding, Driver, DriverStanding, F1DataSource } from "../../api/generic/DataSource";


export type FilterState = {
    season:        string;          // e.g. "2026" | "current"
    constructorId: string | null;   // null = all
    driverId:      string | null;   // null = all
}

export type FilterChangeCallback = (state: FilterState) => void;

type FilterBarOptions = {
    dSource:   F1DataSource;
    mountId:   string;              // id of the <div> to render into, e.g. "filter-bar"
    onChange:  FilterChangeCallback;
    features?: {
        season?:      boolean;      // default true
        constructor?: boolean;      // default true
        driver?:      boolean;      // default true
    }
}


// Internal state


const CURRENT_YEAR  = new Date().getFullYear();
const EARLIEST_YEAR = 1950;

let state: FilterState = {
    season:        "current",
    constructorId: null,
    driverId:      null,
};


// Entry point
// Call once per page in your main.ts, e.g.:
//
//   setupFilterBar({
//       dSource,
//       mountId: "filter-bar",
//       onChange: (state) => {
//           clearPage();
//           setupDriver(dSource, state.season);
//       },
//       features: { driver: false }   // hide driver select on constructor page
//   });

export async function setupFilterBar(opts: FilterBarOptions): Promise<FilterState> {
    const mount = document.getElementById(opts.mountId);
    if (!mount) throw new Error("filterBar: mount point #" + opts.mountId + " not found");

    const features = {
        season:      opts.features?.season      ?? true,
        constructor: opts.features?.constructor ?? true,
        driver:      opts.features?.driver      ?? true,
    };

    const bar = document.createElement("div");
    bar.classList.add("filter-bar");
    mount.appendChild(bar);


    const label = document.createElement("span");
    label.classList.add("filter-label");
    label.textContent = "Filter";
    bar.appendChild(label);


    let seasonSelect: HTMLSelectElement | null = null;
    if (features.season) {
        seasonSelect = buildSelect("filter-season", "Season");
        populateSeasonSelect(seasonSelect);
        bar.appendChild(wrapSelect("Season", seasonSelect));
    }


    let constructorSelect: HTMLSelectElement | null = null;
    if (features.constructor) {
        constructorSelect = buildSelect("filter-constructor", "All Teams");
        bar.appendChild(wrapSelect("Team", constructorSelect));
    }

    let driverSelect: HTMLSelectElement | null = null;
    if (features.driver) {
        driverSelect = buildSelect("filter-driver", "All Drivers");
        bar.appendChild(wrapSelect("Driver", driverSelect));
    }

    // Populate team + driver selects from initial data fetch
    await populateDynamicSelects(opts.dSource, state.season, constructorSelect, driverSelect);



    if (seasonSelect) {
        seasonSelect.addEventListener("change", async () => {
            state.season        = seasonSelect!.value;
            state.constructorId = null;
            state.driverId      = null;

            // Reset + repopulate dependent selects
            if (constructorSelect) resetSelect(constructorSelect, "All Teams");
            if (driverSelect)      resetSelect(driverSelect,      "All Drivers");

            await populateDynamicSelects(opts.dSource, state.season, constructorSelect, driverSelect);
            opts.onChange({ ...state });
        });
    }

    if (constructorSelect) {
        constructorSelect.addEventListener("change", () => {
            state.constructorId = constructorSelect!.value || null;
            opts.onChange({ ...state });
        });
    }

    if (driverSelect) {
        driverSelect.addEventListener("change", () => {
            state.driverId = driverSelect!.value || null;
            opts.onChange({ ...state });
        });
    }

    return { ...state };
}





function buildSelect(id: string, placeholder: string): HTMLSelectElement {
    const sel = document.createElement("select");
    sel.id = id;
    sel.classList.add("filter-select");

    const defaultOpt = document.createElement("option");
    defaultOpt.value       = "";
    defaultOpt.textContent = placeholder;
    sel.appendChild(defaultOpt);

    return sel;
}

function wrapSelect(labelText: string, sel: HTMLSelectElement): HTMLElement {
    const wrap = document.createElement("div");
    wrap.classList.add("filter-group");

    const lbl = document.createElement("label");
    lbl.classList.add("filter-group-label");
    lbl.setAttribute("for", sel.id);
    lbl.textContent = labelText;

    wrap.appendChild(lbl);
    wrap.appendChild(sel);
    return wrap;
}

function resetSelect(sel: HTMLSelectElement, placeholder: string): void {
    sel.innerHTML = "";
    const opt = document.createElement("option");
    opt.value       = "";
    opt.textContent = placeholder;
    sel.appendChild(opt);
}

function populateSeasonSelect(sel: HTMLSelectElement): void {
    // "Current" option at the top
    const currentOpt = document.createElement("option");
    currentOpt.value       = "current";
    currentOpt.textContent = "Current";
    currentOpt.selected    = true;
    sel.appendChild(currentOpt);

    // Years descending: current year down to 1950
    for (let y = CURRENT_YEAR; y >= EARLIEST_YEAR; y--) {
        const opt = document.createElement("option");
        opt.value       = String(y);
        opt.textContent = String(y);
        sel.appendChild(opt);
    }
}


// Fetch constructors + drivers for the given season and populate selects.
// Both requests run in parallel; each select is populated independently so
// a failure in one doesn't block the other.

async function populateDynamicSelects(
    dSource:           F1DataSource,
    season:            string,
    constructorSelect: HTMLSelectElement | null,
    driverSelect:      HTMLSelectElement | null,
): Promise<void> {

    const tasks: Promise<void>[] = [];

    if (constructorSelect) {
        tasks.push(
            dSource.getConstructorStandings(season)
                .then((standings) => {
                    for (const s of standings) {
                        const opt = document.createElement("option");
                        opt.value       = s.constructor.constructorId;
                        opt.textContent = s.constructor.name;
                        constructorSelect.appendChild(opt);
                    }
                })
                .catch((e) => {
                    console.error("filterBar: failed to load constructors", e);
                })
        );
    }

    if (driverSelect) {
        tasks.push(
            dSource.getDriverStandings(season)
                .then((standings) => {
                    for (const s of standings) {
                        const opt = document.createElement("option");
                        opt.value       = s.driver.driverId;
                        opt.textContent = s.driver.firstName + " " + s.driver.lastName;
                        driverSelect.appendChild(opt);
                    }
                })
                .catch((e) => {
                    console.error("filterBar: failed to load drivers", e);
                })
        );
    }

    await Promise.all(tasks);
}
