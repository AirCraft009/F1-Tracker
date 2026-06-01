import * as d3 from "d3";
import {Circuit} from "../api/generic/DataSource";
import {createFilter} from "vite";

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
        .attr("stroke", "url(#trackGrad)")
        .attr("filter", "url(#glow)")
        .attr("stroke-width", 10)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin","round");

    svg_D3.append("path")
        .datum(geo)
        .attr("d", path)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke", "rgba(232,0,45,0.15)")
        .attr("stroke-width", 26)
        .attr("stroke-linecap", "round")
        .attr("stroke-linejoin","round")



    addFiltersToSvg()
}

function addFiltersToSvg(): void {
    document.querySelectorAll("svg").forEach(svg => {
        // Create defs if it doesn't exist
        let defs = svg.querySelector("defs");
        if (defs) {
            return      // don't modify if there's a def
        }
        defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
        svg.appendChild(defs);


        // create the filter object
        const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
        filter.setAttribute("id", "glow");

        const blur = document.createElementNS("http://www.w3.org/2000/svg", "feGaussianBlur");
        blur.setAttribute("stdDeviation", "3");
        blur.setAttribute("result", "coloredBlur");

        const merge = document.createElementNS("http://www.w3.org/2000/svg", "feMerge");

        const node1 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
        node1.setAttribute("in", "coloredBlur");

        const node2 = document.createElementNS("http://www.w3.org/2000/svg", "feMergeNode");
        node2.setAttribute("in", "SourceGraphic");

        merge.appendChild(node1);
        merge.appendChild(node2);

        filter.appendChild(blur);
        filter.appendChild(merge);

        defs.appendChild(filter);

        const grad = document.createElementNS("http://www.w3.org/2000/svg", "linearGradient");
        grad.setAttribute("id", "trackGrad");
        grad.setAttribute("x1", "0%");
        grad.setAttribute("y1", "0%");
        grad.setAttribute("x2", "100%");
        grad.setAttribute("y2", "100%");

        const s1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s1.setAttribute("offset", "0%");
        s1.setAttribute("stop-color", "#E8002D");

        const s2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        s2.setAttribute("offset", "100%");
        s2.setAttribute("stop-color", "#ff4466");

        grad.appendChild(s1);
        grad.appendChild(s2);

        defs.appendChild(grad);
    });
}