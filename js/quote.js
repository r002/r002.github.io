const quoteBank = [
    {
        id: 6,
        quote: "Human beings are born with different capacities. If they are free, they are not equal. And if they are equal, they are not free.",
        author: "Aleksandr Solzhenitsyn",
        source: "https://www.goodreads.com/quotes/7563989-human-beings-are-born-with-different-capacities-if-they-are",
        dt: "2025-02-23"
    },
    {
        id: 5,
        quote: "Don’t ask what the world needs. Ask what makes you come alive, and go do it. Because what the world needs is people who have come alive.",
        author: "Howard Thurman",
        source: "https://www.goodreads.com/quotes/6273-don-t-ask-what-the-world-needs-ask-what-makes-you",
        dt: "2025-02-11"
    },
    {
        id: 4,
        quote: "The mass of men lead lives of quiet desperation.",
        author: "Henry David Thoreau",
        source: "https://www.goodreads.com/quotes/8202-the-mass-of-men-lead-lives-of-quiet-desperation-what",
        dt: "2025-02-11"
    },
    {
        id: 3,
        quote: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
        author: "Maya Angelou",
        source: "https://www.goodreads.com/quotes/5934-i-ve-learned-that-people-will-forget-what-you-said-people",
        dt: "2025-02-11"
    },
    {
        id: 2,
        quote: "The days are long, but the years are short.",
        author: "Gretchen Rubin",
        source: "https://gretchenrubin.com/2017/01/secret-of-adulthood-the-days-are-long-but-the-years-are-short/",
        dt: "2025-02-04"
    },
    {
        id: 1,
        quote: "In the long run we are all dead.",
        author: "John Maynard Keynes",
        source: "https://www.historytoday.com/keynes-long-run",
        dt: "2025-02-03"
    },
    {
        id: 0,
        quote: "The History of the world is but the Biography of great men.",
        author: "Thomas Carlyle",
        source: "https://en.wikipedia.org/wiki/Great_man_theory",
        dt: "2025-02-03"
    }
]

function getRandomQuote() {
    const randomNumber = Math.floor(Math.random() * quoteBank.length);

    // Check to see if random quote has already been displayed
    // If so, get a new random number
    const ss = new Set(JSON.parse(localStorage.getItem("quotes")));
    if (ss.has(randomNumber)) {
        return getRandomQuote();
    } else {
        ss.add(randomNumber);
        localStorage.setItem("quotes", JSON.stringify(Array.from(ss)));
    }

    // Reset the set if all quotes have been displayed
    if (ss.size === quoteBank.length) {
        localStorage.removeItem("quotes");
    }

    return quoteBank.slice().reverse()[randomNumber];
}

const q = getRandomQuote();
document.getElementById("quotebar").innerHTML = `"${q.quote}" — ${q.author}`;