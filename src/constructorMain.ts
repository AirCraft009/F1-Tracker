import {JolpicaF1DataSource} from "./ts/api/jolpica/jolpica-f1";
import {setupConstructors} from "./ts/UI-Control/constructors";


const dataSource = new JolpicaF1DataSource(3, 200);
setupConstructors(dataSource, "current");