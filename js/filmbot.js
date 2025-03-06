render();

async function render() {
  const rs = await fetch("https://robertl.in/server/data/scenes.json");
  const scenes = await rs.json();
  const s = [];
  const m = new Map();
  const POINTS_FOR_CORRECT_ANSWER = 10;

  for (const scene of scenes) {
    // console.log(scene);
    let titleyear = "NO CORRECT GUESSES RECEIVED";
    if (scene.closed && scene.guesses.length>0) {
      titleyear = `<a href="${scene.url}">${scene.title} (${scene.year})</a>`;
    }

    let guesses = "";
    if (scene.closed) {
      const correct_guesses = [];
      const incorrect_guesses = [];
      for (const guess of scene.guesses) {
        if (guess.correct) {
          correct_guesses.push(`<a href="${guess.url}" title="${guess.text}">${guess.handle}</a>`);
          // Update the user's score
          if (!m.has(guess.handle)) {
            m.set(guess.handle, POINTS_FOR_CORRECT_ANSWER);
          } else {
            m.set(guess.handle, m.get(guess.handle) + POINTS_FOR_CORRECT_ANSWER);
          }
        } else {
          incorrect_guesses.push(`<a href="${guess.url}" title="${guess.text}">${guess.handle}</a>`);
        }
      }
      if (correct_guesses.length>0) {
        guesses += `Correct: ${correct_guesses.join(", ")}<br /><br />`;
      }
      if (incorrect_guesses.length>0) {
        guesses += `Incorrect: ${incorrect_guesses.join(", ")}<br /><br />`;
      }
    }
    s.push(`
      <div class="card">
        <div class="scene"
          style='background-image: url("https://robertl.in/server/data/scenes/${scene.dt}__${scene.id}.jpg");'>
        </div>
        <div style="padding: 10px;">
          <strong>${titleyear}</strong><br /><br />
          ${guesses}
          #${scene.id} | ${scene.dt}
        </div>
      </div>
    `);
  }

  // Render scenes
  document.getElementById("scenes").innerHTML = s.join("\n<br />");

  // Render Leaderboard
  const arrleaderboard = Array.from(m, ([handle, score]) => ({ handle, score }));
  arrleaderboard.sort((a, b) => b.score - a.score);  // Sort highest to lowest score
  // console.table(arrleaderboard);
  let rank = 1;
  const leaderboard = `
          ${arrleaderboard.map(kv=>`
            <div>${rank++}</div>
            <div><a href="https://bsky.app/profile/${kv.handle}">${kv.handle}</a></div>
            <div>${kv.score} points</div>`).join("\n")}
  `;
  document.getElementById("leaderboard").innerHTML = leaderboard;
}