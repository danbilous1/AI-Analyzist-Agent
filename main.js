// API Keys and Constants
const token = ""; // Marketaux API token
const AiKey = ""; // Gemini API key
const AiLink = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${AiKey}`; // Gemini API endpoint
const limit = 3; // Marketaux free version article limit

// DOM Elements
const container = document.querySelector(".container");
const container2 = document.querySelector(".container2");
const newsContainer = document.querySelector(".news-container");
const searchBtn = document.querySelector("#searchButton");
const ticker = document.querySelector("#tickerInput");
const news = document.querySelector(".news");
const ownNews = document.querySelector(".own-news");
const analyzeButton = document.querySelector("#analyzeButton");
const switchBtn = document.querySelector("#switch");

// Toggle between Stock News and Own Article sections
switchBtn.addEventListener("click", function () {
  news.classList.toggle("hidden");
  ownNews.classList.toggle("hidden");
  switchBtn.innerText =
    switchBtn.innerText === "Analyze Your Own Article"
      ? "Analyze Stock News Article"
      : "Analyze Your Own Article";
});

async function analysis(input) {
  try {
    const response = await fetch(AiLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: input }] }],
      }),
    });
    const result = await response.json();
    return result.candidates[0]?.content?.parts[0]?.text || "Analysis failed.";
  } catch (error) {
    console.error("Error during analysis:", error);
    return "Error occurred during analysis.";
  }
}

// Analyze Your Own Article
analyzeButton.addEventListener("click", async function () {
  const userArticle = document.querySelector("#newsInput").value;
  if (!userArticle) {
    alert("Please enter a news article.");
    return;
  }

  analyzeButton.disabled = true;
  const loading = document.createElement("p");
  loading.classList.add("loading", "mt-2");
  loading.innerText = "Analyzing article..";
  container2.appendChild(loading);

  const date = new Date();

  // Clean text by removing asterisks
  const cleanText = (text) => text.replace(/\*\*/g, "").replace(/\*/g, "");

  // Step 1: Key Information (not displayed)
  const prompt1 = `CURRENT DATE: ${date}; NEWS ARTICLE: ${userArticle}; Summarize the critical details from this article in bullet points, highlighting actions, results, any financial terms mentioned.`;
  const analysis1 = cleanText(await analysis(prompt1));

  // Step 2: Sentiment Analysis (concise)
  loading.innerText = "Performing sentiment analysis..";
  const prompt2 = `${analysis1}; TASK: Determine the sentiment of the news: positive, negative, or neutral. Provide a one-sentence justification.`;
  const analysis2 = cleanText(await analysis(prompt2));

  // Step 3: Market Impact Assessment (concise)
  loading.innerText = "Assessing market impact..";
  const prompt3 = `${analysis2}; Analyze the potential market impact in one sentence: would it be bullish, bearish, or neutral for the stock market?`;
  const analysis3 = cleanText(await analysis(prompt3));

  // Step 4: Overall Sentiment (specific phrase)
  loading.innerText = "Determining overall sentiment..";
  const prompt4 = `${analysis3}; Based on the analysis, state only: 'The overall sentiment of the article is [sentiment].' where [sentiment] is bearish, bullish, or neutral.`;
  const analysis4 = cleanText(await analysis(prompt4));

  // Clear input field
  document.querySelector("#newsInput").value = "";

  // Display Results
  loading.remove();
  analyzeButton.disabled = false;
  const newsAnalysis = document.querySelector(".news-analysis");

  const resultContainer = document.createElement("div");
  resultContainer.classList.add("analysis-result");
  resultContainer.innerHTML = `
    <h4 class="sentiment">${analysis4}</h4>
    <ul class="details">
      <li><strong>Sentiment Analysis:</strong> ${analysis2}</li>
      <li><strong>Market Impact Assessment:</strong> ${analysis3}</li>
    </ul>
  `;

  newsAnalysis.appendChild(resultContainer);
});

// Analyze Stock News Articles
searchBtn.addEventListener("click", async function () {
  const loading = document.createElement("p");
  loading.classList.add("loading", "mt-2");
  loading.innerText = "Summarizing critical details..";
  container.appendChild(loading);

  newsContainer.innerHTML = ""; // Clear previous results
  const date = new Date();

  try {
    const response = await fetch(
      `https://api.marketaux.com/v1/news/all?symbols=${ticker.value}&filter_entities=true&language=en&api_token=${token}&limit=${limit}`
    );
    const data = await response.json();
    let processedCount = 0;

    for (const item of data.data) {
      const title = item.title;
      const description = item.description;
      const url = item.url;
      const symbol = item.entities[0]?.symbol;
      const newsDate = item.published_at;
      const formattedDate = new Date(newsDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Step 1: Key Information Extraction
      const prompt1 = `You have heard this news on STOCK: ${symbol}; CURRENT DATE: ${date}; NEWS ARTICLE DATE: ${newsDate}  TITLE: ${title.replace(
        /[`'"]/g,
        ""
      )}; URL TO ARTICLE: ${url}; DESCRIPTION: ${description.replace(
        /[`'"]/g,
        ""
      )}; Summarize the critical details from this article in bullet points, highlighting actions, results, any financial terms mentioned. Compare current date with news date. Importantly, read if news article is exactly about ${symbol}. In the output, put current date & news date.`;
      const analysis1 = await analysis(prompt1);

      // Step 2: Sentiment Analysis
      loading.innerText = "Sentiment Analysis..";
      const prompt2 = `${analysis1}; TASK: Based on the extracted key points, determine the sentiment of the news. Is it positive, negative, or neutral? Justify your reasoning.`;
      const analysis2 = await analysis(prompt2);

      // Step 3: Market Impact Assessment
      loading.innerText = "Market Impact Assessment..";
      const prompt3 = `${analysis2}; Analyze how the sentiment of the news might impact the stock market. Would it create bullish, bearish, or neutral behavior for the mentioned companies or sectors? Explain your reasoning.`;
      const analysis3 = await analysis(prompt3);

      // Step 4: Final Decision
      loading.innerText = "Loading..";
      const prompt4 = `${analysis3}; Given the key points, sentiment analysis, and market impact assessment, classify the overall sentiment of the article as bullish, bearish, or neutral. AS THE OUTPUT USER WANTS TO SEE ONLY AND ONLY: "bearish", "bullish" or "neutral"`;
      const analysis4 = await analysis(prompt4);

      // Display Article
      const article = document.createElement("div");
      article.classList.add("w-25");
      article.innerHTML = `
        <h5>${title}</h5>
        <p>${description}</p>
        <p>Impact on stock: ${analysis4}</p>
        <p><a href="${url}" target="_blank">Read more..</a></p>
        <p class="news-date mb-0">${formattedDate}</p>
      `;
      newsContainer.appendChild(article);

      processedCount++;
      if (processedCount === limit) loading.remove();
    }
  } catch (error) {
    console.error("Error fetching stock news:", error);
    loading.innerText = "Error fetching news.";
  }
});
