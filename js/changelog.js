renderLogSummary();

///////////////////////////////////////////////////////////////

const LATEST_URL = "https://robertl.in/server/xna/latest.txt";

async function renderLogSummary() {
  await renderClientChangelog(); // must happen first!
  await renderServerChangelog();
  renderDatalog();
}

async function renderDatalog() {
  const rs = await fetch(LATEST_URL);
  const latest = await rs.text();
  // console.log(">> latest:", latest);
  // console.log(">> latest in ET:", convertToEasternTime(latest));

  const ms = await fetch("../data/movies.json");
  const movieJson = await ms.json();
  // console.log(movieJson[0].yearMonth);
  
  const d = new Date();
  const freshness = calculateFreshness(latest, d.toISOString());
  const syncTitle = `data freshness:\n• bsky: ${convertToEasternTime(latest)}\n• bmc: ${movieJson[0].yearMonth}`;
  document.getElementById("releasenotes").innerHTML += ` &nbsp;∾&nbsp; <a href="${LATEST_URL}" title="${syncTitle}">${freshness}</a>`;
}

async function renderServerChangelog() {
  const ss = await fetch("https://robertl.in/server/changelog.json");
  const serverNotes = await ss.json();
  const s = serverNotes[0]; // get the latest server release notes
  const serverBuildTitle = `${s.version} ≋ ${s.dt}\n${s.notes.map(note=>`• ${note}`).join("\n")}`;

  document.getElementById("releasenotes").innerHTML += ` &nbsp;∾&nbsp; <a href="https://robertl.in/server/changelog.json" title="${serverBuildTitle}">${s.version}</a>`;
}

async function renderClientChangelog() {
  const rs = await fetch("../changelog.json");
  const releases = await rs.json();
  const r = releases[0]; // get the latest client release notes
  let bugs = "";
  if (r.bugs) {
    bugs = `\n\nbugs:\n${r.bugs?.map(bug=>`• ${bug}`).join("\n")}`;
  }
  const clientBuildTitle = `${r.version} ≋ ${r.dt}\n${r.notes.map(note=>`• ${note}`).join("\n")}${bugs}`;
  document.getElementById("releasenotes").innerHTML = `<a href="../changelog.json" title="${clientBuildTitle}">${r.version}<a/>`;
}

function convertToEasternTime(utcDateStr) {
  const utcDate = new Date(utcDateStr);  // eg. '2024-11-30T12:51:10.621Z'
  const estDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return estDate.toString();
}

function calculateFreshness(dtStr1, dtStr2) {
  const date1 = new Date(dtStr1);
  const date2 = new Date(dtStr2);

  // Get the difference in milliseconds
  const diffMs = Math.abs(date2 - date1);

  // Calculate the time components
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Create a readable freshness message
  let freshness;

  if (diffDays > 0) {
    freshness = `${diffDays}d ago`;
  } else if (diffHours > 0) {
    freshness = `${diffHours}h ago 🍿`;
  } else if (diffMinutes > 0) {
    freshness = `${diffMinutes}m ago 🍿`;
  } else {
    freshness = `${diffSeconds}s ago 🍿`;
  }

  return freshness;
}