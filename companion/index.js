import { outbox } from "file-transfer"
import { settingsStorage } from "settings";
import {degrees2meters, decodePolyline, getStats, convertToScreenCoords} from "../common/lib";
import { encode } from 'cbor';
import * as env from '../env.js'
import simplify from 'simplify-js'

console.log(settingsStorage.getItem("strava"));
console.log(env.strava.clientId)
settingsStorage.onchange = function(evt) {
  console.log(settingsStorage.getItem("strava"));
    console.log(JSON.stringify(evt));
    if(evt.key==='refresh'){
      transferFile();
    }
    /*let polyline = "{|giHsnaMtE}SH?NIHQ@YI_@`CuKfFiV|GqZLOLERB`Ah@RBPCLKP]Fi@Ks@U[gBmA{BqAMCsB?t@mDGmB?_ALuAhEqRcJ_Jo@yAa@_@kAe@_B}AcJiJMWqDhAETcChFoEeBS_BpCyFrDjATPpDgAj@^pMgEn@Wp@QjPiFbGuBxAp@hJwa@ZgAjAcFfGkX~Hy^jByM|CkSrEo[v@uCRm@JO~@sDfA_Fl@uDh@mDv@{Kb@?PKl@sARQ\\QdA]x@w@vJeDbAu@pAkBvBqFsEmJmAwAaFiFQ]bCqOd@kGH}FXaIXmGDa@p@WvAiB|KaI`BsAt@u@|@eAjQ}TdJyLjBmBtCmD`@q@f@o@Jy@?a@DONWTIL@LF^w@ZcApKaa@zAeGl@qBjCcK`@aAf@c@dBmGDi@Ay@lA}EhAwD\\eCb@{HJoD?_DUeHa@kDg@eC}CkNaDsMgAiDmBwEqAgCsA{BsAiC?@}@{Bo@sBeAyDy@}DkGm^PgCAi@RsCX_ANuBhU}]~FsI~GoJh@}@fFoJtGsJrKgOtJuNDHPFsAnn@rPbAxMp@xBTnAT`CpAfA~@l@b@~@z@lAxA~@vAfA|CCbCSzEe@pGm@dGaA`G_A`EoA~D_@`AcAvBaClDyBtCkAfBwApC_B`FcA|Ec@vCYfCUlC[jHDrMNvGDrDG|DQhC[|Bi@`Di@rFI~BApDJlF@jCAvBUrEi@zEe@xBa@rAu@lBu@`BaDxFmAbBkB`CgBjCe@v@yA~CER[x@o@rBMTc@dBe@xCKvA?h@N\\sMtUMNuHdNkA|ByFfHeInFeBxAyFrHaAdA]XoAr@uIrHw@|@u@l@i@~AuFdOqEfLcC|GkGbPsMj]dJlRdEbJ{DvFkChDy@xA_Bj@kCjAeCxBkGbIaAGIHoAvBeBvDWv@mBfHVREd@q@hCAb@[~@mCdM_@rAaDzIs@xBQhAq@|Be@t@M`@sA~Fy@pC}CjP_@vCeDdQqA`L[pASj@Oz@SrBQrF{@pKkE|ZoCxKeNjm@M~@gAfEuApGa@fAg@jCErAFxFf@~z@CzAH`ODx@RpB`B`T\\|CvA|KlCrMdAlDdA~A~EzGDhAz@|@j@hATDf@ArFlH`B|Ah@x@b@~@|EpGr@fAjAxAfFfHfAtAfBfCpAtBhHjO~CfGXVpE`Jf@v@vJzJxC~Cd@`@xYbZb@n@zJzUW~@qG~QOr@eB|Ek@lAeAbBiBdBg@Zi@Vs@Vs@LgAFCH?^BFCrDsImDa@M[a@kBy@gBs@_B_@uCgA{Aw@m[kQQWiBeA]C_KwF}@`FMLqBhLMvBGtBAnGInEDvBfAfSTrFPvGHbIExDOlD[dEUrB]~Bk@zCo]gS}G{Dq@]{NoI_CkJ]gB?@{@eD?@aDkM[w@iC}Js@iDuAyE_H{W}CZiB`@qBv@eBdAgAlA]h@qAjCwAeI_AwHUaCs@cLUeCw@yF?YlA_AlAc@jB[pC]jAY`Nth@^@bGf@zACrAUdAYjAe@zBoAbAq@]eF_A}Cm@}AeEsIiAmCu@{B{@gEEw@@eAG}@i@cFBgAd@k@VgA@c@KeAIYMWi@c@WG[DO{BgAqS";//JSON.parse(settingsStorage.getItem("polyline")).name;
    let MercatorCoords = decodePolyline(polyline).map(elt=>degrees2meters(elt[1],elt[0]))
    console.log(MercatorCoords[0][0]+" "+MercatorCoords[0][1])
    console.log(MercatorCoords[MercatorCoords.length-1][0]+' '+MercatorCoords[MercatorCoords.length-1][1])
    let stats = getStats(MercatorCoords);
    let filteredScreenCoords = convertToScreenCoords(MercatorCoords,stats).filter((elt,i,arr)=>i%(parseInt(arr.length/60)+1)===0);
    console.log(filteredScreenCoords.length);
    let data={
      stats:stats,
      screenCoords:filteredScreenCoords
    }
    outbox.enqueue("polyline.txt", encode(JSON.stringify(data))).then(function (ft) {
        // Queued successfully
        console.log("Transfer of polyline.txt successfully queued.");
      }).catch(function (error) {
        // Failed to queue
        throw new Error("Failed to queue polyline.txt. Error: " + error);
      });*/
  }

