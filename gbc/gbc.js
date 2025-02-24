const BOOKS_2025 = new Map();
const DB = [
  { 
    ID: "2025content",
    DICT: BOOKS_2025
  }
];

renderpage();


async function renderpage() {
  await fetchbooks();
  renderthumbs();
}

async function fetchbooks() {
  const rs = await fetch("gbc.json");
  const data = await rs.json();
  data.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  for (const book of data) {
    switch(book.year) {
      case 2025:
        BOOKS_2025.set(book.yearMonth, book);
        break;
    }
  }
}

function renderthumbs() {
  for (const o of DB) {
    let s = "";
    for (const [yearMonth, m] of o.DICT.entries()) {
        const review = m.review != null ? m.review : "";
        const onclick = m.refs != null ? `onclick="window.open('${m.refs[0]}')"` : "";
        // const cursor = m.refs != null ? `cursor: pointer;` : "";
        // const mt = m.refs != null ? "monthtitleclickable" : "monthtitle";

        s += `<div style='display: flex;flex-direction: column;'>
                <div id="${yearMonth}" class="monthtitle" title="${review}" ${onclick}>
                  ${m.month}
                  <div class="poster"
                    style='background-image: url("img/${yearMonth}.jpg");'>
                  </div>
                </div>
              </div>`;
    };
    document.getElementById(o.ID).innerHTML = s;
  }
}