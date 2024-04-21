# XNA: "Help your people find you" 🧬
### Wednesday - April 10, 2024
**Motivation:** I humbly submit that humanity has not quite yet figured out how best to leverage social tech **`to help people connect and build genuine human relationships`**. We have at our fingertips the power to reach any other human being in the world ***instantly*** on demand! And we've developed technology that can help us sift through oceans of data and classify at **hyper-granuality** a person's interests and a tweet's contents.

And yet— with all this marvel and wonder, all we've done is monetize UGC by promoting clickbait that makes people the ***angriest?*** Whatever fodder that riles up people the most for ad views? ***Seriously?!*** 🤔

**`XNA`** is my attempt to introduce **`better legibility for social media` in the spirit of `building genuine human connections` over `shared interests and values`**. (Here, I've started with X but this can theoretically be similarly applied to Bluesky or any other social media platform.)

**`XNA`** is a free and simple dashboard that helps organize a person's tweets for easy browsing. At a glance, easily see all of the different people who've inspired a thought, tweets by date, and also keyword search.

Using **`XNA`**, see who you've interacted with most frequently and what topics seem to organically bubble up often in your mind. (And if you're a data-nerd, you can easily see in-aggregate exactly where all those hours you've spent tweeting have gone! 🙂)

Currently, I generally tweet once a day so **`XNA`** is built for that use case. It's still a WIP but as always, please fork/remix/reuse!! My hope is that people will start leveraging **social tech** to better connect with others who share your values. **Better organize your tweets to *help your people find you*.**

**

# An Ode to Tweeting Every Day 💬
### Saturday - April 6, 2024
As I've previously written, [I resolved on Jan 1, 2024 to make 2024 my year of connection](https://r002.github.io/maze?s=p0,p1,p2,p3). For years I'd always toiled away in private. With only rare exception, I'd been shy about my work, never really posting much at all publicly.

But discovering X in December 2023 honestly blew my mind. So many fascinating people on the internet! So many new topics to learn about every single day! I dug into the [learn in public mindset](https://twitter.com/robert_gpt/status/1743505266031612090) and was instantly sold.

So since [Jan 1](https://twitter.com/robert_gpt/status/1742031082495549650), for every single day in 2024, I've been tweeting publicly. At the time of this writing, I've tweeted 97 consecutive days. Some people write daily affirmations or pray every evening. I basically treat tweeting the same way. (I also think of it as **`community service`** too; I am [putting out vibes into the world of what I wish for the world to be!](https://twitter.com/robert_gpt/status/1744922931325534531)) To be sure, tweeting's not always easy, but like any habit, it gets easier the more you do it.

The simplest way for strangers on the internet to get to know you is by reading your tweets. So for the last 97 days, I've put forth little bits about myself every single day. They're not all profound, mind you. I've tweeted about my [favorite book of 2023](https://twitter.com/robert_gpt/status/1776015001842557037), my [favorite movie of all time](https://twitter.com/robert_gpt/status/1745614186271351199), a current [TV series I'm enamored with](https://twitter.com/robert_gpt/status/1775640957179789715), and [thoughts I had about a car accident](https://twitter.com/robert_gpt/status/1761759996688077175) I was unfortunately in last November. Sadly, [I won't be having children](https://r002.github.io/maze?s=p0) so these tweets will likely be all I leave behind once I go.

In the short time we're all here on earth together, I encourage everyone to be open, reach out, and connect with others. You gain nothing by walling yourself off from the world and marvelous wonders await if you'll just put yourself out there. [**Help your people find you.**](https://twitter.com/robert_gpt/status/1754336981226492387)

**

# Robert's Curiosity Maze 🙋‍♂️
### Monday - March 18, 2024
Back in December of 2023, I started using X for the first time and was blown away. I [discovered Maggie](https://twitter.com/robert_gpt/status/1743260664020279427) and reading through her astoundingly phenomenal site put me in such **an immense state of shame** re my own sad and pitiful personal site and writings that I immediately unlinked to all my stuff everywhere I could and set upon revamping my small corner of the internet.

I was already [familiar with Amelia](https://github.com/githubocto/repo-visualizer-demo/issues/1) from back in 2021 when I was doing more GitHub stuff and had at some point found [Andy's post about **"working with the garage door up"**](https://notes.andymatuschak.org/About_these_notes?stackedNotes=z21cgR9K3UcQ5a7yPsj2RUim3oM2TzdBByZu&stackedNotes=z7UeGpBpsZFWDmUq6VQgcB4TDfCUgxgXNuMvM) and [peripheral vision](https://twitter.com/robert_gpt/status/1743505268124594527).

Finally, I'd also found Anne-Laure on X. I consider myself a pretty curious person (which is sadly also one big reason my career has gone largely nowhere, alas 😭) but Anne-Laure may be the **only person on the internet** who is even ***more*** curious than I am. Literally, I'm pretty sure, every tweet I see from her is about curiosity! Every one! (And I've ❤'d them all!)

So anyway, for my new personal site, I wanted to build something that would capture [Amelia's infinite canvas idea](https://wattenberger.com/thoughts/evolving-the-infinite-canvas) with Andy's `path-dependency`/`peripheral vision idea` with Anne-Laure's general `"just-follow-your-curiosity"` idea and this **`"Curiosity Maze"`** is what I've come up with! 🤗

You still can't pan vertically yet, nor zoom in and out, but I think I have the fundamentals figured out. [Inspired by how Maggie made her own personal site public](https://github.com/MaggieAppleton/maggieappleton.com-V2/blob/main/README.md), I've also gone ahead and done the same! Feel free to remix/reuse! 👍

A huge thanks to Maggie, Amelia, Anne-Laure, and Andy for being who you guys are and doing what you do! 🙏 I don't know you (and you guys don't know me) but I love how we live in an age where total strangers can connect with each other's work ***across space and time*** and have these weird asymmetrical relationships. You guys have no idea who I am but I've been hugely inspired by your work!! Thank you for sharing so generously with complete strangers on the internet!! 💙

Onward and upward!! Accelerate!! 🌎🚀✨

**

## TODO
- [ ] research `blueskey` and `x` apis for posting
  - [ ] build a central GUI that posts to both simultaneously?
  - [ ] research how to bring `analytics counts` to `bluesky` (see how many impressions/clicks each post got)
- [ ] scrolling should only scroll the `Tweet Timestream` center pane
- [ ] index all tweet titles in the database so they can be searched
- [ ] strip all punctuation when indexing dbs
- [ ] build chrome ext that extracts & transforms a tweet's text, ppl, & ref links into json
- [ ] build "life meter" - display how much of my life has passed (use "4,000 weeks" as range)
- [ ] write a preprocessor that scans `x.json` & reports discrepancies w/ `media.json`, `orgs.json`, and `/pfp`
- [ ] build `wheel` page
  - [ ] track every week's pick
  - [ ] build histogram of everyone's who's been picked
- [x] add `bad movie club` section
- [x] code a script to automatically push `x.json` and `new pfps` to GitHub
- [x] revamp the `calendar` sidebar -> display all days in the year & always center current week
- [x] separate `people`, `organizations`, `media` sections
- [x] enhance tooltips for day boxes & tweet titles
- [x] add `changelog` - source changelog from `json` file
- [x] finish indexing all people in the database so they can be searched
- [x] display `(count)` next to `Tweet Timestream`
- [x] when mousing over `tweets` and `day boxes`, show the full date in the `title` mouseover

**

## Stack
- Vanilla `HTML`, `JS`, `CSS` (as God intended)
- Deliberately no webpack and minification so you can `view-source`!

## How to run
```
$> browser-sync start --server '.' --files '.'
```

### References
- https://browsersync.io/docs/command-line