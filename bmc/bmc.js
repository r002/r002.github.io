const MOVIES_2025 = new Map();
const MOVIES_2024 = new Map();
const MOVIES_2023 = new Map();
const MDB = [
  { 
    ID: "2025content",
    DICT: MOVIES_2025
  },
  { 
    ID: "2024content",
    DICT: MOVIES_2024
  },
  { 
    ID: "2023content",
    DICT: MOVIES_2023
  }
];

renderpage();


async function renderpage() {
  await fetchmovies();
  renderthumbs();
}

async function fetchmovies() {
  const rs = await fetch("movies.json");
  const movies = await rs.json();
  movies.sort((a, b) => a.yearMonth.localeCompare(b.yearMonth));

  for (const movie of movies) {
    switch(movie.year) {
      case 2025:
        MOVIES_2025.set(movie.yearMonth, movie);
        break;
      case 2024:
        MOVIES_2024.set(movie.yearMonth, movie);
        break;
      case 2023:
        MOVIES_2023.set(movie.yearMonth, movie);
        break;
    }
  }
}

function renderthumbs() {
  // console.log(MOVIES.size);
  // console.log(MOVIES);

  for (const o of MDB) {
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