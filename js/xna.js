// initial load all of my tweets
const DBURL = "../x.json";
const ORGSURL = "../data/orgs.json";
const MEDIAURL = "../data/media.json";

let SELECTEDPERSON = "";
let mapTAG,    // map of tags => [tids]
    mapPPL,    // map of handle => [tids]
    mapDATE,   // map of date => [tweet]
    mapTIDS,   // map of tid => tweet
    dbPPL,     // map of handle => personObjs
    setORGS,   // set of orgs
    setMEDIA,  // set of media
    arrDATES,  // [dates]
    arrTWEET,  // [tweetObjs] from oldest to newest
    arrTIDS;   // [tids] from newest to oldest

fetchdata();

async function fetchdata() {
  const tweetspayload = await fetch(DBURL);
  const tweets = await tweetspayload.json();
  console.log(">> tweets length:", tweets.length);

  const orgspayload = await fetch(ORGSURL);
  const orgs = await orgspayload.json();
  console.log(">> orgs length:", orgs.length);

  const mediapayload = await fetch(MEDIAURL);
  const media = await mediapayload.json();
  console.log(">> media length:", media.length);

  arrTIDS = tweets.map(t=>t.id);
  arrTWEET = tweets.reverse();
  arrDATES = Array.from(new Set(tweets.map(t=>t.dt)));

  indexDB(arrTWEET, orgs, media);
  rendercalendar();
  rendermeta("revchrono");
  renderDefaultStream();
}

function indexDB(dbArr, orgsArr, mediaArr) {
  mapTAG = new Map();
  mapPPL = new Map();
  dbPPL = new Map();
  mapDATE = new Map();
  mapTIDS = new Map();
  setORGS = new Set(orgsArr.map(o=>o.substr(1).toLowerCase()));
  setMEDIA = new Set(mediaArr.map(o=>o.substr(1).toLowerCase()));

  for (let t of dbArr) {
    // Index tweets by tid
    mapTIDS.set(t.id, t);

    // Index tweets by date
    if(mapDATE.has(t.dt)) {
      mapDATE.get(t.dt).push(t);
    } else {
      mapDATE.set(t.dt, [t]);
    }

    // Index people
    if (t.people) {
      for (const person of t.people.reverse()) {
        const handle = person.handle.substr(1).toLowerCase();
        dbPPL.set(handle, person);
        if(!mapPPL.has(handle)){
          mapPPL.set(handle, [t.id]);
        } else {
          mapPPL.get(handle).push(t.id);
        }

        // Index people's names into mapTAG
        const cleanName = person.name.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,""); // strip all punctuation
        const arr = cleanName.toLowerCase().split(/[ -]/).filter(token => token!=="");
        for (const nameWord of arr) {
          if(!mapTAG.has(nameWord)){
            mapTAG.set(nameWord, [t.id]);
          } else {
            mapTAG.get(nameWord).push(t.id);
          }
        }
        // console.log(`>> index added: ${handle} => ${JSON.stringify(DBPPL.get(handle))}`);
      }
    }

    // Index tags
    if (t.tags) {
        for (const tag of t.tags) {
            for (let tagWord of tag.split(" ")) {
                tagWord = tagWord.toLowerCase();
                if(!mapTAG.has(tagWord)){
                    mapTAG.set(tagWord, [t.id]);
                } else {
                    mapTAG.get(tagWord).push(t.id);
                }
                // console.log(`>> index added: ${keyword} => ${JSON.stringify(DBMAP.get(keyword))}`);
            }
        }
    }
  }
  console.log(">> index finished; mapTAG size:", mapTAG.size);
  console.log(">> index finished; mapPPL size:", mapPPL.size);
  console.log(">> index finished; dbPPL size:", dbPPL.size);
}

function renderDefaultStream() {
  if(SELECTEDPERSON==="") {
    rendertweets(arrTIDS);
  } else {
    rendertweets(mapPPL.get(SELECTEDPERSON));
  }
}

function highltperson(handle) {
  // Highlight person
  Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
  document.getElementById(handle).classList.remove("dim");

  // Highlight tweets
  rendertweets(mapPPL.get(handle));

  // Highlight days
  highltdays(mapPPL.get(handle));
}

function unhighltperson() {
  resetppl();
  renderstream();
}