console.log('Hello world!');

async function transferFile(){
  
  let strava = JSON.parse(settingsStorage.getItem("strava"))
  console.log(strava.expires_at);
  console.log(new Date().getTime()/1000);
  if(strava.expires_at<new Date().getTime()/1000){
    console.log('Get a refreshed token');
    let data = await getRefreshedToken();
    
    strava.expires_at = data.expires_at;
    strava.access_token = data.access_token;
    strava.refresh_token = data.refresh_token;
    settingsStorage.setItem("strava",JSON.stringify(strava))
  }
  
  let routes = await getRoutes()
  //Use id_str instead of id : https://groups.google.com/forum/#!topic/strava-api/4HkuGf0-_ss
  let route = await getRoute(routes.filter(elt=>elt.starred)[0].id_str);

  let MercatorCoords = decodePolyline(route.map.polyline).map(elt=>degrees2meters(elt[1],elt[0]))
  console.log(MercatorCoords[0][0]+" "+MercatorCoords[0][1])
  console.log(MercatorCoords[MercatorCoords.length-1][0]+' '+MercatorCoords[MercatorCoords.length-1][1])
  let stats = getStats(MercatorCoords);
  let screenCoords = convertToScreenCoords(MercatorCoords,stats).map(elt=>{return {x:elt[0],y:elt[1]}});
  let tolerance = 1
  let filteredScreenCoords = simplify(screenCoords,tolerance,true).map(elt=>[elt.x,elt.y])
  while(filteredScreenCoords.length>100){
    tolerance = tolerance + 0.05
    filteredScreenCoords = simplify(screenCoords,tolerance,true).map(elt=>[elt.x,elt.y])
  }
  //let filteredScreenCoords = screenCoords.filter((elt,i,arr)=>i%(parseInt(arr.length/100)+1)===0);
  console.log(filteredScreenCoords.length);
  let maxDistance= 0;
  let distances = [];
  filteredScreenCoords.forEach((elt,i,arr)=>{
    if(i>0){
      let dist = Math.sqrt(Math.pow(arr[i-1][0]-arr[i][0],2)+Math.pow(arr[i-1][1]-arr[i][1],2))
      distances.push(dist);
      if(dist>maxDistance){
        maxDistance = dist;
      }
    }
  })
  console.log('maxDistance: '+maxDistance);
  let average = distances.reduce((a, b) => a + b) / distances.length;
  console.log('average: '+average)
  let data={
    stats:stats,
    screenCoords:filteredScreenCoords,
    maxDistance:maxDistance
  }
  outbox.enqueue("polyline.txt", encode(JSON.stringify(data))).then(function (ft) {
      // Queued successfully
      console.log("Transfer of polyline.txt successfully queued.");
    }).catch(function (error) {
      // Failed to queue
      throw new Error("Failed to queue polyline.txt. Error: " + error);
    });
}

async function getRoutes() 
{
  let strava = JSON.parse(settingsStorage.getItem("strava"));
  let response = await fetch('https://www.strava.com/api/v3/athletes/'+strava.athlete.id+'/routes?page=1&per_page=30',{
      headers : {
        "Authorization":"Bearer "+ strava.access_token
      }
    })

  let data = await response.json()
  return data;
}

async function getRoute(id) 
{
  
  

  let strava = JSON.parse(settingsStorage.getItem("strava"));
  let response = await fetch('https://www.strava.com/api/v3/routes/'+id,{
      headers : {
        "Authorization":"Bearer "+ strava.access_token
      }
    })
  let data = await response.json()
  settingsStorage.setItem('route', JSON.stringify(data))
  return data;
}

async function getRefreshedToken() 
{
  let strava = JSON.parse(settingsStorage.getItem("strava"));
  var paramsString = "client_id=42995&client_secret=5fb33c49b44c28dc55ce41aa56f28dec6bd025f4&grant_type=refresh_token&refresh_token="+strava.refresh_token;

  let response = await fetch('https://www.strava.com/api/v3/oauth/token',{
    method:'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },  
    body :new URLSearchParams(paramsString)
  })

  let data = await response.json()
  console.log(data)
  return data;
}