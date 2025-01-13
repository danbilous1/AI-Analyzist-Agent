// Your marketaux API token
const token = "";

// Your AI ChatBot API key and link
const AiKey = "";

// For example Gemini AI ChatBot
const AiLink = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AiKey}`;

// News articles limit
const limit = 3;

const newsContainer = document.querySelector(".news-container");
const searchBtn = document.querySelector("#searchButton");
const ticker = document.querySelector("#tickerInput");

searchBtn.addEventListener("click", function () {
  fetch(
    `https://api.marketaux.com/v1/news/all?symbols=${ticker.value}&filter_entities=true&language=en&api_token=${token}&limit=${limit}`
  )
    .then((response) => response.json())
    .then((data) => {
      data.data.forEach((item) => {
        const title = item.title;
        const description = item.description;
        const url = item.url;
        const symbol = item.entities[0]?.symbol;

        // Extract and format the date
        const publishedDate = new Date(item.published_at);
        const formattedDate = publishedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        });

        // Give data to AI Analyzist

        // Create HTML article
      });
    });
});
