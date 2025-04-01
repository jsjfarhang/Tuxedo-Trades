let bannedChars = ["/", "<", ">", "`", "\\", "src", "&lt", "&gt", "\u003c", "\u003e"];

async function authenticateUser() {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    if (!username || !password) return;
    for (let char of bannedChars) {
        if (username.includes(char) || password.includes(char)) return;
    }
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });
    const data = await response.json();
    if (data.redirectUrl) window.location.href = data.redirectUrl;
    if (response.status === 400) {
        // 'Username and password are required'
    }
    if (response.status === 401) {
        // 'Invalid username or password'
    }
}

async function logoutUser() {
    const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'same-origin',
    });
    window.location.href = '/logout';
}

async function addUser(signupData) {
    const addUserError = document.getElementById("addUserError");
    const fname = signupData.get("fname");
    const lname = signupData.get("lname");
    const username = signupData.get("username");
    const password = signupData.get("password");
    const email = signupData.get("email");
    const bankName = signupData.get("bankName");
    const balance = Number(signupData.get("bankBalance"));
    try {
        const response = await fetch('/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fname, lname, username, password, email, bankName, balance }),
        });
        const result = await response.json();
        if (!response.ok) {
            addUserError.textContent = result.error || 'An error occurred during account creation.';
        } else {
            addUserError.textContent = '';
            alert('Account created! Please login.');
            window.location.href = `/`;
        }
    } catch (error) {
        addUserError.textContent = 'An unexpected error occurred. Please try again later.';
    }
}

if (window.location.pathname.includes('/transfer')) {
    const transferForm = document.getElementById('transfer');
    const amountError = document.getElementById('amountError');
    transferForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const transferFrom = document.getElementById('transferFrom').value;
        const transferTo = document.getElementById('transferTo').value;
        const amount = Number(document.getElementById('amount').value);
        amountError.textContent = '';
        if (isNaN(amount) || amount <= 0) {
            amountError.textContent = 'Amount must be greater than $0.';
            return;
        }
        if (!transferFrom || !transferTo) {
            amountError.textContent = 'Please select both accounts for transfer.';
            return;
        }
        if (transferTo == transferFrom) {
            amountError.textContent = 'Must select different accounts.';
            return;
        }
        try {
            const response = await fetch('/transfer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    fromAccount: transferFrom,
                    toAccount: transferTo,
                    amount: amount
                }),
            });
            const result = await response.json();
            if (!response.ok) {
                amountError.textContent = result.error || 'An error occurred during the transfer.';
            } else {
                amountError.textContent = '';
                alert('Transfer successful!');
                window.location.reload();
            }
        } catch (error) {
            amountError.textContent = 'An unexpected error occurred. Please try again later.';
        }
    });
}