function selectperson(handle){
  if (SELECTEDPERSON===handle) {
    document.getElementById(SELECTEDPERSON).classList.remove("person-sel");
    SELECTEDPERSON = "";
    // re-enable search
    document.getElementById("search").placeholder = "*"
    document.getElementById("search").disabled = false;
  } else {
    if (SELECTEDPERSON !== "") {
      document.getElementById(SELECTEDPERSON).classList.remove("person-sel");
    }
    document.getElementById(handle).classList.add("person-sel");
    SELECTEDPERSON = handle;
    // clear and disable search
    document.getElementById("search").value = "";
    document.getElementById("search").placeholder = "deselect person to re-enable"
    document.getElementById("search").disabled = true;
  }
  
}

function rendermeta(mode) {
  let ppl = orgs = media = "";
  let pplcount = orgscount = mediacount = 0;
  if (mode === "revchrono") {
    const revsersechrono = Array.from(mapPPL.keys()).reverse();
    for (let handle of revsersechrono) {
      if (setORGS.has(handle)) {
        orgs += genavatar(handle);
        orgscount++;
      } else if (setMEDIA.has(handle)) {
        media += genavatar(handle);
        mediacount++;
      } else {
        ppl += genavatar(handle);
        pplcount++;
      }
    }
  }
  else if (mode === "frequency") {
    const personArr = Array.from(mapPPL);
    personArr.sort((a, b) => a[1].length - b[1].length).reverse();
    for (const p of personArr) {
      if (setORGS.has(p[0])) {
        orgs += genavatar(p[0]);
        orgscount++;
      } else if (setMEDIA.has(p[0])) {
        media += genavatar(p[0]);
        mediacount++;
      } else {
        ppl += genavatar(p[0]);
        pplcount++;
      }
    }
  }
  document.getElementById("people").innerHTML = ppl;
  document.getElementById("orgs").innerHTML = orgs;
  document.getElementById("media").innerHTML = media;
  document.getElementById("titlepeople").innerHTML = `People (${pplcount})`;
  document.getElementById("titleorgs").innerHTML = `Organizations (${orgscount})`;
  document.getElementById("titlemedia").innerHTML = `TV + Movies (${mediacount})`;
  document.getElementById("titleyear").innerHTML = `2024 | "Year of Connection" (${arrDATES.length})`;
}

function genavatar(pid) { // pid is a person's handle, but just lowercase
  return `<div class="person" id="${pid}"
          title="${dbPPL.get(pid).handle}"
          onmouseover="highltperson('${pid}')"
          onmouseout="unhighltperson()"
          onclick="selectperson('${pid}')"
          style='background-image: url("../img/pfp/${dbPPL.get(pid).handle.substr(1)}.jpg")'></div>`;
}

function toggle(el) {
  document.getElementById("togglechronological").classList.remove("sel");
  document.getElementById("togglefrequency").classList.remove("sel");
  el.classList.add("sel");

  if (SELECTEDPERSON !== "") {
    const temp = SELECTEDPERSON;
    SELECTEDPERSON = "";
    highltperson(temp);
    selectperson(temp);
  }
}

let dayNo = 1;
function rendermonth(startday, daycount) {
  let s = "";

  for (let i=0; i<startday; i++) {
    s += `<div class="ph"></div>`;
  }

  for (let i=0; i<daycount; i++) {
    const dt = arrDATES[dayNo-1];
    const tweetArr = mapDATE.get(dt);
    if (tweetArr) {
      s += `<div id="${dt}" class="day ${getgreenintensity(tweetArr.length)}"
            title="${genenhancedtip(tweetArr)}"
            onmouseover="rendertweets([${tweetArr.map(t=>t.id)}]);highltppl([${tweetArr.map(t=>t.id)}]);"
            onmouseout="renderstream();resetppl();"
            onclick="goto('${dt}')"></div>`;
    } else {
      s += `<div id="${dayNo}" class="day"
            title="Day ${dayNo}"></div>`;
    }
    dayNo++;
  }
  return s;
}

function getgreenintensity(tweetcount) {
  if (tweetcount<3){
    return `past${tweetcount}`;
  }
  return `past3`;
}

