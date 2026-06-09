import {dataSource} from "./main";
import {setupDriver} from "./ts/UI-Control/drivers";
import {setupFilterBar} from "./ts/UI-Control/filter/filterBar";

window.onload = () => {
    setupDriver(dataSource, "current")
}


function clearPage() {
    document.getElementById("podium-top")!.innerHTML       = "";
    document.getElementById("full-standing-top")!.innerHTML = "";
}

// Initial render — filter bar awaits first data load before
// populating team/driver selects, then fires onChange once.
await setupFilterBar({
    dSource:  dataSource,
    mountId:  "filter-bar",
    features: {
        driver: false,
        season: true,
        constructor: false,
    },
    onChange: (state) => {
        clearPage();
        // driverSetup ignores constructorId / driverId for now —
        // extend setupDriver to accept FilterState if you want
        // client-side filtering on top of the season re-fetch.
        setupDriver(dataSource, state.season);
    }
});
