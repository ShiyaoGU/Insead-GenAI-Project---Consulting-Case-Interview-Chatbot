let messageCount = 0;

async function sendMessage() {
    const inputField = document.getElementById('userInput');
    const userText = inputField.value.trim();

    if (userText) {
        displayMessage(userText, 'user');
        inputField.value = '';
        messageCount++;  // Increment message count

        try {
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
            displayMessage(data.message, 'bot');
            messageCount++;  // Increment for bot's response as well

            // Enable the report button after 5 user messages
            if (messageCount >= 5) {
                document.getElementById('generateReportBtn').disabled = false;
            }
        } catch (e) {
            console.error('Error:', e);
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


async function generateReport() {
    try {
        // Request the server to generate a report
        const response = await fetch('/generate_report');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Switch to the report.html page
        window.location.href = '/generate_report';
    } catch (e) {
        console.error('Error generating report:', e);
    }
}
