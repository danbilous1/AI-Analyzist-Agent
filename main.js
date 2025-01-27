// Your marketaux API token
const token = "";

// Your Gemini API key
const AiKey = "";

// Gemini API Link
const AiLink = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AiKey}`;

// News articles limit; Free Version Limit is 3;
const limit = 3;

const container = document.querySelector(".container");
const newsContainer = document.querySelector(".news-container");
const searchBtn = document.querySelector("#searchButton");
const ticker = document.querySelector("#tickerInput");

// Function for Tree of Thoughts System
async function analysis(input) {
  try {
    const response = await fetch(AiLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: input }],
          },
        ],
      }),
    });
    const result = await response.json();
    const analysisResult = result.candidates[0]?.content?.parts[0]?.text;
    return analysisResult;
  } catch (error) {
    console.error("Error during analysis:", error);
    return null; // Return null or handle error as needed
  }
}

searchBtn.addEventListener("click", function () {
  const loading = document.createElement("p");
  loading.innerText = "Loading..";
  container.appendChild(loading);

  fetch(
    `https://api.marketaux.com/v1/news/all?symbols=${ticker.value}&filter_entities=true&language=en&api_token=${token}&limit=${limit}`
  )
    .then((response) => response.json())
    .then((data) => {
      let processedCount = 0; // Counter to track processed items

      data.data.forEach(async (item) => {
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

        // Tree of Thoughts system

        // Key Information Extraction
        const prompt_1 = `Imagine you are professional Analyzist working at the best hedge fund 'Citadel LLC'. You have heard this news on STOCK: ${symbol}; TITLE: ${title.replace(
          /[`'"]/g,
          ""
        )}; URL TO ARTICLE: ${url}; DESCRIPTION: ${description.replace(
          /[`'"]/g,
          ""
        )}; Summarize the critical details from this article in bullet points, highlighting actions, results, and any financial terms mentioned. Sort, what is important or less important`;

        // Key Information Extraction OUTPUT
        const analysis_1 = await analysis(prompt_1);

        // Sentiment Analysis
        const prompt_2 = `I JUST RECEIVED THIS TEXT FROM Analyzist working at the best hedge fund 'Citadel LLC': ${analysis_1}; Based on the extracted key points, determine the sentiment of the news. Is it positive, negative, or neutral? Justify your reasoning.`;

        // Sentiment Analysis OUTPUT
        const analysis_2 = await analysis(prompt_2);

        // Market Impact Assessment
        const prompt_3 = `${analysis_2}; Imagine you are professional Analyzist working at the best hedge fund 'Citadel LLC' with 10+ years of experience. Analyze how the sentiment of the news might impact the stock market. Would it create bullish, bearish, or neutral behavior for the mentioned companies or sectors? Explain your reasoning.`;

        // Market Impact Assessment OUTPUT
        const analysis_3 = await analysis(prompt_3);

        // Final Decision
        const prompt_4 = `${analysis_3}; Given the key points, sentiment analysis, and market impact assessment, classify the overall sentiment of the article as bullish, bearish, or neutral. IN THE OUTPUT I WANT TO SEE ONLY AND ONLY: "bearish", "bullish" or "neutral"`;

        // Final Decision OUTPUT
        const analysis_4 = await analysis(prompt_4);

        // Create HTML article
        const article = document.createElement("div");
        article.classList.add("w-25");
        article.innerHTML = `
          <h5>${title}</h5>
          <p>${description}</p>
          <p>Impact on stock: ${analysis_4}</p>
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

        // Increment the processed count
        processedCount++;

        if (processedCount === limit) {
          console.log("check check check");
          loading.innerText = "";
        }
      });
    });
});

