fetch("../changelog.json")
.then(rs=>rs.json()
.then(releases=>{
  const r = releases[0]; // get the latest release notes

  let bugs = "";
  if (r.bugs) {
    bugs = `\n\nbugs:\n${r.bugs?.map(bug=>`• ${bug}`).join("\n")}`;
  }

  document.getElementById("releasenotes").title = 
    `build v.${r.version}\n${r.notes.map(note=>`• ${note}`).join("\n")}${bugs}`;
  document.getElementById("releasenotes").innerHTML = `<a href="../changelog.json">v.${r.version} • ${r.dt}<a/>`;
}));