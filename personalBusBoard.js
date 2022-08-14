const readline = require("readline-sync")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function fetchDataWithUrl(url){

    let data = await fetch(url).then(response => response.json());
    return data;
}


async function getBusDataWithStopCode(stopCode){

    let url = `https://api.tfl.gov.uk/StopPoint/${stopCode}/Arrivals`;
    let busData = await fetchDataWithUrl(url);


    return busData;
}


async function returnArrivalsWithBusData(busData){

    busData.sort((a, b) => a.timeToStation - b.timeToStation);
    let arrivals = busData.map(x => ({["lineName"] : x.lineName, ["timeToStation"] : x.timeToStation}));
    return arrivals
}


async function showBusArrivalsWithStopCode(stopCode, stopName){

    let busData = await getBusDataWithStopCode("490008660N");
    let arrivals = await returnArrivalsWithBusData(busData);
    console.log(`${stopName}: `)
    arrivals.forEach(bus => console.log(`${bus.lineName} : ${(Math.floor(bus.timeToStation / 60) > 0 ? String(Math.floor(bus.timeToStation / 60)) + " minutes" : "Due")}`));
    
}

// async function getStopCodesWithPostcode(postcode) {

//     let poscodeValidity = await fetchDataWithUrl(`api.postcodes.io/postcodes/${postcode}/validate`)
//     console.log(poscodeValidity)

    // while (!)
    // let url = `api.postcodes.io/postcodes/${postcode}`
    // let postcodeData = await fetchDataWithUrl(url)
    // let lat = postcodeData.latitude; long = postcodeData.longitude


}


showBusArrivalsWithStopCode("490008660N", "Stop Name");
// getStopCodesWithPostcode('EN1%202LW')