function rendercalendar() {
  const jan = rendermonth(1, 31);
  const feb = rendermonth(4, 29);
  const mar = rendermonth(5, 31);
  const apr = rendermonth(1, 30);
  const may = rendermonth(3, 31);
  const jun = rendermonth(6, 30);
  const jul = rendermonth(1, 31);
  const aug = rendermonth(4, 31);
  const sep = rendermonth(0, 30);
  const oct = rendermonth(2, 31);
  const nov = rendermonth(5, 30);
  const dec = rendermonth(0, 31);
  
  document.getElementById("2024-01").innerHTML = jan;
  document.getElementById("2024-02").innerHTML = feb;
  document.getElementById("2024-03").innerHTML = mar;
  document.getElementById("2024-04").innerHTML = apr;
  document.getElementById("2024-05").innerHTML = may;
  document.getElementById("2024-06").innerHTML = jun;
  document.getElementById("2024-07").innerHTML = jul;
  document.getElementById("2024-08").innerHTML = aug;
  document.getElementById("2024-09").innerHTML = sep;
  document.getElementById("2024-10").innerHTML = oct;
  document.getElementById("2024-11").innerHTML = nov;
  document.getElementById("2024-12").innerHTML = dec;
}

function genenhancedtip(tweetArr) {
  if (!tweetArr[0]) {
    return ""; // tweet doesn't yet exist; just return no tooltip
  }
  const tooltip = [];
  for (t of tweetArr) {
    const ppl = t.people != null ? `       | ${t.people.map(p=>p.name).join(", ")}` : "";
    tooltip.push(`${leftpad(t.id)} | ${genprettydate(t.dt)}\n       | ${t.title}\n${ppl}`);
  }
  return tooltip.reverse().join("\n");
}

function genprettydate(dt) {
  const dateParts = dt.split("-");
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObject);
  const parts = formattedDate.split(", ");
  return `${parts[1]}, ${parts[2]} - ${parts[0]}`;
}

function goto(dt) {
  const t = mapDATE.get(dt)[0]; // Just open the first tweet in the tweetArr
  window.open(t.url);
}

function highltdays(tidArr) {
  for (dayNo of tidArr) {
    const dt = mapTIDS.get(dayNo).dt;
    document.getElementById(dt).classList.add("selected");
  }
}

function unhighltdays(tidArr) {
  for (dayNo of tidArr) {
    const dt = mapTIDS.get(dayNo).dt;
    document.getElementById(dt).classList.remove("selected");
  }
}

function highltppl(tidArr) {
  Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
  for (const tid of tidArr) {
    const t = mapTIDS.get(tid);
    if (t.people) {
      // console.log(t.people.map(p=>p.handle));
      t.people.forEach(p=>document.getElementById(p.handle.substr(1).toLowerCase()).classList.remove("dim"));
    }
  }
}

function rendertweets(tidArr) {
  tidArr.sort((a, b) => b - a); // sort largest to smallest
  let s = "";
  for (const id of tidArr) {
    const t = arrTWEET[id-1];
    const e = t.title.length >= 54 ? "..." : "";
    s += `<div class="tweetresult" 
            title="${genenhancedtip([t])}"
            onmouseover="highltdays([${t.id}]);highltppl([${t.id}]);"
            onmouseout="unhighltdays([${t.id}]);resetppl();">
            ${leftpad(t.id)}: 
            <a href="${t.url}" target="_blank">${t.title.substr(0,54) + e}</a>
          </div>`;
  }
  document.getElementById("searchresult").innerHTML = s;
  document.getElementById("titletimestream").innerHTML = `Tweet Timestream (${tidArr.length})`;
}

function leftpad(id){
  return(("00"+id).slice(-3));
}

function resetppl() {
  if(SELECTEDPERSON==="") {
    Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.remove("dim"));
  } else {
    highltperson(SELECTEDPERSON);
  }
}

function renderstream() {
    const query = document.getElementById("search").value;
    const lastChar = query.slice(-1);
    // reset all selected boxes
    Array.from(document.getElementsByClassName("day")).forEach(el => el.classList.remove("selected"));

    if (query==="") {
      renderDefaultStream();
      resetppl();
    } else if (lastChar===" ") {
        // console.log(">> fire search:", query.split(" "));
        const rs = searchDB(query);
        rendertweets(rs);

        // Paint respective days in the calendar and highlight respective people
        Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
        for (const tid of rs) {
            const t = mapTIDS.get(tid);
            document.getElementById(`${t.dt}`).classList.add("selected");
            if (t.people) {
              t.people.forEach(p=>document.getElementById(p.handle.substr(1).toLowerCase()).classList.remove("dim"));
            }
        }
    }
}

function searchDB(query) {
    const rs = new Set();
    for (const token of query.toLowerCase().split(" ")){
        if (mapTAG.has(token)) {
          mapTAG.get(token).forEach(tid=>rs.add(tid));
        }
        if (mapPPL.has(token)) {
          mapPPL.get(token).forEach(tid=>rs.add(tid));
        }
    }
    return Array.from(rs);
}