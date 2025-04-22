function updateLocalTime() {
    const localTime = new Date().toLocaleTimeString('en-US');
    document.getElementById('localTime').innerText = `Local Time: ${localTime}`;
}

async function displayMarketSettings() {
    try {
        const response = await fetch('/market-settings');
        const result = await response.json();
        document.getElementById('marketHours').innerText = 
            `Market Hours: ${result.openTime} - ${result.closeTime}`;
    } catch (error) {
        console.error('Error fetching market settings:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    displayMarketSettings();
    setInterval(updateLocalTime, 1000);
});

function dayChange() { // averages stock price history and outputs to frontend
    return console.log("test")
    let now = new Date();
    let day = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    let prices = history
        .filter(entry => new Date(entry.timestamp) >= day)
        .map(entry => entry.price);
    let average = prices.length > 0
        ? prices.reduce((sum, price) => sum + price, 0) / prices.length
        : 0;
    console.log(average)
    document.getElementById("dayChange").textContent = average;
}

async function buySell(username, ticker) {
    let type = document.getElementById('buySell').value;
    let quantity = document.getElementById('purchaseAmount').value;
    let transactionError = document.getElementById('transactionError');
    try {
        const response = await fetch('/transactions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, quantity, username, ticker }),
        });
        const result = await response.json();
        if (!response.ok) {
            transactionError.textContent = result.error || 'An error occurred during account creation.';
        } else {
            transactionError.textContent = '';
            alert(`Successfully purchased ${quantity} shares of ${ticker}!`);
            window.location.reload;
        }
    } catch (error) {
        transactionError.textContent = 'An unexpected error occurred. Please try again later.';
    }
}