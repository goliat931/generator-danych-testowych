document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    const peselOutput = document.getElementById('peselOutput');

    if (generateBtn && peselOutput) {
        generateBtn.addEventListener('click', () => {
            // Generowanie losowego PESEL w JS
            let pesel = '';
            for (let i = 0; i < 11; i++) {
                pesel += Math.floor(Math.random() * 10);
            }
            peselOutput.innerText = pesel;
        });
    }
});