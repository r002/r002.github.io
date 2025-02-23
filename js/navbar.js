function changeNavbar(secId) {
    // console.log(">> fire changeNavbar", section);

    document.querySelectorAll('.section').forEach((el) => {
      el.classList.remove('selectedsection');
    });
    document.getElementById(secId).classList.add('selectedsection');

    if (secId == "blueskySec") {
      document.getElementById('nav1').style.display = 'block';
      document.getElementById('nav2').style.display = 'none';
      document.getElementById('nav4').style.display = 'none';
    } else if (secId == "experimentsSec") {
      document.getElementById('nav1').style.display = 'none';
      document.getElementById('nav2').style.display = 'block';
      document.getElementById('nav4').style.display = 'none';
    } else if (secId == "miscSec") {
      document.getElementById('nav1').style.display = 'none';
      document.getElementById('nav2').style.display = 'none';
      document.getElementById('nav4').style.display = 'block';
    }
}

// Select the correct navbar item based on the current URL
function showDefaultNavbar() {
    // console.log(">> fire showSelectedNavbar", new Date());
    const url = window.location.pathname;
    if (url.includes("ask") || url.includes("maze") || url.includes("bmc")) {
        changeNavbar('experimentsSec');
    } else {
        changeNavbar('blueskySec');
    }
}

showDefaultNavbar()