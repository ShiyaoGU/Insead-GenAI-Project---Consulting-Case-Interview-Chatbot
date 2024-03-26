async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const userText = inputField.value.trim();

    // Check if the input is not empty
    if (userText) {
        // Display user's message
        displayMessage(userText, 'user');

        // Clear input field
        inputField.value = '';

        try {
            // Send the message to Flask server
            const response = await fetch('/chatbot_message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userText }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            // Display chatbot's response
            displayMessage(data.message, 'bot');
        } catch (e) {
            console.error('Error sending message to server:', e);
            // Optionally handle the error, e.g., by showing a message to the user
        }
    }
}

function displayMessage(message, sender) {
    const chatDiv = document.getElementById('chat');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message');

    // Adding text based on the sender
    let displayText = message;
    if (sender === 'user') {
        messageDiv.classList.add('user-query');
        displayText = "You: " + message;
    } else if (sender === 'bot') {
        messageDiv.classList.add('bot-response');
        displayText = "Interviewer: " + message;
    }
    
    messageDiv.textContent = displayText;
    chatDiv.appendChild(messageDiv);

    // Scroll to the newest message
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
