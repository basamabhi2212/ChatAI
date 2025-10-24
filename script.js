// --- 1. MOCK DATA/CONSTANTS ---

// Extensive list of Indian stocks for better randomness and uniqueness
const ALL_NSE_BSE_STOCKS = [
    'RELIANCE', 'TCS', 'HDFCBank', 'ICICIBANK', 'INFY', 'HUL', 'SBIN', 'ITC', 
    'KOTAKBANK', 'LT', 'BHARTIARTL', 'ASIANPAINT', 'BAJFINANCE', 'ADANIENT', 
    'NESTLEIND', 'TITAN', 'M&M', 'SUNPHARMA', 'AXISBANK', 'NTPC',
    'TATASTEEL', 'MARUTI', 'HCLTECH', 'TECHM', 'WIPRO', 'POWERGRID', 
    'ONGC', 'GAIL', 'INDUSINDBK', 'ULTRACEMCO', 'BPCL', 'COALINDIA', 
    'HDFCLIFE', 'EICHERMOT', 'GRASIM', 'JSWSTEEL', 'SHREECEM', 'UPL', 'WIPRO'
];

let selectedStocks = []; // To store the 10 randomly picked stocks for the current run
let stockAnalysisData = []; // To store ALL historical analysis results from localStorage

// --- 2. INITIALIZATION AND EVENT LISTENERS ---

document.addEventListener('DOMContentLoaded', () => {
    // Load existing data from localStorage when the page loads
    loadStockDataLocally();
    document.getElementById('runButton').addEventListener('click', runStockPicker);
    document.getElementById('generateButton').addEventListener('click', generateAnalysis);
});


// --- 3. CORE APPLICATION LOGIC ---

/**
 * Executes the stock picking process: 10-second wait and random selection.
 * Ensures the 10 stocks picked in one run are unique (non-repeating).
 */
function runStockPicker() {
    const runBtn = document.getElementById('runButton');
    const loading = document.getElementById('loadingSpinner');
    const stocksDiv = document.getElementById('selectedStocks');
    const generateBtn = document.getElementById('generateButton');

    runBtn.disabled = true;
    runBtn.textContent = 'Analyzing Market Sentiment...';
    loading.style.display = 'inline-block';
    stocksDiv.innerHTML = '';
    generateBtn.style.display = 'none';
    selectedStocks = []; // Reset list for the new run

    // Create a mutable copy of the stock list to select from without repeating
    let availableStocks = [...ALL_NSE_BSE_STOCKS]; 
    const numberOfStocksToPick = 10;

    // Step 1: 10-second delay simulation
    setTimeout(() => {
        // Step 2: Pick 10 unique random stocks
        for (let i = 0; i < numberOfStocksToPick; i++) {
            if (availableStocks.length === 0) break;
            
            // 1. Get a random index
            const randomIndex = Math.floor(Math.random() * availableStocks.length);
            
            // 2. Select the stock and remove it (splice) to ensure no repeat
            const stock = availableStocks.splice(randomIndex, 1)[0];
            
            // 3. Add to the list of selected stocks
            selectedStocks.push(stock);
        }

        // Step 3 & 4: Display and show Generate button
        displaySelectedStocks(selectedStocks);
        runBtn.textContent = 'Run Again';
        runBtn.disabled = false;
        loading.style.display = 'none';
        generateBtn.style.display = 'block';

    }, 10000); // 10-second delay
}

/**
 * Displays the list of selected stocks on the home page.
 */
function displaySelectedStocks(stocks) {
    const stocksDiv = document.getElementById('selectedStocks');
    let html = '<h3>✅ 10 Stocks Selected:</h3><ul>';
    stocks.forEach(stock => {
        html += `<li>${stock}</li>`;
    });
    html += '</ul>';
    stocksDiv.innerHTML = html;
}

/**
 * Triggers the simulated Gemini AI API calls and report generation.
 * NOTE: This is a MOCK implementation for Gemini API calls, as direct calls
 * from client-side JS are insecure and unreliable for stock data.
 */
async function generateAnalysis() {
    const generateBtn = document.getElementById('generateButton');
    const resultsArea = document.getElementById('resultsArea');
    generateBtn.disabled = true;
    generateBtn.textContent = 'Generating Analysis... (Simulating AI)';
    resultsArea.innerHTML = '<p>Processing 10 stocks. This may take a moment...</p>';

    const currentTime = new Date().toISOString();
    let newAnalysis = [];

    // Simulate analysis for each stock
    for (const stock of selectedStocks) {
        // *** MOCK GEMINI API CALL ***
        const analysisResult = mockGeminiAnalysis(stock);
        
        // Generate the full HTML content string
        const htmlContent = createStockHtmlContent(stock, analysisResult.text, currentTime);

        // Store the new data point
        const dataPoint = {
            stockName: stock,
            verificationDate: currentTime,
            analysis: analysisResult.text, // Store analysis object for search result
            htmlContent: htmlContent, // Store HTML content for download
            imageUrl: analysisResult.imageUrl 
        };
        newAnalysis.push(dataPoint);
    }
    
    // Save the new data to localStorage and update the global list
    saveStockDataLocally(newAnalysis);

    // After all stocks are processed
    resultsArea.innerHTML = `
        <h3>🚀 Analysis Complete!</h3>
        <p>AI reports for the 10 selected stocks have been generated.</p>
        <button onclick="downloadReportsZip()">Download 5 Featured Reports (ZIP)</button>
        <p class="disclaimer">Data saved locally in your browser for search.</p>
    `;

    generateBtn.disabled = false;
    generateBtn.textContent = 'Regenerate Analysis';
}

