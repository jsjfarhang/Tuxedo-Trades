/* ADJUST BANNED CHARS FUNCTIONALITY */

function priceGenerator() {
    let min = 1, max = 5000;
    let randomPrice = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPrice;
}

async function createStock(stockData) {
    const createStockError = document.getElementById("createStockError");
    const ticker = stockData.get("ticker");
    const company = stockData.get("company");
    const currentValue = Number(priceGenerator());
    const volume = Number(stockData.get("volume"));
    const marketCap = Number(currentValue * volume);
    try {
        const response = await fetch('/stocks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ticker, company, currentValue, volume, marketCap }),
        });
        const result = await response.json();
        if (!response.ok) {
            createStockError.textContent = result.error || 'An error occurred during stock creation.';
        } else {
            createStockError.textContent = '';
            alert('Stock created!');
        }
    } catch (error) {
        createStockError.textContent = 'An unexpected error occurred. Please try again later.';
    }
}