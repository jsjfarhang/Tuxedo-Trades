function updateLocalTime() {
    const localTime = new Date().toLocaleTimeString('en-US');
    document.getElementById('localTime').innerHTML = `Local Time: ${localTime}`;
}

function isMarketOpen(now, marketSettings) {
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);
    const isOpenTime = currentTime >= marketSettings.openTime && currentTime <= marketSettings.closeTime;
    const isOpenDay = marketSettings.openDays.includes(day);
    const formattedDate = now.toISOString().split('T')[0].replace(/-/g, '/');
    const isHoliday = marketSettings.holidays.includes(formattedDate);
    return isOpenTime && isOpenDay && !isHoliday;
}

function amPmFormatting(time) {
    const [hour, minute] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hour, 10));
    date.setMinutes(parseInt(minute, 10));
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

async function displayMarketSettings() {
    try {
        const response = await fetch('/market-settings');
        const result = await response.json();
        const now = new Date();
        const marketStatus = isMarketOpen(now, result) ? "Market Open" : "Market Closed";
        document.getElementById('marketHours').innerHTML = 
            `Market Hours: ${amPmFormatting(result.openTime)} - ${amPmFormatting(result.closeTime)}<br>${marketStatus}`;
    } catch (error) {
        console.error('Error fetching market settings:', error);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    displayMarketSettings();
    updateLocalTime();
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