// initial load all of my tweets
const DBURL = "../x.json";
const ORGSURL = "../data/orgs.json";
const MEDIAURL = "../data/media.json";

let SELECTEDPERSON = "";
let mapTAG,    // map of tags => [tids]
    mapPPL,    // map of handle => [tids]
    dbPPL,     // map of handle => personObjs
    setORGS,   // set of orgs
    setMEDIA,  // set of media
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
  indexDB(arrTWEET, orgs, media);
  rendercalendar();
  rendermeta("revchrono");
  renderDefaultStream();
}

function indexDB(dbArr, orgsArr, mediaArr) {
  mapTAG = new Map();
  mapPPL = new Map();
  dbPPL = new Map();
  setORGS = new Set(orgsArr.map(o=>o.substr(1).toLowerCase()));
  setMEDIA = new Set(mediaArr.map(o=>o.substr(1).toLowerCase()));

  for (let tweet of dbArr) {
    // Index people
    if (tweet.people) {
      for (const person of tweet.people) {
        const handle = person.handle.substr(1).toLowerCase();
        dbPPL.set(handle, person);
        if(!mapPPL.has(handle)){
          mapPPL.set(handle, [tweet.id]);
        } else {
          mapPPL.get(handle).push(tweet.id);
        }

        // Index people's names into mapTAG
        const arr = person.name.toLowerCase().split(/[ -]/).filter(token => token!=="");
        for (const nameWord of arr) {
          if(!mapTAG.has(nameWord)){
            mapTAG.set(nameWord, [tweet.id]);
          } else {
            mapTAG.get(nameWord).push(tweet.id);
          }
        }
        // console.log(`>> index added: ${handle} => ${JSON.stringify(DBPPL.get(handle))}`);
      }
    }

    // Index tags
    if (tweet.tags) {
        for (const tag of tweet.tags) {
            for (let tagWord of tag.split(" ")) {
                tagWord = tagWord.toLowerCase();
                if(!mapTAG.has(tagWord)){
                    mapTAG.set(tagWord, [tweet.id]);
                } else {
                    mapTAG.get(tagWord).push(tweet.id);
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

let tid = 1;
function rendermonth(startday, daycount) {
  let s = "";

  for (let i=0; i<startday; i++) {
    s += `<div class="ph"></div>`;
  }

  for (let i=0; i<daycount; i++) {
    const tweet = arrTWEET[tid-1];
    if (tweet) {
      s += `<div id="d${tid}" class="day past"
            title="${genenhancedtip(tweet)}"
            onmouseover="rendertweets([${tid}]);highltppl(${tid});"
            onmouseout="renderstream();resetppl();"
            onclick="goto(${tid})"></div>`;
    } else {
      s += `<div id="d${tid}" class="day"
            title="Day ${tid}"></div>`;
    }
    tid++;
  }
  return s;
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

function genenhancedtip(t) {
  if (!t) {
    return ""; // tweet doesn't yet exist; just return no tooltip
  }
  const ppl = t.people != null ? `       | ${t.people.map(p=>p.name).join(", ")}` : "";
  return `${leftpad(t.id)} | ${genprettydate(t.dt)}\n` + 
        `       | ${t.title}\n${ppl}`;
}

function genprettydate(dt) {
  const dateParts = dt.split("-");
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObject);
  const parts = formattedDate.split(", ");
  return `${parts[1]}, ${parts[2]} - ${parts[0]}`;
}

function goto(id) {
  const t = arrTWEET[id-1];
  window.open(t.url);
}

function highltdays(tidArr) {
  arrTIDS.forEach(tid=>document.getElementById(`d${tid}`).classList.remove("selected"));
  tidArr.forEach(tid=>document.getElementById(`d${tid}`).classList.add("selected"));
}

function unhighltdays(tidArr) {
  tidArr.forEach(tid=>document.getElementById(`d${tid}`).classList.remove("selected"));
}

function highltppl(tid) {
  const t = arrTWEET[tid-1];
  Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
  if (t.people) {
    // console.log(t.people.map(p=>p.handle));
    t.people.forEach(p=>document.getElementById(p.handle.substr(1).toLowerCase()).classList.remove("dim"));
  }
}

function rendertweets(tidArr) {
  tidArr.sort((a, b) => b - a); // sort largest to smallest
  let s = "";
  for (const id of tidArr) {
    const t = arrTWEET[id-1];
    const e = t.title.length >= 51 ? "..." : "";
    s += `<div class="tweetresult" 
            title="${genenhancedtip(t)}"
            onmouseover="highltdays([${t.id}]);highltppl(${t.id});"
            onmouseout="unhighltdays([${t.id}]);resetppl();">
            ${leftpad(t.id)}: 
            <a href="${t.url}" target="_blank">${t.title.substr(0,51) + e}</a>
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
        for (const id of rs) {
            document.getElementById(`d${id}`).classList.add("selected");
            const t = arrTWEET[id-1];
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