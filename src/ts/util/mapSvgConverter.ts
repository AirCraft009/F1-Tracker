import * as d3 from "d3";
import {Circuit} from "../api/generic/DataSource";

const width = 340;
const height = 480;
const trackCount = 40;
const TrackPath = "/TrackData.json"

/**
 * draws the circuit as svg
 * @param circ
 * @param appendElem the element the svg will be appended on (querySelector)
 */
export async function drawCircuit(circ: Circuit, appendElem: string){
    await drawCircuitId(circ.id, appendElem);
}

export async function drawCircuitId(id: string, appendElem: string){
    let trackRes = await fetch(TrackPath);
    let trackJson = await trackRes.json();
    for (let i = 0; i < trackCount; i++) {
        if(trackJson[i].circuitId == id){
            await drawSvgTrack(trackJson[i].geojson, appendElem);
            return;
        }
    }
}


async function drawSvgTrack(geoJsonPath: string, appendElem: string): Promise<void> {
    const svg_D3 = d3.select(appendElem)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // load the GeoJSON data
    const geoRes = await fetch(geoJsonPath)
    const geo = await geoRes.json();

    // projection (maps lat/lon → screen)
    const projection = d3.geoMercator()
        .fitSize([width, height], geo);

    const path = d3.geoPath().projection(projection);

    // draw track
    svg_D3.append("path")
        .datum(geo)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);
}

function addFiltersToSvg(): void {
    document.querySelectorAll("svg").forEach(el => {
        el.appendChild(document.createElement("defs"))
    })

    document.querySelectorAll("defs").forEach(el => {
        el.appendChild(
            document.createElement("filter")

        )
    })
}