import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";
import {setupConstructors} from "./ts/UI-Control/constructors";
import {dataSource} from "./main";
import {setupFilterBar} from "./ts/UI-Control/filter/filterBar";

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
    features: { driver: false, constructor: false }  // constructor page: season only
});
