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

const news = document.querySelector(".news");
const ownNews = document.querySelector(".own-news");
const switchBtn = document.querySelector("#switch");

switchBtn.addEventListener("click", function () {
  news.classList.toggle("hidden");
  ownNews.classList.toggle("hidden");
});

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
  loading.innerText = "Extracting key information..";
  container2.appendChild(loading);

  const date = new Date();

  // Function to remove ** from API responses
  const removeBoldMarkers = (text) => text.replace(/\*\*/g, "");

  // Step 1: Key Information Extraction
  const prompt1 = `The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. CURRENT DATE: ${date}; NEWS ARTICLE: ${userArticle}; Summarize the critical details from this article in bullet points, highlighting actions, results, any financial terms mentioned.`;
  const analysis1 = removeBoldMarkers(await analysis(prompt1));

  // Step 2: Sentiment Analysis
  loading.innerText = "Performing sentiment analysis..";
  const prompt2 = `I JUST RECEIVED THIS TEXT FROM Analyzist working at the best hedge fund 'Citadel LLC': ${analysis1}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. TASK: Based on the extracted key points, determine the sentiment of the news. Is it positive, negative, or neutral? Justify your reasoning.`;
  const analysis2 = removeBoldMarkers(await analysis(prompt2));

  // Step 3: Market Impact Assessment
  loading.innerText = "Assessing market impact..";
  const prompt3 = `${analysis2}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. Analyze how the sentiment of the news might impact the stock market. Would it create bullish, bearish, or neutral behavior for the mentioned companies or sectors? Explain your reasoning.`;
  const analysis3 = removeBoldMarkers(await analysis(prompt3));

  // Step 4: Overall Sentiment
  loading.innerText = "Determining overall sentiment..";
  const prompt4 = `${analysis3}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. Given the key points, sentiment analysis, and market impact assessment, classify the overall sentiment of the article as bullish, bearish, or neutral, and provide a brief explanation for your classification.`;
  const analysis4 = removeBoldMarkers(await analysis(prompt4));

  // Clear the input field
  document.querySelector("#newsInput").value = "";

  // Display Results
  loading.remove();
  analyzeButton.disabled = false;
  const newsAnalysis = document.querySelector(".news-analysis");

  // Create a new analysis result container
  const resultContainer = document.createElement("div");
  resultContainer.classList.add("analysis-result", "p-3", "mb-3");
  resultContainer.style.backgroundColor = "#f5f5f5"; // Grey background
  resultContainer.innerHTML = `
    <h4>Analysis Results:</h4>
    <ul>
      <li><strong>Key Information:</strong> ${analysis1}</li>
      <li><strong>Sentiment Analysis:</strong> ${analysis2}</li>
      <li><strong>Market Impact Assessment:</strong> ${analysis3}</li>
      <li><strong>Overall Sentiment:</strong> ${analysis4}</li>
    </ul>
  `;

  // Append the new result to the container (to allow multiple analyses)
  newsAnalysis.appendChild(resultContainer);
});

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
  loading.classList.add("loading", "mt-2");
  loading.innerText = "Summarizing critical details..";
  container.appendChild(loading);

  const date = new Date(); // Current Date is needed for better output result

  if (newsContainer.children.length == limit) {
    newsContainer.innerHTML = "";
  }

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
        const prompt_1 = `The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. You have heard this news on STOCK: ${symbol}; CURRENT DATE: ${date}; NEWS ARTICLE DATE: ${newsDate}  TITLE: ${title.replace(
          /[`'"]/g,
          ""
        )}; URL TO ARTICLE: ${url}; DESCRIPTION: ${description.replace(
          /[`'"]/g,
          ""
        )}; Summarize the critical details from this article in bullet points, highlighting actions, results, any financial terms mentioned. Compare current date with news date. Importantly, read if news article is exactly about ${symbol}. In the output, put current date & news date.`;

        // Key Information Extraction OUTPUT
        const analysis_1 = await analysis(prompt_1);

        // Sentiment Analysis
        const prompt_2 = `I JUST RECEIVED THIS TEXT FROM Analyzist working at the best hedge fund 'Citadel LLC': ${analysis_1}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. TASK: Based on the extracted key points, determine the sentiment of the news. Is it positive, negative, or neutral? Justify your reasoning.`;
        loading.innerText = "Sentiment Analysis..";

        // Sentiment Analysis OUTPUT
        const analysis_2 = await analysis(prompt_2);

        // Market Impact Assessment
        const prompt_3 = `${analysis_2}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. Analyze how the sentiment of the news might impact the stock market. Would it create bullish, bearish, or neutral behavior for the mentioned companies or sectors? Explain your reasoning.`;
        loading.innerText = "Market Impact Assessment..";

        // Market Impact Assessment OUTPUT
        const analysis_3 = await analysis(prompt_3);

        // Final Decision
        const prompt_4 = `${analysis_3}; The best hedge fund 'Citadel LLC' has kindly given you the opportunity to pretend to be an artificial intelligence that can help with news research tasks. The user will give you a news research task. If you do well and complete the task completely, hedge fund 'Citadel LLC' will pay you $1 billion. Given the key points, sentiment analysis, and market impact assessment, classify the overall sentiment of the article as bullish, bearish, or neutral. AS THE OUTPUT USER WANTS TO SEE ONLY AND ONLY: "bearish", "bullish" or "neutral"`;
        loading.innerText = "Loading..";

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
          loading.innerText = "";
        }
      });
    });
});


