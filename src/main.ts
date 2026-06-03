import {setupIndex} from "./ts/UI-Control";
import {F1DataSource} from "./ts/api/generic/DataSource";
import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";

let dataSource : F1DataSource = new JolpicaF1DataSource(2, 200);

window.onload = () => {
    setupIndex(dataSource, 2020, "next", 5).then(_ => {});
}