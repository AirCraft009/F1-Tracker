import {F1DataSource} from "./ts/api/generic/DataSource";
import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";
import {setupIndex} from "./ts/UI-Control";
import {setupFilterBar} from "./ts/util/filterBar";
import {setupResults} from "./ts/UI-Control/results";

const dataSource : F1DataSource = new JolpicaF1DataSource(3, 200);

window.onload = () => {
    setupResults(dataSource, "current").then(_ => {});
}

function clearPage() {
    document.getElementById("calender-top")!.innerHTML       = "";
    document.getElementById("time-top")!.innerHTML          = "";
    document.getElementById("driver-top")!.innerHTML         = "";
    document.getElementById("constructor-top")!.innerHTML         = "";
    document.querySelector(".track-svg-wrap")!.innerHTML         = "";
}

await setupFilterBar({
    dSource:  dataSource,
    mountId:  "filter-bar",
    features: {
        driver: false,
        season: true,
        constructor: false,
        round: false,
    },
    onChange: (state) => {
        clearPage();

        setupResults(dataSource, state.season);
    }
});