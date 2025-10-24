// --- 1. MOCK DATA/CONSTANTS ---

// NOTE: In a real implementation, this list should be extensive and external.
const ALL_NSE_BSE_STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBank', 'ICICIBANK', 'INFY', 'HUL', 'SBIN', 'ITC', 
    'KOTAKBANK', 'LT', 'BHARTIARTL', 'ASIANPAINT', 'BAJFINANCE', 'ADANIENT', 
    'NESTLEIND', 'TITAN', 'M&M', 'SUNPHARMA', 'AXISBANK', 'NTPC'
];

let selectedStocks = []; // To store the 10 randomly picked stocks
let stockAnalysisData = []; // To store the analysis results (for saving/search)

// --- 2. CORE FUNCTIONS ---

document.getElementById('runButton').addEventListener('click', runStockPicker);
document.getElementById('generateButton').addEventListener('click', generateAnalysis);

/**
 * Executes the stock picking process: 10-second wait and random selection.
 */
function runStockPicker() {
    const runBtn = document.getElementById('runButton');
    const loading = document.getElementById('loadingSpinner');
    const stocksDiv = document.getElementById('selectedStocks');
    const generateBtn = document.getElementById('generateButton');

    runBtn.disabled = true;
    runBtn.textContent = 'Running...';
    loading.style.display = 'inline-block';
    stocksDiv.innerHTML = '';
    generateBtn.style.display = 'none';
    selectedStocks = []; // Reset list

    // Step 1: 10-second delay simulation
    setTimeout(() => {
        // Step 2: Pick 10 unique random stocks
        let tempStocks = [...ALL_NSE_BSE_STOCKS];
        for (let i = 0; i < 10; i++) {
            if (tempStocks.length === 0) break;
            const randomIndex = Math.floor(Math.random() * tempStocks.length);
            const stock = tempStocks.splice(randomIndex, 1)[0];
            selectedStocks.push(stock);
        }

        // Step 3: Display the selected stocks
        displaySelectedStocks(selectedStocks);

        // Step 4: Show the Generate button
        runBtn.textContent = 'Run Again';
        runBtn.disabled = false;
        loading.style.display = 'none';
        generateBtn.style.display = 'block';

    }, 10000); // 10-second delay
}

/**
 * Displays the list of selected stocks on the home page.
 * @param {string[]} stocks - Array of stock names.
 */
function displaySelectedStocks(stocks) {
    const stocksDiv = document.getElementById('selectedStocks');
    let html = '<h3>Selected Stocks for Analysis:</h3><ul>';
    stocks.forEach(stock => {
        html += `<li>${stock}</li>`;
    });
    html += '</ul>';
    stocksDiv.innerHTML = html;
}

/**
 * Triggers the Gemini API calls and report generation.
 * NOTE: This is the critical section requiring a secure backend for API calls.
 */
async function generateAnalysis() {
    const generateBtn = document.getElementById('generateButton');
    const resultsArea = document.getElementById('resultsArea');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating Analysis... (Backend API calls in progress)';
    resultsArea.innerHTML = 'Analyzing stocks. Please wait...';

    const currentTime = new Date().toISOString();

    for (const stock of selectedStocks) {
        // --- !!! CRITICAL GEMINI API INTEGRATION POINT !!! ---
        
        // 1. CALL BACKEND SERVICE TO GET STOCK ANALYSIS (Text & Image)
        // const analysisResult = await fetchAnalysisFromGemini(stock); 
        // Example Mock Response (Developer must replace with actual API call):
        const analysisResult = mockGeminiAnalysis(stock, currentTime);
        
        // 2. SAVE THE DATA DATE-WISE (for search/Stocks Data page)
        stockAnalysisData.push({
            stockName: stock,
            verificationDate: currentTime,
            analysis: analysisResult.text,
            imageUrl: analysisResult.imageUrl 
        });

        // 3. GENERATE THE SEPARATE HTML FILE (e.g., RELIANCE.html)
        // NOTE: Direct client-side file creation/saving is generally not possible/secure.
        // This step requires a server-side process OR dynamic rendering on the client.
        // For a GitHub Pages solution, this means pre-generating or rendering dynamically.
        // The developer should create a function to format the analysisResult into the HTML content.
        console.log(`Generated HTML content for ${stock}.html`);
    }

    // After all stocks are processed
    resultsArea.innerHTML = `
        <h3>Analysis Complete!</h3>
        <p>Reports for ${selectedStocks.length} stocks have been generated and saved.</p>
        <button onclick="downloadReportsZip()">Download 5 Featured Reports (ZIP)</button>
    `;

    // Save the new data to localStorage/backend for the 'Stocks Data' page
    saveStockDataLocally(stockAnalysisData);

    generateBtn.disabled = false;
    generateBtn.textContent = 'Regenerate Analysis';
}

