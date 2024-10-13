const Z_2024 = new Map();

renderpage();

async function renderpage() {
  const newscol = await fetchnews();
  renderthumbs(newscol);
}

async function fetchnews() {
    const rs = await fetch("../data/zeitgeist.json");
    const newscol = await rs.json();
    newscol.sort((a, b) => a.id.localeCompare(b.id));
    // newscol.sort((b, a) => a.id.localeCompare(b.id));  // reverse
    return newscol;
}

function renderthumbs(newscol) {
  for (const item of newscol) {

    // Set month year header, if needed
    if (!Z_2024.has(`${item.year}-${item.month}`)) {
      document.getElementById("leftpane").innerHTML += `
        <div class="yearheader">
          ${item.month} ${item.year}
        </div>
        <div id="${item.year}-${item.month}" class="monthnews"></div>
      `;
      Z_2024.set(`${item.year}-${item.month}`, null);
    }

    const s = item.style !== undefined ? `style="${item.style}"` : "";

    document.getElementById(`${item.year}-${item.month}`).innerHTML += `
                <div class="itemcontainer" ${s}>
                  <div id="${item.id}" class="itemtitle" title="${item.title}">
                    ${item.title}
                    <div class="poster"
                      style='background-image: url("../img/z/${item.id}.jpg");'>
                    </div>
                  </div>
                </div>`
  }
}

// function renderthumbs2() {
//     // console.log(MOVIES.size);
//     // console.log(MOVIES);
  
//     for (const o of NDB) {
//       let s = "";
//       for (const [id, newsitem] of o.DICT.entries()) {
//           const title = newsitem.review != null ? newsitem.review : "";
//         //   const onclick = m.refs != null ? `onclick="window.open('${m.refs[0]}')"` : "";
//           // const cursor = m.refs != null ? `cursor: pointer;` : "";
//           // const mt = m.refs != null ? "monthtitleclickable" : "monthtitle";
  
//           s += `<div class="itemcontainer">
//                   <div id="${id}" class="itemtitle" title="${title}" ${onclick}>
//                     ${newsitem.title}
//                     <div class="poster"
//                       style='background-image: url("../img/z/${id}.jpg");'>
//                     </div>
//                   </div>
//                 </div>`;
//       };
//       document.getElementById(o.ID).innerHTML = s;
//     }
//   }

