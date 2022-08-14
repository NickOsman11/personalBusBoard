const readline = require("readline-sync")
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

function getIntWithPrompt(prompt){

    console.log(prompt)
    var answer = Number(readline.prompt());
    while (!(Number.isInteger(answer))){
        console.log("That was not an integer, please try again")
        answer = Number(readline.prompt())
    }
    return answer
}


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

    let busData = await getBusDataWithStopCode(stopCode);
    let arrivals = await returnArrivalsWithBusData(busData);
    console.log(`${stopName}: `)
    if (arrivals.length === 0){
        console.log("There are no busses due")
    }
    arrivals.forEach(bus => console.log(`${bus.lineName} : ${(Math.floor(bus.timeToStation / 60) > 0 ? String(Math.floor(bus.timeToStation / 60)) + " minutes" : "Due")}`));   
}


async function getStopDataWithPostcode(postcode, radius, numberOfStopsToReturn) {

    let postcodeData = await (fetchDataWithUrl(`https://api.postcodes.io/postcodes/${postcode}`).then(x => x.result))
    let lat = postcodeData.latitude; let long = postcodeData.longitude;
    let closestStopPoints

    while (true){

        let stopPointsData = await fetchDataWithUrl(
            `https://api.tfl.gov.uk/StopPoint/?lat=${lat}&lon=${long}&stopTypes=NaptanPublicBusCoachTram&radius=${radius}`)
                                                .then(x => x.stopPoints)

        closestStopPoints = await stopPointsData.sort((a, b) => a.distance - b.distance)
        
        if (closestStopPoints.length < numberOfStopsToReturn){

            radius = getIntWithPrompt(`There are fewer than ${numberOfStopsToReturn} stop points`
                        + `within the specified radius. Enter a radius greater than `
                        + `${radius}:`)

        }
        break
    }
    return closestStopPoints.slice(0, numberOfStopsToReturn)
}


async function getPostcode(){

    console.log("Enter postcode: ")
    let postcode = readline.prompt()
    let postcodeIsValid;
    while (!postcodeIsValid){
        let url = `https://api.postcodes.io/postcodes/${postcode}/validate`
        postcodeIsValid = await fetchDataWithUrl(url).then(x => x.result)
        if (!postcodeIsValid){
            console.log("Postcode invalid, try again:")
            postcode = readline.prompt()
        }
    }
    return postcode
}


async function showBussesNearMe(){
    
    let postcode = await getPostcode()
    let radius = getIntWithPrompt("Enter a maximum distance to bus stop: ")
    let numberOfStopsToDisplay = getIntWithPrompt("How many stops would you like to display? ")
    let stopsData = await getStopDataWithPostcode(postcode, radius, numberOfStopsToDisplay)
    stopsData.forEach(stop => showBusArrivalsWithStopCode(stop.id, stop.commonName))


    
}

showBussesNearMe()
