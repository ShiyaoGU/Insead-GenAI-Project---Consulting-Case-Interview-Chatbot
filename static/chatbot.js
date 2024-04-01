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

    if (sender === 'user') {
        messageDiv.classList.add('user-query');
    } else if (sender === 'bot') {
        messageDiv.classList.add('bot-response');
    }

    messageDiv.textContent = message;
    chatDiv.appendChild(messageDiv);

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

// New function to handle the audio data
async function sendAudio(audioBlob) {
    try {
        const formData = new FormData();
        formData.append('audio_file', audioBlob, 'recording.mp3');
        
        const response = await fetch('/upload_audio', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Assuming the server returns the transcribed text in the data
        // and you want to send that text as a message:
        if (data.transcribed_text) {
            displayMessage(data.transcribed_text, 'user');
            messageCount++;  // Increment message count for the transcribed text
            sendMessage();  // Trigger the chatbot message process with the transcribed text
        }
    } catch (e) {
        console.error('Error sending audio:', e);
    }
}
