function dayChange(history) { // averages stock price history and outputs to frontend
    console.log("test")
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