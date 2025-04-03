/* ADJUST BANNED CHARS FUNCTIONALITY */

// random price generator (initializes price)
function priceGenerator() {
    let min = 1, max = 5000;
    let randomPrice = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomPrice;
}

async function addStock(stockData) {
    const createStockError = document.getElementById("createStockError");
    const ticker = stockData.get("ticker");
    const company = stockData.get("company");
    const timestamp = new Date();
    const price = Number(priceGenerator());
    const volume = Number(stockData.get("volume"));
    const marketCap = Number(price * volume);
    const history = [{ timestamp, price }];
    if (!ticker || !company || !volume || isNaN(volume) || volume <= 0) {
        document.getElementById('createStockError').textContent = "Please provide valid stock information.";
        return;
    }
    try {
        const response = await fetch('/stocks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticker, company, volume, marketCap, history }),
        });
        const result = await response.json();
        if (!response.ok) {
            createStockError.textContent = result.error || "An error occurred during stock creation.";
        } else {
            createStockError.textContent = '';
            alert("Stock created");
            window.location.reload();
        }
    } catch (error) {
        console.log("An unexpected error occurred: ", error);
    }
}

// grab market settings on page load
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch('/market-settings');
        if (!response.ok) throw new Error("Failed to fetch market settings");
        const settings = await response.json();
        document.getElementById('openTime').value = settings.openTime;
        document.getElementById('closeTime').value = settings.closeTime;
        document.getElementById('holidays').value = settings.holidays.join(', ');
        document.getElementById('openDays').value = settings.openDays.join(', ');
    } catch (error) {
        console.error("Error loading market settings:", error);
    }
    document.getElementById("hoursForm").addEventListener("submit", updateMarketHours);
    document.getElementById("scheduleForm").addEventListener("submit", updateMarketSchedule);
});

function isValidTimeFormat(time) {
    const regex = /^([01][0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(time);
}

function isValidMarketHours(openTime, closeTime) {
    if (!isValidTimeFormat(openTime) || !isValidTimeFormat(closeTime)) {
        alert("Invalid format. Please try again.");
        return false;
    }
    const [openHour, openMinute] = openTime.split(":").map(Number);
    const [closeHour, closeMinute] = closeTime.split(":").map(Number);
    if (openHour > closeHour || (openHour === closeHour && openMinute >= closeMinute)) {
        alert("Close time must be later than open time.");
        return false;
    }
    return true;
}

function isValidOpenDays(openDays) {
    const validDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const daysArray = openDays.split(', ').map(day => day.trim());
    for (let day of daysArray) {
        if (!validDays.includes(day)) {
            alert(`Invalid day: ${day}. Please enter valid days.`);
            return false;
        }
    }
    return true;
}

function isValidHolidays(holidays) {
    console.log(holidays)
    const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
    const holidaysArray = holidays.split(', ').map(h => h.trim());
    for (let holiday of holidaysArray) {
        if (!dateRegex.test(holiday)) {
            alert(`Invalid holiday date: ${holiday}. Please use YYYY/MM/DD format.`);
            return false;
        }
    }
    return true;
}

async function updateMarketHours(event) {
    event.preventDefault();
    const openTime = document.getElementById('openTime').value;
    const closeTime = document.getElementById('closeTime').value;
    if (!isValidMarketHours(openTime, closeTime)) return;
    try {
        const response = await fetch('/update-market-hours', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ openTime, closeTime })
        });
        const result = await response.json();
        if (!response.ok) return result.error;
        alert("Market hours successfully updated.");
        window.location.reload();
    } catch (error) {
        console.error("Error updating market hours:", error);
    }
}

async function updateMarketSchedule(event) {
    event.preventDefault();
    const holidays = document.getElementById('holidays').value;
    const openDays = document.getElementById('openDays').value;
    if (!isValidHolidays(holidays)) return;
    if (!isValidOpenDays(openDays)) return;
    try {
        const response = await fetch('/update-market-schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                holidays: holidays.split(', ').map(h => h.trim()),
                openDays: openDays.split(', ').map(d => d.trim())
            })
        });
        const result = await response.json();
        if (!response.ok) return result.error;
        alert("Market schedule successfully updated.");
        window.location.reload();
    } catch (error) {
        console.error("Error updating market schedule:", error);
    }
}
