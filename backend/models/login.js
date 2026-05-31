// Login logic for handling API requests to the backend loginroutes

document.addEventListener('DOMContentLoaded', () => {
    console.log("Login JS initialized");

    // Example function to handle a standard login request to loginroutes.js
    async function handleLogin(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            
            if (data.success) {
                console.log("Login successful:", data.message);
                // Redirect or update UI
            } else {
                console.error("Login failed:", data.message);
            }
        } catch (error) {
            console.error("Error during login:", error);
        }
    }
});
