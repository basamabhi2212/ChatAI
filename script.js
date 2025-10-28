const API_KEY = "AIzaSyBnRZZ7XVr6VkCmSYuY29wDf1Ne5koFes4"; // replace with your key

document.getElementById("generateBtn").addEventListener("click", async () => {
  const prompt = document.getElementById("prompt").value;
  const outputDiv = document.getElementById("output");

  if (!prompt) {
    outputDiv.textContent = "Please enter a video idea.";
    return;
  }

  outputDiv.textContent = "Generating video idea... ⏳";

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `Create a short video idea and script for: ${prompt}` }] }],
        }),
      }
    );

    const data = await response.json();
    const result = data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response.";
    outputDiv.textContent = result;

  } catch (error) {
    outputDiv.textContent = "Error: " + error.message;
  }
});
