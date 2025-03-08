function changeNavbar(secId) {
    // console.log(">> fire changeNavbar", section);

    document.querySelectorAll('.section').forEach((el) => {
      el.classList.remove('selectedsection');
    });
    document.getElementById(secId).classList.add('selectedsection');

    if (secId == "blueskySec") {
      document.getElementById('subnavBluesky').style.display = 'block';
      document.getElementById('subnavExperiments').style.display = 'none';
      document.getElementById('subnavWriting').style.display = 'none';
      document.getElementById('subnavKingdom').style.display = 'none';
      document.getElementById('subnavMisc').style.display = 'none';
    } else if (secId == "experimentsSec") {
      document.getElementById('subnavBluesky').style.display = 'none';
      document.getElementById('subnavExperiments').style.display = 'block';
      document.getElementById('subnavWriting').style.display = 'none';
      document.getElementById('subnavKingdom').style.display = 'none';
      document.getElementById('subnavMisc').style.display = 'none';
    } else if (secId == "writingSec") {
      document.getElementById('subnavBluesky').style.display = 'none';
      document.getElementById('subnavExperiments').style.display = 'none';
      document.getElementById('subnavWriting').style.display = 'block';
      document.getElementById('subnavKingdom').style.display = 'none';
      document.getElementById('subnavMisc').style.display = 'none';
    } else if (secId == "kingdomSec") {
      document.getElementById('subnavBluesky').style.display = 'none';
      document.getElementById('subnavExperiments').style.display = 'none';
      document.getElementById('subnavWriting').style.display = 'none';
      document.getElementById('subnavKingdom').style.display = 'block';
      document.getElementById('subnavMisc').style.display = 'none';
    } else if (secId == "miscSec") {
      document.getElementById('subnavBluesky').style.display = 'none';
      document.getElementById('subnavExperiments').style.display = 'none';
      document.getElementById('subnavWriting').style.display = 'none';
      document.getElementById('subnavKingdom').style.display = 'none';
      document.getElementById('subnavMisc').style.display = 'block';
    }
}

// Select the correct navbar item based on the current URL
function showDefaultNavbar() {
    // console.log(">> fire showSelectedNavbar", new Date());
    const url = window.location.pathname;
    if (url.includes("ask") || url.includes("maze") || url.includes("bmc") || url.includes("gbc")) {
        changeNavbar('experimentsSec');
    } else if (url.includes("kingdom")) {
      changeNavbar('kingdomSec');
    }  else if (url.includes("writing")) {
      changeNavbar('writingSec');
    } 
    else {
        changeNavbar('blueskySec');
    }
}

function renderNavbar() {
  return `
      <span id="blueskySec" class="section selectedsection" 
        onmouseover="changeNavbar('blueskySec');">
          <a href="/xna">bluesky</a></span> •
      <span id="experimentsSec" class="section" 
        onmouseover="changeNavbar('experimentsSec');">
          <a href="/maze">experiments</a></span> •
      <span id="writingSec" class="section" 
        onmouseover="changeNavbar('writingSec');">
          <a href="/writing">writing</a></span> •
      <span id="kingdomSec" class="section" 
        onmouseover="changeNavbar('kingdomSec');">
          <a href="/kingdom">kingdom</a></span> •
      <span id="miscSec" class="section" 
        onmouseover="changeNavbar('miscSec');">
          <a href="https://github.com/r002/r002.github.io?tab=readme-ov-file#xna-help-your-people-find-you-">misc</a></span>
      <br />

      <div id="navbar" onmouseleave="showDefaultNavbar();">
        <div id="subnavBluesky" class="subheader" style="display: none;">
            <a href="/xna">xna</a> • <span title="🚧 under construction 🚧">mutuals</span> • <a href="../filmbot">filmbot</a>
        </div>
        <div id="subnavExperiments" class="subheader" style="display: none;">
            <a href="/bmc">bmc</a> • 
            <a href="/gbc">gbc</a> • 
            <a href="/maze">curiosity maze</a> •
            <a href="/ask">marriage thesis</a> 
        </div>
        <div id="subnavWriting" class="subheader" style="display: none;">
          <span title="🚧 under construction 🚧">essays</span>
        </div>
        <div id="subnavKingdom" class="subheader" style="display: none;">
          <a href="/kingdom#preface">preface</a> • 
          <a href="/kingdom#contents">contents</a> • 
          <span title="🚧 under construction 🚧">appendix</span>
        </div>
        <div id="subnavMisc" class="subheader" style="display: none;">
          <a href="https://github.com/r002/r002.github.io?tab=readme-ov-file#xna-help-your-people-find-you-">readme</a> • 
          <a href="https://github.com/r002/r002.github.io">source</a> • 
          <a href="https://robertl.in/server/xna/x.json">thought supply chain</a>
        </div>
      </div>

      <div id="titleWrapper">
        <div id="title">
          <a href="/" title="Robert Lin">Robert Lin</a>
          &nbsp;&nbsp;&nbsp;
          <div id="releasenotes" class="version" title=""></div>
        </div>
      </div>

      <div id="quoteWrapper">
        <div id="quotebar"></div>
      </div>`;
}

document.getElementById('navbar').innerHTML = renderNavbar();
showDefaultNavbar();