/**
 * Simulates the Gemini API call response (MUST BE REPLACED BY BACKEND CALL).
 */
function mockGeminiAnalysis(stock, time) {
    // This data would come from the Gemini Text Generation API
    const textAnalysis = {
        '1. Is it a buy, hold, or avoid zone?': `Buy zone. Momentum indicators show strong uptrend potential.`,
        '2. Support and resistance levels.': `Support: 2450, 2400. Resistance: 2600, 2650.`,
        '3. Short-term target and stop loss.': `Target: 2620. Stop Loss: 2420.`,
        '4. One-line summary for YouTube narration.': `Why ${stock} is poised for a massive short-term breakout!`,
    };
    
    // This URL would come from the Gemini Image Generation API
    const imageUrl = `mock_image_url_for_${stock}.jpg`;

    return { text: textAnalysis, imageUrl: imageUrl };
}

// --- 3. SEARCH AND DATA MANAGEMENT FUNCTIONS ---

/**
 * Saves the current batch of analyzed stocks (Date-wise) to local storage.
 */
function saveStockDataLocally(newData) {
    // In a production environment, this would hit a database/server.
    // For GitHub Pages, we use localStorage as a simple client-side persistence.
    let existingData = JSON.parse(localStorage.getItem('navaBharathStocks') || '[]');
    // Append new data, potentially overwriting older entries for the same stock
    // A better approach would be to track history, but for simplicity:
    newData.forEach(newItem => {
        const index = existingData.findIndex(item => item.stockName === newItem.stockName);
        if (index > -1) {
            existingData[index] = newItem; // Update
        } else {
            existingData.push(newItem); // Add new
        }
    });

    localStorage.setItem('navaBharathStocks', JSON.stringify(existingData));
}

/**
 * Handles the search functionality in the top-right search bar.
 */
function searchStock() {
    const input = document.getElementById('searchBar');
    const filter = input.value.toUpperCase();
    const savedData = JSON.parse(localStorage.getItem('navaBharathStocks') || '[]');

    const foundStock = savedData.find(item => item.stockName === filter);

    if (foundStock) {
        const date = new Date(foundStock.verificationDate).toLocaleString();
        alert(`Stock: ${foundStock.stockName}\nLast Verified: ${date}\nStatus: ${foundStock.analysis['1. Is it a buy, hold, or avoid zone?']}`);
    } else if (filter.length > 2) {
        // Only show message if the user has typed a potential stock
        // alert(`Stock "${filter}" not found in verification history.`);
    }
}


/**
 * Placeholder for the download functionality (Requires client-side ZIP library or server-side zipping).
 */
function downloadReportsZip() {
    alert("Initiating download of 5 featured stock reports (ZIP file). This requires a JS library (like JSZip) or a server-side endpoint to bundle the generated HTML files.");
    // Developer: Implement JSZip to create and download the zip file containing 
    // the 5 best/latest HTML reports.
}

// NOTE: The 'stocks-data.html' and 'about-us.html' pages need separate files
// or a client-side routing solution to manage the menu bar links correctly.
