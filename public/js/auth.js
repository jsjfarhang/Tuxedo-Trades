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
    if (response.status === 200) {
        window.location.href = `/${data.user.username}/dashboard`;
    } else {
        // invalid login error message
    }
}
