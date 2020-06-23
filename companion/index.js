import { outbox } from "file-transfer"
import { settingsStorage } from "settings";
import { degrees2meters, decodePolyline, getStats, convertToScreenCoords } from "../common/lib";
import { encode } from 'cbor';
import * as env from '../env.js'
import simplify from 'simplify-js'

settingsStorage.setItem("message", "No message");

settingsStorage.onchange = async function (evt) {

  let strava = JSON.parse(settingsStorage.getItem("strava"))

  if (strava && strava.expires_at < new Date().getTime() / 1000) {
    let data = await getRefreshedToken();
    strava.expires_at = data.expires_at;
    strava.access_token = data.access_token;
    strava.refresh_token = data.refresh_token;
    settingsStorage.setItem("strava", JSON.stringify(strava))
  }

  let route = JSON.parse(settingsStorage.getItem("route"))

  if (strava && route && route.value && evt.key === 'refresh') {
    transferFile(route.value);
  }
}

async function transferFile(id_str) {

    
  //Use id_str instead of id : https://groups.google.com/forum/#!topic/strava-api/4HkuGf0-_ss
  let route = await getRoute(id_str);

  if(!route.message){

    //Decodepolyline, convert lat,long to mercator coords then to screen coords
    let MercatorCoords = decodePolyline(route.map.polyline).map(elt => degrees2meters(elt[1], elt[0]))
    let stats = getStats(MercatorCoords);
    let screenCoords = convertToScreenCoords(MercatorCoords, stats).map(elt => { return { x: elt[0], y: elt[1] } });
    
    //Simplify linestring until number of points < 100
    //Limit to 100 points otherwise Error:Jerryscript out of memory when on the watch.
    //Must be improved : https://github.com/gaperton/ionic-views/blob/master/docs/optimization-guidelines.md
    let tolerance = 1
    let filteredScreenCoords = simplify(screenCoords, tolerance, true).map(elt => [elt.x, elt.y])
    while (filteredScreenCoords.length > 100) {
      tolerance = tolerance + 0.05
      filteredScreenCoords = simplify(screenCoords, tolerance, true).map(elt => [elt.x, elt.y])
    }

    //Transfer data to watch
    let data = {
      stats: stats,
      screenCoords: filteredScreenCoords
    }
    outbox.enqueue("polyline.txt", encode(JSON.stringify(data))).then(function (ft) {
      // Queued successfully
      console.log("Transfer of polyline.txt successfully queued.");
    }).catch(function (error) {
      // Failed to queue
      throw new Error("Failed to queue polyline.txt. Error: " + error);
    });
  }else{
    settingsStorage.setItem('message', route.message);
  }
}

//Get Strava routes
async function getRoutes() {
  let strava = JSON.parse(settingsStorage.getItem("strava"));
  let response = await fetch('https://www.strava.com/api/v3/athletes/' + strava.athlete.id + '/routes?page=1&per_page=30', {
    headers: {
      "Authorization": "Bearer " + strava.access_token
    }
  })

  let data = await response.json()
  return data;
}

//Get Strava's route details
async function getRoute(id) {

  let strava = JSON.parse(settingsStorage.getItem("strava"));
  let response = await fetch('https://www.strava.com/api/v3/routes/' + id, {
    headers: {
      "Authorization": "Bearer " + strava.access_token
    }
  })
  let data = await response.json()
  settingsStorage.setItem('message', data.message?message:"Successfully downloaded.")
  return data;
}


//Update Strava'saccess token using refresh token
async function getRefreshedToken() {
  let strava = JSON.parse(settingsStorage.getItem("strava"));
  var paramsString = "client_id="+env.strava.clientId+"&client_secret="+env.strava.clientSecret+"&grant_type=refresh_token&refresh_token=" + strava.refresh_token;

  let response = await fetch('https://www.strava.com/api/v3/oauth/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(paramsString)
  })

  let data = await response.json()
  return data;
}