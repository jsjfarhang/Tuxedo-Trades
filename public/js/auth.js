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
