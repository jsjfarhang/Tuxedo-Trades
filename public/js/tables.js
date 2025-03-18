async function fetchTransactions() {
    const response = await fetch('/fetchTrans');
    const transactions = await response.json();

    const table = document.getElementById('historyTable');
    transactions.forEach(trans => {
        const row = table.insertRow();
        const timeCell = row.insertCell();
        const typeCell = row.insertCell();
        const tickerCell = row.insertCell();
        const qtyCell = row.insertCell();
        const priceCell = row.insertCell();

        timeCell.textContent = transactions.timestamp;
        typeCell.textContent = transactions.buySell;
        tickerCell.textContent = transactions.ticker;
        qtyCell.textContent = transactions.quantity;
        priceCell.textContent = transactions.price;
    })
}

