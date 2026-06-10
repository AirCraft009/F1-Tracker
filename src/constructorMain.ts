import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";
import {setupConstructors} from "./ts/UI-Control/constructors";
import {setupFilterBar} from "./ts/util/filterBar";
import {setupDriver} from "./ts/UI-Control/drivers";

const dataSource = new JolpicaF1DataSource(3, 200);

window.onload = () => {
    setupConstructors(dataSource, "current")
}

function clearPage() {
    document.getElementById("leader-banner")!.innerHTML     = "";
    document.getElementById("constructors-grid")!.innerHTML  = "";
    document.getElementById("full-standing-top")!.innerHTML  = "";
}

await setupFilterBar({
    dSource:  dataSource,
    mountId:  "filter-bar",
    onChange: (state) => {
        clearPage();
        setupConstructors(dataSource, state.season);
    },
    features: { driver: false, constructor: false, round: false}  // constructor page: season only
});
