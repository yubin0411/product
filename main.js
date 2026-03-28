
const generateBtn = document.getElementById('generate');
const lottoNumbers = document.querySelectorAll('.number');

generateBtn.addEventListener('click', () => {
    const numbers = new Set();
    while (numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 45) + 1);
    }

    const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);

    lottoNumbers.forEach((element, index) => {
        element.textContent = sortedNumbers[index];
    });
});
