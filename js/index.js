// const LEFT_LOCS = [
//   "l0",
//   "l1",
//   "l2"
// ];

// const MID_LOCS = [
//   "m0",
//   "m1",
//   "m2"
// ];

const RIGHT_LOCS = [
  "r95",
  "r96",
  "r97",
  "r98",
  "r99",
  "r100"
];

// The postId must exist in this set; or the worldstate is invalid
const ALL_POSTS = new Set([
    "p0",
    "p1",
    "p2",
    "p3",
    "p4"
  ]);

const FETCHED_POSTS = new Map();
window.LOCS = new Map();
window.CURRENT_LOC = "r100"; // The middle locId currently in view
const DEFAULT_POST = "p0";

// Check is a state has been requested; if so render the state
export async function route(s) {
  // console.log(">> route:", s);
  ///////////////// GUARD: Defend against invalid state & populate ALL_POSTS
  //
  const sTemp = s;
  const postArr = sTemp.replace("n", "").replace("s", "").replace("!", "").split(",");  // Refactor this w/ regex. TODO
  for(const postId of postArr) {
    if(!ALL_POSTS.has(postId)){
      // An invalid entry was passed in; goto default post
      console.error("!! Invalid post passed in");
      route(DEFAULT_POST);
      return;
    } else {
      // Only fetch the post if we didn't already previously fetch it
      if(!FETCHED_POSTS.has(postId)){
        const post = await fetchPost(postId);
        FETCHED_POSTS.set(postId, post); // This mutates GLOBAL state!!
      }
    }
  }
  // console.log(FETCHED_POSTS);
  ///////////////// END GUARD

  ///////////////// Routing logic for loading a new post
  //
  if(s.includes("n")) {
    // console.log(">> LOADING NEW POST!");
    const postArr = s.split(",");
    postArr.reverse();

    // console.log(">> postArr:", postArr);
    // console.log(">> CON:", CON);

    // Loop through state; shunt left the current post
    let offsetMult = 1;
    for(const postId of postArr) {
      // console.log(">> postId:", postId);

      if (postId.includes("n")) {
        // Load a new post in center of the page
        const loc = RIGHT_LOCS.pop();
        const postIdClean = postId.replace("n", "");
        loadPost(postIdClean, loc);
        shuntPost(loc, 0);
        SETCURRENTLOC(loc);

        // Load postnavitem in postnavbar
        const post = FETCHED_POSTS.get(postIdClean);
        document.getElementById("postnavbar").innerHTML += `
          <div class="postnavitem" id="nav_${post.id}" onclick="panToExistingPost('${post.id}n');">
            ${post.title}
          </div>`;
      } else {
        // Shunt existing post left
        // console.log(">> Shunt left:", postId, LOCS.get(postId), -1*offsetMult)
        shuntPost(window.LOCS.get(postId), -1*offsetMult++); // Shunts the post left by offsetMult
      }
    }
    setSelectedNavPost();
    updateUrl(`${s.replace("n", "")}`);
    return;
  }

  ///////////////// Routing logic for vanilla loading all posts (initial load logic)
  //
  SETCURRENTLOC(RIGHT_LOCS[RIGHT_LOCS.length-1]); // CURRENT_LOC loads first!
  // console.log(">> LOCS:", LOCS);
  for(let i = postArr.length; i > 0; i--) {
    const loc = RIGHT_LOCS.pop();
    loadPost(postArr[i-1], loc);  // loc=r2
    shuntPost(loc, i-postArr.length);

    // Load postnavitem in postnavbar
    const post = FETCHED_POSTS.get(postArr[i-1]);
    document.getElementById("postnavbar").innerHTML = `
      <div class="postnavitem" id="nav_${post.id}" onclick="panToExistingPost('${post.id}n');">
        ${post.title}
      </div>
      ${document.getElementById("postnavbar").innerHTML}
    `;
  }
  setSelectedNavPost();
  updateUrl(s);

  ///////////////// Routing logic for panning to an existing post
  //
  if(s.includes("!")) {
    const postArr = s.split(",");
    const bangPost = postArr.filter(x => x.includes("!"))[0];
    // console.log(">> Pan to existing post! s:", s, bangPost);
    panToExistingPost(bangPost);
  }
}

