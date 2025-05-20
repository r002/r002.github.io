initialLoad();

function initialLoad() {
  renderHistory();
}

async function renderHistory() {
  let s = "";

  // Render today's date
  let dtCursor = renderPrettyDate(new Date());
  document.getElementById("historyTrail").innerHTML = `<div class='span-four boldTitle'>${dtCursor}</div>`;

  // Now fetch all of the history items from atproto
  const rs = await fetch(`https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?actor=did:plc:a4dwnxjfvffmmhkmhog3qnlb&filter=posts_no_replies`);
  const rsJson = await rs.json();
  let historyArr = [];
  // console.log(rsJson);
  for (const r of rsJson.feed) {
    // render a new header if it's a new date
    const dtCurr = renderPrettyDate(new Date(r.post.record.createdAt));
    if (dtCursor!==dtCurr) {
      dtCursor = dtCurr;

      const lastChild = document.getElementById("historyTrail").lastElementChild;
      if (lastChild.className==="span-four boldTitle") {
        document.getElementById("historyTrail").innerHTML += `<div class='span-four' id='placeholder'>No current history items for today. 🙂</div>`;
      }
      document.getElementById("historyTrail").innerHTML += `<div class='span-four boldTitle'>${dtCursor}</div>`;
    }

    const url = r.post.record.text.split('\n')[1];
    const linkText = r.post.record.text.split('\n')[0];
    const dt = new Date(r.post.record.createdAt);
    const hours = dt.getHours();
    const minutes = dt.getMinutes();
    const bskyUrl = `https://bsky.app/profile/${r.post.author.did}/post/${r.post.uri.split('/')[4]}`;
    document.getElementById("historyTrail").innerHTML += `
      <div class="historyRow">
        <div class="grid-item">
          <a href="${url}" title="${url}">${linkText}</a>
        </div>
        <div class="grid-item">
          <a href="https://atproto-browser.vercel.app/at/${r.post.uri.replace("at://","")}" title="https://atproto-browser.vercel.app/at/${r.post.uri.replace("at://","")}" >${categorizeUrl(url)}</a>
        </div>
        <div class="grid-item">
          <a href="${bskyUrl}" title="${bskyUrl}">${hours}:${minutes < 10 ? '0' : ''}${minutes}</a>
        </div>
      </div>
    `;
  }
}

function categorizeUrl(url) {
  let domain = url.split('/')[2];
  if (domain.startsWith("www.")) {
    domain = domain.substring(4);
  }
  return domain; 
}

function renderPrettyDate(dt) {
  const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = new Intl.DateTimeFormat('en-US', options).format(dt);
  return formattedDate;
}