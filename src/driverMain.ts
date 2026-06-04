import {setupDriver} from "./ts/UI-Control/drivers";
import {dataSource} from "./main";

window.onload = () => {
    setupDriver(dataSource, "current")
}