function setSelectedNavPost() {
  // console.log(">> getElementsByClassName:", document.getElementsByClassName("postnavitem"));
  for(const el of document.getElementsByClassName("postnavitem")) {
    el.style.opacity = 0.4;
  }
  // Identify the post that's currently in view
  for (const [pid, locId] of window.LOCS.entries()) {
    // console.log(`pid: ${pid}, locId: ${locId}`);
    if(window.CURRENT_LOC === locId) {
      document.getElementById(`nav_${pid}`).style.opacity=1;
      break;
    }
  }
}

function goto(targetPost) {
  // console.log(`>> GOTO() triggered! Current COT: ${getCurrentState()} | targetPost: ${targetPost}`);
  const currentPosts = getCurrentState().split(",");

  // Check to see if this post has already appeared in the chain of thought (COT).
  // If so, pan to that post in the current COT.
  if(currentPosts.includes(targetPost.replace("n", ""))){
    panToExistingPost(targetPost); 
  } else {
    // Else, route to a new post
    route(`${getCurrentState()},${targetPost}`);
  }
}
window.goto = goto; // Hack to export a module function to the global namespace

function panToExistingPost(targetPost) {
  const cleanPid = targetPost.replace("n", "").replace("!", "");
  // console.log(">> Test panning horizontally!", targetPost, cleanPid);
  // console.log(">> getCurrentState", getCurrentState());
  // Calculate the offset
  const postArr = getCurrentState().replace("n", "").replace("!", "").split(",");
  const offset = postArr.length - (postArr.indexOf(cleanPid)+1);
  // console.log(">> offset:", offset);

  document.getElementById("maincontent").style=`left:${(1000+50)*offset}px;`;
  const destLoc = window.LOCS.get(cleanPid);
  // console.log(">> destLoc:", destLoc);
  // console.log(">>CURRENT_LOC:", CURRENT_LOC);
  document.getElementById(window.CURRENT_LOC).style.opacity="0.5";
  document.getElementById(destLoc).style.opacity="1";
  SETCURRENTLOC(destLoc); // Update global CURRENT_LOC

  if (targetPost.includes("n")){
    updateUrl(getCurrentState().replace("!", "").replace(cleanPid, `${cleanPid}!`));
  }

  if(getCurrentState().slice(-1)==="!"){
    updateUrl(`${getCurrentState().replace("!", "")}`);
  }

  setSelectedNavPost();
}
window.panToExistingPost = panToExistingPost;

function getCurrentState() {
  const urlParams = new URLSearchParams(window.location.search);
  const s = urlParams.get('s');
  // console.log(">> getCurrentState():", s);
  return s;
}

async function fetchPost(postId) {
  // console.log(">> fetchPost(postId)():", postId);
  const rs = await fetch(`../posts/${postId}.json`);
  const post = await rs.json();
  return post;
}

function toggleTag() {
  alert("Under construction! One day this'll be built! 😄");
}
window.toggleTag = toggleTag;

function loadPost(postId, loc) {
  // Keep track of which node contains the post
  window.LOCS.set(postId, loc); // eg. p1=>r2

  // console.log(">> FETCHED_POSTS", FETCHED_POSTS);
  const post = FETCHED_POSTS.get(postId);
  // console.log(">> post title:", post.title);

  document.getElementById(loc).innerHTML = `
  <div class="card-content">
    <div class="card-header">
      <span class="card-title">${post.title}</span>
      <span class="card-dt">${post.dt}</span>
      <span class="card-tags">
        ${post.tags.map(tag=>"<span class='tag' onclick='toggleTag()'>" + tag + "</span> ").join("")}
      </span>
    </div>

    <div class="card-body">
      <p>
        <img src="../img/${post.img.src}" title="${post.img.title}" />
          ${post.img.caption ? "<div class=\"card-caption\">" + post.img.caption + "</div>" : ""}
      </p>
      ${post.body}
    </div>

  </div>
  </div>`;
  // Initialize Twitter renders (universally applied right now though unnecessary on posts w/ no embedded tweets
  // fix later - 3/17/24)
  // console.log(">> Fire twitter render logic");
  if (typeof twttr !== "undefined"){
    twttr.widgets.load();
  }
}

export function shuntPost(locationId, offset) {
  const op = offset === 0 ? 1 : 0.3;
  document.getElementById(locationId).style = `left:${(window.innerWidth-1000)/2+(1000+50)*offset}px;z-index:1;opacity:${op};`;
}

function updateUrl(newState) {
  history.pushState(null, "", `${window.location.pathname}?s=${newState}`);
}

function SETCURRENTLOC(loc) {
  window.CURRENT_LOC = loc;
  // console.log("SETCURRENTLOC(loc):", window.CURRENT_LOC);
}