/**
 * Simulates the Gemini API call response based on the PDR prompt.
 */
function mockGeminiAnalysis(stock) {
    // Generate random, believable analysis
    const zones = ['BUY', 'HOLD', 'AVOID'];
    const zone = zones[Math.floor(Math.random() * zones.length)];
    const price = Math.floor(Math.random() * 5000) + 100;
    
    const textAnalysis = {
        '1. Is it a buy, hold, or avoid zone?': `${zone} zone. ${zone === 'BUY' ? 'Strong momentum breakout observed.' : zone === 'HOLD' ? 'Consolidating near key average.' : 'Weak demand and high volatility.'}`,
        '2. Support and resistance levels.': `Support: ${price - 50}, ${price - 100}. Resistance: ${price + 50}, ${price + 100}.`,
        '3. Short-term target and stop loss.': `Target: ${price + 75}. Stop Loss: ${price - 75}.`,
        '4. One-line summary for YouTube narration.': `🔴 ${stock}: Is this the next 20% gainer or a massive market trap?`,
    };
    
    // Mock image URL (In a real scenario, this would be a link to the Gemini generated image)
    const imageUrl = `https://mockimagegenerator.com/${stock}_ai_graphic.jpg`;

    return { text: textAnalysis, imageUrl: imageUrl };
}

/**
 * Generates the full HTML content string for a single stock report file.
 */
function createStockHtmlContent(stockName, analysisText, verificationTime) {
    const analysisHTML = Object.entries(analysisText).map(([key, value]) => 
        // Formatting the required output structure
        `<p><strong>${key}</strong>: ${value}</p>`
    ).join('');

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>${stockName} - NavaBharath AI Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; max-width: 800px; margin: auto; background-color: #f9f9f9; color: #333; }
        .report-header { background-color: #004d99; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        h1 { margin-top: 0; color: white; }
        .report-body { padding: 20px; background-color: white; border-radius: 0 0 8px 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); }
        strong { color: #004d99; }
        .disclaimer { margin-top: 40px; font-style: italic; color: #666; border-top: 1px solid #eee; padding-top: 15px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="report-header">
        <h1>AI Stock Report: ${stockName}</h1>
        <p>Verified: ${new Date(verificationTime).toLocaleString()}</p>
    </div>
    <div class="report-body">
        ${analysisHTML}
    </div>
    <p class="disclaimer">Disclaimer: This AI analysis is based on simulated data for demonstration and should not be used for actual investment decisions.</p>
</body>
</html>
    `;
}


// --- 4. SEARCH AND DATA MANAGEMENT FUNCTIONS (Local Storage) ---

/**
 * Loads existing data from localStorage and updates the global array.
 */
function loadStockDataLocally() {
    const storedData = localStorage.getItem('navaBharathStocks');
    if (storedData) {
        // Ensure the data is stored as an array of objects
        stockAnalysisData = JSON.parse(storedData);
    }
}

/**
 * Saves the current batch of analyzed stocks and updates history.
 */
function saveStockDataLocally(newEntries) {
    // Append new entries to the existing data
    stockAnalysisData.push(...newEntries);
    
    // Save the entire history back to local storage
    localStorage.setItem('navaBharathStocks', JSON.stringify(stockAnalysisData));
}

/**
 * Handles the search functionality in the top-right search bar.
 * Shows the last verification date and the Buy/Hold/Avoid zone.
 */
function searchStock() {
    const input = document.getElementById('searchBar');
    const filter = input.value.toUpperCase().trim();
    
    if (filter.length < 2) {
        // Clear previous search indication if input is too short
        input.style.backgroundColor = '#ffffff';
        return;
    }

    // Find the latest entry for the typed stock
    const foundStock = stockAnalysisData
        .slice() // create a copy
        .reverse() // check newest first
        .find(item => item.stockName === filter);

    if (foundStock) {
        const date = new Date(foundStock.verificationDate).toLocaleString();
        const zone = foundStock.analysis['1. Is it a buy, hold, or avoid zone?'];
        alert(`✅ Stock Found!\nName: ${foundStock.stockName}\nLast Verified: ${date}\nZone: ${zone}`);
        input.style.backgroundColor = '#d4edda'; // Green for found
    } else {
        input.style.backgroundColor = '#f8d7da'; // Red for not found
    }
}


// --- 5. DOWNLOAD FUNCTIONALITY (using JSZip and FileSaver.js) ---

/**
 * Bundles the latest 5 analyzed stocks into a ZIP file.
 * Requires JSZip and FileSaver.js libraries to be included in index.html.
 */
function downloadReportsZip() {
    // Check if libraries are loaded
    if (typeof JSZip === 'undefined' || typeof saveAs === 'undefined') {
        alert("Download libraries (JSZip/FileSaver) failed to load. Cannot create ZIP file.");
        return;
    }

    if (stockAnalysisData.length === 0) {
        alert("No stock analysis data available to download.");
        return;
    }

    const zip = new JSZip();
    // Select the latest 5 unique stocks (or all if less than 5)
    // We reverse and slice to get the 5 most recent analyses
    const filesToZip = stockAnalysisData.slice().reverse().slice(0, 5);
    
    if (filesToZip.length === 0) {
         alert("No recent analysis found to download.");
         return;
    }

    filesToZip.forEach(item => {
        // The HTML content was pre-generated and stored in the data object
        const filename = `${item.stockName}.html`;
        zip.file(filename, item.htmlContent);
    });

    // Generate the ZIP file as a Blob and trigger download
    zip.generateAsync({ type: "blob" }).then(function(content) {
        saveAs(content, "NavaBharath_AI_Reports.zip");
    });
}
