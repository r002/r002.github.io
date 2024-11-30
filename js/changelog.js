renderLogSummary();

///////////////////////////////////////////////////////////////

const LATEST_URL = "https://r002.github.io/server/xna/latest.txt";

async function renderLogSummary() {
  await renderChangelog(); // must happen first!
  renderDatalog();
}

async function renderDatalog() {
  const rs = await fetch(LATEST_URL);
  const latest = await rs.text();
  // console.log(">> latest:", latest);
  // console.log(">> latest in ET:", convertToEasternTime(latest));
  
  const d = new Date();
  const diffHours = calcuHoursDiff(latest, d.toISOString());
  const syncTitle = `last data sync\n• ${convertToEasternTime(latest)}`;
  document.getElementById("releasenotes").innerHTML += ` • <a href="${LATEST_URL}" title="${syncTitle}">${diffHours}h ago</a>`;
}

async function renderChangelog() {
  const rs = await fetch("../changelog.json");
  const releases = await rs.json();

  const r = releases[0]; // get the latest release notes

  let bugs = "";
  if (r.bugs) {
    bugs = `\n\nbugs:\n${r.bugs?.map(bug=>`• ${bug}`).join("\n")}`;
  }

  const buildTitle = `build v.${r.version}\n${r.notes.map(note=>`• ${note}`).join("\n")}${bugs}`;
  document.getElementById("releasenotes").innerHTML = `<a href="../changelog.json" title="${buildTitle}">v.${r.version} • ${r.dt}<a/>`;
}

function convertToEasternTime(utcDateStr) {
  const utcDate = new Date(utcDateStr);  // eg. '2024-11-30T12:51:10.621Z'
  const estDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  return estDate.toString();
}

function calcuHoursDiff(dtStr1, dtStr2) {
  // Convert both dates to milliseconds
  const date1 = new Date(dtStr1);
  const date2 = new Date(dtStr2);
  const diffMs = Math.abs(date2 - date1);

  // Convert milliseconds to hours
  const diffHours = diffMs / (1000 * 60 * 60);
  return Math.floor(diffHours); // Round down to the nearest integer
}
