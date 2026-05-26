import * as d3 from "d3";
import {Circuit} from "../api/generic/DataSource";

const width = 340;
const height = 480;
const trackCount = 40;

export async function drawCircuit(circ: Circuit, appendElem: string){
    let trackJson = await fetch("/resources/TrackData.json").then((res) => res.json());
    for (let i = 0; i < trackCount; i++) {
        if(trackJson[i].circuitId == circ.id){
            await drawSvgTrack(trackJson.geojson, appendElem);
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
    const geo = await fetch(geoJsonPath).then(r => r.json());

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