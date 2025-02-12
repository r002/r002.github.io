const quoteBank = [
    {
        id: 6,
        quote: "Don’t ask what the world needs. Ask what makes you come alive, and go do it. Because what the world needs is people who have come alive.",
        author: "Howard Thurman",
        source: "https://www.goodreads.com/quotes/6273-don-t-ask-what-the-world-needs-ask-what-makes-you",
        dt: "2025-02-11"
    },
    {
        id: 5,
        quote: "The mass of men lead lives of quiet desperation.",
        author: "Henry David Thoreau",
        source: "https://www.goodreads.com/quotes/8202-the-mass-of-men-lead-lives-of-quiet-desperation-what",
        dt: "2025-02-11"
    },
    {
        id: 4,
        quote: "People will forget what you said, people will forget what you did, but people will never forget how you made them feel.",
        author: "Maya Angelou",
        source: "https://www.goodreads.com/quotes/5934-i-ve-learned-that-people-will-forget-what-you-said-people",
        dt: "2025-02-11"
    },
    {
        id: 3,
        quote: "The days are long, but the years are short.",
        author: "Gretchen Rubin",
        source: "https://gretchenrubin.com/2017/01/secret-of-adulthood-the-days-are-long-but-the-years-are-short/",
        dt: "2025-02-04"
    },
    {
        id: 2,
        quote: "In the long run we are all dead.",
        author: "John Maynard Keynes",
        source: "https://www.historytoday.com/keynes-long-run",
        dt: "2025-02-03"
    },
    {
        id: 1,
        quote: "The History of the world is but the Biography of great men.",
        author: "Thomas Carlyle",
        source: "https://en.wikipedia.org/wiki/Great_man_theory",
        dt: "2025-02-03"
    }
]

function getRandomQuote() {
    const randomNumber = Math.floor(Math.random() * quoteBank.length);
    return quoteBank[randomNumber];
}

const q = getRandomQuote();
document.getElementById("quotebar").innerHTML = `"${q.quote}" — ${q.author}`;