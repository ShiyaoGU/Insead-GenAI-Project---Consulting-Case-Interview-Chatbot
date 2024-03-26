document.getElementById('startButton').addEventListener('click', function() {
    this.style.display = 'none';
    document.getElementById('userForm').style.display = 'block';
});

function submitForm() {
    console.log('submitForm called'); // Add this to check function is called
    const formData = {
        caseType: document.getElementById('caseType').value,
        geography: document.getElementById('geography').value,
        industry: document.getElementById('industry').value,
        difficulty: document.getElementById('difficulty').value
    };
    console.log('Form Data:', formData); // Check what data is being sent
    fetch('/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Server Response:', data); // Check the server response
        alert("Data Submitted: " + JSON.stringify(data));
        window.location.href = "/chatbot"; // Redirect to chatbot page
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}
