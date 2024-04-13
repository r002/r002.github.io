// initial load all of my tweets
const DBURL = "../x.json"; 

let SELECTEDPERSON = "";
let mapTAG,    // map of tags => [tids]
    mapPPL,    // map of handle => [tids]
    dbPPL,     // map of handle => personObjs
    arrTWEET,  // [tweetObjs] from oldest to newest
    arrTIDS;   // [tids] from newest to oldest

loadtweets();

function loadtweets() {
    fetch(DBURL).then(payload =>{
        payload.json().then(rs =>{
            console.log(">> dbArr length:", rs.length);
            arrTIDS = rs.map(t=>t.id);
            arrTWEET = rs.reverse();
            indexDB(arrTWEET);
            rendercalendar(arrTWEET);
            renderppl("revchrono");
            renderDefaultStream();
        });
    });
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
    document.getElementById("search").placeholder = "unselect person to re-enable"
    document.getElementById("search").disabled = true;
  }
  
}

function renderppl(mode) {
  let s = "";
  if (mode === "revchrono") {
    const revsersechrono = Array.from(mapPPL.keys()).reverse();
    for (let handle of revsersechrono) {
      s += genperson(handle);
    }
  }
  else if (mode === "frequency") {
    const personArr = Array.from(mapPPL);
    personArr.sort((a, b) => a[1].length - b[1].length).reverse();
    for (const p of personArr) {
      s += genperson(p[0]);
    }
  }
  document.getElementById("people").innerHTML = s;
  document.getElementById("titlepeople").innerHTML = `People (${mapPPL.size})`;
}

function genperson(pid) { // pid is a person's handle, but just lowercase
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

function indexDB(dbArr) {
    mapTAG = new Map();
    mapPPL = new Map();
    dbPPL = new Map();

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

function rendercalendar(dbArr) {
  let curMonth = "01";
  let s = `
  <div class="month">
    <div class="nocolor">Jan &nbsp;&nbsp;&nbsp; 1</div>
    <div class="nocolor"></div>`;

  let i = 1;
  for (const tweet of dbArr) {

    if (tweet.dt.split("-")[1] !== curMonth) {
        // console.log(tweet.dt.split("-")[1], curMonth, tweet.title);
        curMonth = tweet.dt.split("-")[1];

        if (curMonth==="02") {
            s += `<div class="nocolor"></div>
                  <div class="nocolor"></div>
                  <div class="nocolor"></div>
                </div>
                <div class="month">
                    <div class="nocolor">Feb &nbsp;&nbsp;&nbsp; 5</div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>`;
        } else if (curMonth==="03") {
            s += `<div class="nocolor"></div>
                  <div class="nocolor"></div>
                </div>
                <div class="month">
                    <div class="nocolor">Mar &nbsp;&nbsp;&nbsp; 9</div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>
                    <div class="nocolor"></div>`;
        }  else if (curMonth==="04") {
            s += `<div class="nocolor"></div>
                  <div class="nocolor"></div>
                  <div class="nocolor"></div>
                  <div class="nocolor"></div>
                  <div class="nocolor"></div>
                  <div class="nocolor"></div>
                </div>
                <div class="month">
                    <div class="nocolor">Apr &nbsp;&nbsp;&nbsp; 14</div>
                    <div class="nocolor"></div>`;
        }
    }

    if (i%7 === 0){
      s += `<div class="nocolor"></div>`;
    }

    s += `<div id="d${i}" class="box"
          title="${genprettydate(tweet.dt)}"
          onmouseover="rendertweets([${i}]);highltppl(${i});"
          onmouseout="renderstream();resetppl();"
          onclick="goto(${i})"></div>`;
    i++;
  }

  s += "</div>";
  document.getElementById("gridcontainer").innerHTML = s;
}

function genprettydate(dt) {
  const dateParts = dt.split("-");
  const dateObject = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dateObject);
  return formattedDate.replace(",", " -");
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
            title="${genprettydate(t.dt)}"
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
    Array.from(document.getElementsByClassName("box")).forEach(el => el.classList.remove("selected"));

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