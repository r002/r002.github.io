// const ENV = "http://localhost:4000"; // DEV
const ENV = "https://r002.github.io/server"; // PROD

const DBURL = `${ENV}/xna/x.json`;
const ORGSURL = `${ENV}/xna/orgs.json`;
const MEDIAURL = `${ENV}/xna/media.json`;
const BOOKSURL = `${ENV}/xna/books.json`;
const AVATARROOT = `${ENV}/xna/pfp`;

let SELECTEDPERSON = "";
let mapTAG,    // map of tags => [tids]
    mapPPL,    // map of handle => [tids]
    mapDATE,   // map of date => [tweet]
    mapTIDS,   // map of tid => tweet
    dbPPL,     // map of handle => personObjs
    setORGS,   // set of orgs
    setMEDIA,  // set of media
    setBOOKS,  // set of books
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

  const bookspayload = await fetch(BOOKSURL);
  const books = await bookspayload.json();
  console.log(">> books length:", books.length);

  arrTIDS = tweets.map(t=>t.id);
  arrTWEET = tweets.reverse();
  arrDATES = Array.from(new Set(tweets.map(t=>genprettydate(t.dt, "yearMonthDay"))));

  indexDB(arrTWEET, orgs, media, books);
  rendercalendar();
  rendermeta("revchrono");
  await populatelinks(tweets);
  renderDefaultStream();

  // Parse the hash
  const fragment = window.location.hash;
  const fragmentWithoutHash = fragment.startsWith('#') ? fragment.substring(1) : fragment;
  if (fragmentWithoutHash) {
    if (fragmentWithoutHash==="people" || fragmentWithoutHash==="links" || fragmentWithoutHash==="media") {
      toggletab(fragmentWithoutHash);
    }
  }
}

