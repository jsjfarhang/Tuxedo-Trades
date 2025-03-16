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
    const fname = signupData.get("fname");
    const lname = signupData.get("lname");
    const username = signupData.get("username");
    const password = signupData.get("password");
    const email = signupData.get("email");
    const admin = false;
    const bankName = signupData.get("bankName");
    const bankBalance = Number(signupData.get("bankBalance"));
    
    const response = await fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fname, lname, username, password, email, admin, bankName, bankBalance }),
    })
}

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("signupForm").addEventListener("submit", function(event){
        event.preventDefault();

        const signupData = new FormData(this)
        addUser(signupData)
    })
})