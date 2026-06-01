import {setupIndex} from "./ts/api/UI-Control";
import {F1DataSource} from "./ts/api/generic/DataSource";
import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";

const dataSource : F1DataSource = new JolpicaF1DataSource(2, 200);

window.onload = () => {
    setupIndex(dataSource).then(_ => {});
}