function indexDB(dbArr, orgsArr, mediaArr, booksArr) {
  mapTAG = new Map();
  mapPPL = new Map();
  dbPPL = new Map();
  mapDATE = new Map();
  mapTIDS = new Map();
  setORGS = new Set(orgsArr.map(o=>o.toLowerCase()));
  setMEDIA = new Set(mediaArr.map(o=>o.toLowerCase()));
  setBOOKS = new Set(booksArr.map(o=>o.toLowerCase()));

  for (let t of dbArr) {
    // Index tweets by tid
    mapTIDS.set(t.id, t);

    // Index tweets by date
    const dt = genprettydate(t.dt, "yearMonthDay");
    if(mapDATE.has(dt)) {
      mapDATE.get(dt).push(t);
    } else {
      mapDATE.set(dt, [t]);
    }

    // Index people
    if (t.people) {
      for (const person of t.people.reverse()) {
        const handle = person.handle.toLowerCase();
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
    rendertweets(arrTIDS, true);
  } else {
    rendertweets(mapPPL.get(SELECTEDPERSON), false);
  }
}

function updateUrl(newFragment) {
  const newUrl = `/xna/#${newFragment}`;
  history.pushState({ path: '/xna' }, 'Updated Page', newUrl);
}

function toggletab(hash) {
  // console.log(evtsrc.id);
  document.getElementById(`tabscontent-people`).style.display = "none";
  document.getElementById(`tabscontent-links`).style.display = "none";
  document.getElementById(`tabscontent-media`).style.display = "none";
  document.getElementById(`tabscontent-${hash}`).style.display = "block";

  document.getElementById(`title-people`).classList.add('inactive');
  document.getElementById(`title-links`).classList.add('inactive');
  document.getElementById(`title-media`).classList.add('inactive');
  document.getElementById(`title-${hash}`).classList.remove('inactive');

  updateUrl(hash);
}

/*
  Extract all links from my posts and display them in the links pane.
*/
async function populatelinks(tweets) { // notes: tweets enter as chronological
  const tweetsReverseChrono = [...tweets].reverse();
  // console.log(tweetsReverseChrono);
  const l = [];
  for (const t of tweetsReverseChrono) {
    if (t.refs) {
      l.push(t.refs.filter(url=>!url.includes('bsky.app'))); // Filter out all retweets
      // console.log({
      //   id: t.id,
      //   title: t.title,
      //   refs: t.refs
      // });
      
    }
  }
  // console.log(l.flat(Infinity));
  document.getElementById(`tabscontent-links`).innerHTML = l.flat(Infinity).map(l=>`<li><a href='${l}'>${l}</a></li>`).join("");
}

function highltperson(handle) {
  // Highlight person
  Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
  document.getElementById(handle).classList.remove("dim");

  // Highlight tweets
  rendertweets(mapPPL.get(handle), false);

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
  let ppl = orgs = media = books = "";
  let pplcount = orgscount = mediacount = bookscount = 0;
  if (mode === "revchrono") {
    const revsersechrono = Array.from(mapPPL.keys()).reverse();
    for (let handle of revsersechrono) {
      if (setORGS.has(handle)) {
        orgs += genavatar(handle);
        orgscount++;
      } else if (setMEDIA.has(handle)) {
        media += genavatar(handle);
        mediacount++;
      } else if (setBOOKS.has(handle)) {
        books += genavatar(handle);
        bookscount++;
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
      } else if (setBOOKS.has(p[0])) {
        books += genavatar(p[0]);
        bookscount++;
      } else {
        ppl += genavatar(p[0]);
        pplcount++;
      }
    }
  }
  document.getElementById("people").innerHTML = ppl;
  document.getElementById("orgs").innerHTML = orgs;
  document.getElementById("media").innerHTML = media;
  document.getElementById("books").innerHTML = books;
  document.getElementById("title-people").innerHTML = `People (${pplcount})`;
  document.getElementById("titleorgs").innerHTML = `Organizations (${orgscount})`;
  document.getElementById("titlemedia").innerHTML = `TV + Movies (${mediacount})`;
  document.getElementById("titlebooks").innerHTML = `Books (${bookscount})`;
  document.getElementById("titleyear24").innerHTML = `2024 | "Year of Creation" (${arrDATES.filter(year=>year.includes("2024")).length})`;
  document.getElementById("titleyear25").innerHTML = `2025 | "Year of Connection" (${arrDATES.filter(year=>year.includes("2025")).length})`;
}

function genavatar(pid) { // pid is a person's handle, but just lowercase
  return `<div class="person" id="${pid}"
          title="@${dbPPL.get(pid).handle}"
          onmouseover="highltperson('${pid}')"
          onmouseout="unhighltperson()"
          onclick="selectperson('${pid}')"
          style='background-image: url("${AVATARROOT}/${dbPPL.get(pid).handle}.jpg")'></div>`;
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
function genmonth(startday, daycount) {
  let s = "";

  for (let i=0; i<startday; i++) {
    s += `<div class="ph"></div>`;
  }

  for (let i=0; i<daycount; i++) {
    const dt = arrDATES[dayNo-1];
    const tweetArr = mapDATE.get(dt);
    if (tweetArr) {
      s += `<div id="${dt}" class="day ${getintensity(tweetArr.length, dayNo)}"
            title="${genenhancedtip(tweetArr)}"
            onmouseover="rendertweets([${tweetArr.map(t=>t.id)}]);highltppl([${tweetArr.map(t=>t.id)}], false);"
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

function getintensity(tweetcount, dayNo) {
  // For all days past day #295, render blue for bsky posts
  if (dayNo>295) {
    if (tweetcount<3){
      return `past${tweetcount}`;
    }
    return `past3`;
  }
  // Else render green for X posts
  else {
    if (tweetcount<3){
      return `pastx${tweetcount}`;
    }
    return `pastx3`;
  }
}

function rendercalendar() {
  const jan24 = genmonth(1, 31);
  const feb24 = genmonth(4, 29);
  const mar24 = genmonth(5, 31);
  const apr24 = genmonth(1, 30);
  const may24 = genmonth(3, 31);
  const jun24 = genmonth(6, 30);
  const jul24 = genmonth(1, 31);
  const aug24 = genmonth(4, 31);
  const sep24 = genmonth(0, 30);
  const oct24 = genmonth(2, 31);
  const nov24 = genmonth(5, 30);
  const dec24 = genmonth(0, 31);

  const jan25 = genmonth(3, 31);
  const feb25 = genmonth(6, 28);
  const mar25 = genmonth(6, 31);
  const apr25 = genmonth(2, 30);
  const may25 = genmonth(4, 31);
  const jun25 = genmonth(0, 30);
  const jul25 = genmonth(2, 31);
  const aug25 = genmonth(5, 31);
  const sep25 = genmonth(1, 30);
  const oct25 = genmonth(3, 31);
  const nov25 = genmonth(6, 30);
  const dec25 = genmonth(1, 31);
  
  document.getElementById("2024-01").innerHTML = jan24;
  document.getElementById("2024-02").innerHTML = feb24;
  document.getElementById("2024-03").innerHTML = mar24;
  document.getElementById("2024-04").innerHTML = apr24;
  document.getElementById("2024-05").innerHTML = may24;
  document.getElementById("2024-06").innerHTML = jun24;
  document.getElementById("2024-07").innerHTML = jul24;
  document.getElementById("2024-08").innerHTML = aug24;
  document.getElementById("2024-09").innerHTML = sep24;
  document.getElementById("2024-10").innerHTML = oct24;
  document.getElementById("2024-11").innerHTML = nov24;
  document.getElementById("2024-12").innerHTML = dec24;

  document.getElementById("2025-01").innerHTML = jan25;
  document.getElementById("2025-02").innerHTML = feb25;
  document.getElementById("2025-03").innerHTML = mar25;
  document.getElementById("2025-04").innerHTML = apr25;
  document.getElementById("2025-05").innerHTML = may25;
  document.getElementById("2025-06").innerHTML = jun25;
  document.getElementById("2025-07").innerHTML = jul25;
  document.getElementById("2025-08").innerHTML = aug25;
  document.getElementById("2025-09").innerHTML = sep25;
  document.getElementById("2025-10").innerHTML = oct25;
  document.getElementById("2025-11").innerHTML = nov25;
  document.getElementById("2025-12").innerHTML = dec25;

  // // This is hack! dayNo is a global variable that is used to track the day number. It is reset here.
  // // We need to fix it so that it is not a global variable.
  // dayNo = 1;
}

function genenhancedtip(tweetArr) {
  if (!tweetArr[0]) {
    return ""; // tweet doesn't yet exist; just return no tooltip
  }
  const tooltip = [];
  for (t of tweetArr) {
    const ppl = t.people != null ? `\n       | ${t.people.map(p=>p.name).reverse().join(", ")}` : "";
    tooltip.push(`${leftpad(t.id)} | ${genprettydate(t.dt, "long")}\n       | ${t.title}${ppl}`);
  }
  return tooltip.reverse().join("\n");
}

function genprettydate(dt, fmt) {
  let dateObject;
  if (!dt.includes('Z')) {
    const dateParts = dt.split("-");
    dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  } else {
    dateObject = new Date(dt);
  }
  const options = { year: 'numeric', month: 'short', day: 'numeric', weekday: 'long' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObject);
  const parts = formattedDate.split(", ");
  switch(fmt) {
    case "long":
      return `${parts[1]}, ${parts[2]} - ${parts[0]}`;
    case "short":
      return `${parts[1]}`;
    case "yearMonthDay":
      const year = dateObject.getFullYear(); 
      const month = String(dateObject.getMonth() + 1).padStart(2, '0'); // Months are zero-based 
      const day = String(dateObject.getDate()).padStart(2, '0');
      const ymd = `${year}-${month}-${day}`;
      return ymd;
  }
}

function goto(dt) {
  const t = mapDATE.get(dt)[0]; // Just open the first tweet in the tweetArr
  window.open(t.url);
}

function highltdays(tidArr) {
  for (dayNo of tidArr) {
    const dt = genprettydate(mapTIDS.get(dayNo).dt, "yearMonthDay");
    document.getElementById(dt).classList.add("selected");
  }
}

function unhighltdays(tidArr) {
  for (dayNo of tidArr) {
    const dt = genprettydate(mapTIDS.get(dayNo).dt, "yearMonthDay");
    document.getElementById(dt).classList.remove("selected");
  }
}

function highltppl(tidArr) {
  Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
  for (const tid of tidArr) {
    const t = mapTIDS.get(tid);
    if (t.people) {
      // console.log(t.people.map(p=>p.handle));
      t.people.forEach(p=>document.getElementById(p.handle.toLowerCase()).classList.remove("dim"));
    }
  }
}

function genweektitle(weekNo, weekstartdt, weekenddt) {
  const startparts = weekstartdt.split("-");
  const endparts = weekenddt.split("-");

  if (weekstartdt===weekenddt) {
    const startdt = genprettydate(weekstartdt,"short");
    return `Week #${weekNo}: ${startdt}`;
  }
  if (startparts[1]===endparts[1]) {
    const startdt = genprettydate(weekstartdt,"short");
    const enddt = genprettydate(weekenddt,"short");
    return `Week #${weekNo}: ${startdt}-${enddt}`;
  }
  return `Week #${weekNo}: ${genprettydate(weekstartdt,"short")}-${genprettydate(weekenddt,"short")}`;
}


function rendertweets(tidArr, all) {
  tidArr.sort((a, b) => a - b); // sort smallest to largest
  // console.log(tidArr);
  let sArr = [];
  let weekNo = 1;
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  let weekstartdt = arrTWEET[0].dt;
  let weekenddt, weektitle, d;
  let t;

  for (const id of tidArr) {
    t = arrTWEET[id-1];

    if (!t) {  // Temp fix for the `[Missed Day] bug` - 9/26/24
      continue;
    }

    const e = t.title.length > 54 ? "..." : "";
    // console.log(t.dt, t.title);

    if (all) {
      d = new Date(genprettydate(t.dt, "yearMonthDay"));  // This creates date obj in UTC
      d.setHours(d.getHours()+5); // Convert the UTC date to ET

      if ("Sat"===days[d.getUTCDay()]) {
        weekenddt = genprettydate(t.dt, "yearMonthDay");
        weektitle = genweektitle(weekNo, weekstartdt, weekenddt);
      } else if("Sun"===days[d.getUTCDay()]) {
          // console.log(`\t>>> ${weektitle} <<<`);
          let prevDay = null;
          if (arrTWEET[id-2]) {
            const prevTweet = arrTWEET[id-2];
            const prevDt = new Date(genprettydate(prevTweet.dt, "yearMonthDay"));
            prevDt.setHours(prevDt.getHours()+5); // Convert the UTC date to ET
            prevDay = days[prevDt.getUTCDay()];
          }
          // console.log(">>", t.id, genprettydate(t.dt, "yearMonthDay"), prevDay);

          if (prevDay!=="Sun") {  // Only print a week header if the previous day was not Sunday
            sArr.push(`<div class="tweetresult" style="text-align:center;background-color:#fafafa;
                          border-top:1px dotted gainsboro;border-bottom:1px dotted gainsboro;">
                          ${weektitle}
                      </div>`);
            weekstartdt = genprettydate(t.dt, "yearMonthDay");
            weekNo++;
          }
      }
    }

    sArr.push(`<div class="tweetresult" 
            title="${genenhancedtip([t])}"
            onmouseover="highltdays([${t.id}]);highltppl([${t.id}]);"
            onmouseout="unhighltdays([${t.id}]);resetppl();">
            ${leftpad(t.id)}: 
            <a href="${t.url}" target="_blank">${t.title.substr(0,54).trim() + e}</a>
          </div>`);
  }

  if (all) {
      d = new Date(genprettydate(t.dt, "yearMonthDay"));  // This creates date obj in UTC
      d.setHours(d.getHours()+5); // Convert the UTC date to ET
      weekenddt = genprettydate(t.dt, "yearMonthDay");
      weektitle = genweektitle(weekNo, weekstartdt, weekenddt);
      sArr.push(`<div class="tweetresult" style="text-align:center;background-color:#fafafa;
                    border-top:1px dotted gainsboro;border-bottom:1px dotted gainsboro;">
                    ${weektitle}
                </div>`);
      weekstartdt = genprettydate(t.dt, "yearMonthDay");
  }
  sArr.reverse();
  document.getElementById("searchresult").innerHTML = sArr.join("\n");
  document.getElementById("titletimestream").innerHTML = `Tweet Timestream (${tidArr.length})`;
}

function leftpad(id){
  return(("00"+id).slice(-3));
}

function resetppl() {
  if (SELECTEDPERSON==="") {
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
        rendertweets(rs, false);

        // Paint respective days in the calendar and highlight respective people
        Array.from(document.getElementsByClassName("person")).forEach(p=>p.classList.add("dim"));
        for (const tid of rs) {
            const t = mapTIDS.get(tid);
            document.getElementById(`${t.dt}`).classList.add("selected");
            if (t.people) {
              t.people.forEach(p=>document.getElementById(p.handle.toLowerCase()).classList.remove("dim"));
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