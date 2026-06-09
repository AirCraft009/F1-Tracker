import {setupIndex} from "./ts/UI-Control";
import {F1DataSource} from "./ts/api/generic/DataSource";
import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";
import {setupFilterBar} from "./ts/UI-Control/filter/filterBar";
import {setupDriver} from "./ts/UI-Control/drivers";

export const dataSource : F1DataSource = new JolpicaF1DataSource(3, 200);

window.onload = () => {
    setupIndex(dataSource, "current", "next", 5).then(_ => {});
}

function clearPage() {
    document.getElementById("calender-top")!.innerHTML       = "";
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
        setupIndex(dataSource, state.season, 1, 5);
    }
});