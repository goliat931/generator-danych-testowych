document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const peselOutput = document.getElementById('peselOutput');

    if (generateBtn && peselOutput) {
        generateBtn.addEventListener('click', () => {
            fetch('/generate-pesel')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data && data.pesel) {
                        peselOutput.innerText = data.pesel;
                    } else {
                        peselOutput.innerText = 'Błąd: Nie otrzymano numeru PESEL';
                    }
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                    peselOutput.innerText = 'Błąd serwera. Sprawdź konsolę, aby uzyskać więcej informacji.';
                });
        });
    }
});