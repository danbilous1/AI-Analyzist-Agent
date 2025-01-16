// Your marketaux API token
const token = "";

// Your AI ChatBot API key and link
const AiKey = "";

// For example Gemini AI ChatBot: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=GEMINI_API_KEY"
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
        const prompt = `Imagine you are professional Analyzist working at the best hedge fund 'Citadel LLC'. You have heard this news on STOCK: ${symbol}; TITLE: ${title.replace(
          /[`'"]/g,
          ""
        )}; URL TO ARTICLE: ${url}; DESCRIPTION: ${description.replace(
          /[`'"]/g,
          ""
        )}; HOW THIS WILL IMPACT ON TSLA STOCK? IN THE OUPTPUT I WANT TO SEE ONLY AND ONLY: "bullish", "bearish" or "neutral";`;

        const data = {
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        };

        let analysis = "";

        fetch(AiLink, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then((res) => res.json())
          .then((result) => {
            analysis = result.candidates[0].content.parts[0].text;
          });

        // Create HTML article
            const article = document.createElement("div");
            article.classList.add("w-25");
            article.innerHTML = `
          <h5>${title}</h5>
          <p>${description}</p>
          <p>Impact on stock: ${analysis}</p>
          <p>
            <a
              href="${url}"
              target="_blank"
              >Read more..</a
            >
          </p>
          <p class="news-date mb-0">${formattedDate}</p>
        `;
            newsContainer.appendChild(article);
      });
    });
});
