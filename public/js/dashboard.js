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

async function displayAllDayChanges(username) {
    try {
        const requestBody = username ? { username } : {};
        const response = await fetch('/stocks/day-change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ requestBody }),
        });
        const data = await response.json();
        data.forEach(stat => {
            const row = document.querySelector(`tr[data-ticker="${stat.ticker}"]`);
            if (row) {
                    const changeCell = row.querySelector('.change');
                    if (changeCell) {
                        changeCell.innerHTML = `${stat.percentChange}%`;
                    if (stat.percentChange > 0) {
                        changeCell.classList.add('positive');
                        changeCell.classList.remove('negative');
                    } else if (stat.percentChange < 0) {
                        changeCell.classList.add('negative');
                        changeCell.classList.remove('positive');
                    } else {
                        changeCell.classList.remove('positive', 'negative');
                    }
                }
                const openingCell = row.querySelector('.opening');
                if (openingCell) openingCell.innerHTML = `$${stat.openingPrice.toLocaleString()}`;
                const highCell = row.querySelector('.high');
                if (highCell) highCell.innerHTML = `$${stat.highPrice.toLocaleString()}`;
                const lowCell = row.querySelector('.low');
                if (lowCell) lowCell.innerHTML = `$${stat.lowPrice.toLocaleString()}`;
            }
        });
    } catch (error) {
        console.error('Error displaying high/low/change data:', error);
    }
}

async function displayStockDayChanges(username, ticker) {
    try {
        const response = await fetch('/stocks/day-change', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });
        const data = await response.json();

        const stockData = data.find(stat => stat.ticker === ticker);
        if (stockData) {
            const high = document.querySelector('.day-change .high');
            const low = document.querySelector('.day-change .low');
            const change = document.querySelector('.day-change .change');

            if (high) high.innerHTML = `$${stockData.highPrice.toLocaleString()}`;
            if (low) low.innerHTML = `$${stockData.lowPrice.toLocaleString()}`;
            if (change) {
                change.innerHTML = `${stockData.percentChange}%`;
                if (stockData.percentChange > 0) {
                    change.classList.add('positive');
                    change.classList.remove('negative');
                } else {
                    change.classList.add('negative');
                    change.classList.remove('positive');
                }
            }
        }
    } catch (error) {
        console.error('Error displaying stock day stats:', error);
    }
}


async function buySell(username, ticker) {
    let type = document.getElementById('buySell').value;
    let quantity = document.getElementById('purchaseAmount').value;
    let transactionError = document.getElementById('transactionError');
    const isConfirmed = window.confirm(`Are you sure you want to ${type} ${quantity} shares of ${ticker}?`);
    if (!isConfirmed) return;
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
            if (type == 'buy') alert(`Successfully purchased ${quantity} shares of ${ticker}!`);
            if (type == 'sell') alert(`Successfully sold ${quantity} shares of ${ticker}!`);
            window.location.reload;
        }
    } catch (error) {
        transactionError.textContent = 'An unexpected error occurred. Please try again later.';
    }
}