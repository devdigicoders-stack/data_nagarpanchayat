export function numberToHindiWords(num) {
  const n = Math.round(Number(num) || 0);
  if (n === 0) return 'शून्य';
  const ones = ['', 'एक', 'दो', 'तीन', 'चार', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस',
    'ग्यारह', 'बारह', 'तेरह', 'चौदह', 'पंद्रह', 'सोलह', 'सत्रह', 'अठारह', 'उन्नीस'];
  const tens = ['', '', 'बीस', 'तीस', 'चालीस', 'पचास', 'साठ', 'सत्तर', 'अस्सी', 'नब्बे'];

  function convertTwoDigits(val) {
    if (val < 20) return ones[val];
    const t = Math.floor(val / 10);
    const o = val % 10;
    return tens[t] + (o > 0 ? ' ' + ones[o] : '');
  }

  let words = '';
  const crore = Math.floor(n / 10000000);
  const lakh = Math.floor((n % 10000000) / 100000);
  const thousand = Math.floor((n % 100000) / 1000);
  const hundred = Math.floor((n % 1000) / 100);
  const rest = n % 100;

  if (crore > 0) words += convertTwoDigits(crore) + ' करोड़ ';
  if (lakh > 0) words += convertTwoDigits(lakh) + ' लाख ';
  if (thousand > 0) words += convertTwoDigits(thousand) + ' हज़ार ';
  if (hundred > 0) words += ones[hundred] + ' सौ ';
  if (rest > 0) words += convertTwoDigits(rest);

  return words.trim() + ' रुपये मात्र';
}
