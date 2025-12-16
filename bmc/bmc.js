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
  await renderthumbs();
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

// Adjustable diagonal:
// p = where the diagonal crosses the TOP edge (0..1)
// q = where the diagonal crosses the BOTTOM edge (0..1)
// Example: p=0.25, q=0.75 gives a nice /-style diagonal.
function setDiagonalClip(container, p = 0.3, q = 0.7) {
  const imgA = container.querySelector(".img-a"); // top layer
  const imgB = container.querySelector(".img-b"); // bottom layer

  if (!imgA || !imgB) return;

  const P = (p * 100).toFixed(3) + "%";
  const Q = (q * 100).toFixed(3) + "%";

  // imgA shows the region above/right of the diagonal
  // polygon points: top-left, (P, top), (Q, bottom), bottom-left
  imgA.style.clipPath = `polygon(0% 0%, ${P} 0%, ${Q} 100%, 0% 100%)`;

  // imgB shows the complementary region
  // polygon points: (P, top), top-right, bottom-right, (Q, bottom)
  imgB.style.clipPath = `polygon(${P} 0%, 100% 0%, 100% 100%, ${Q} 100%)`;
}

async function renderthumbs() {
  // console.log(MOVIES.size);
  // console.log(MOVIES);

  for (const o of MDB) {
    let s = "";
    for (const [yearMonth, m] of o.DICT.entries()) {
        const review = m.review != null ? m.review : "";
        const onclick = m.refs != null ? `onclick="window.open('${m.refs[0]}')"` : "";
        // const cursor = m.refs != null ? `cursor: pointer;` : "";
        // const mt = m.refs != null ? "monthtitleclickable" : "monthtitle";

        let posterStr = `
                  <img class="img-b" id="imgB" src="img/${m.yearMonth}.jpg" />
                  <img class="img-a" id="imgA" src="img/${m.yearMonth}.jpg" />
        `;
        if(m.filename.includes("a")) {
          posterStr = `
                  <img class="img-b" id="imgB" src="img/${m.yearMonth}b.jpg" />
                  <img class="img-a" id="imgA" src="img/${m.yearMonth}a.jpg" />
        `;
        }

        s += `<div class='postercontainer'>
                <div id="${m.yearMonth}" class="monthtitle" title="${review}" ${onclick}>
                  ${m.month}
                </div>
                <div class="diagonal-split" id="split" title="${m.title}">
                  ${posterStr}
                </div>
              </div>`;
    };
    document.getElementById(o.ID).innerHTML = s;

    for (const [yearMonth, m] of o.DICT.entries()) {
      try {
        setDiagonalClip(document.getElementById(`${m.yearMonth}`), 0.3, 0.7);
      } catch (e) {
        console.error(`Error setting diagonal clip for ${m.yearMonth}:`, e);
      }
    }
  }
}