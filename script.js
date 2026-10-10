const display = document.querySelector('.inner input');
const buttons = document.querySelectorAll('button');

let justEvaluated = false; // "=" ke baad naya number likhne par display saaf karne ke liye

const isOperator = (ch) => ['+', '-', '*', '/'].includes(ch);
const isDigit = (ch) => /[0-9]/.test(ch);

function append(value) {
    let current = display.value;
    const last = current.slice(-1);

    if (current === 'Error') current = '';

    // "=" ke baad: number likha to naya start, operator likha to usi result par aage chalo
    if (justEvaluated) {
        if (isDigit(value) || value === '.' || value === '(') current = '';
        justEvaluated = false;
    }

    // Operators
    if (isOperator(value)) {
        if (current === '') {
            if (value === '-') display.value = '-'; // shuru mein sirf minus allowed
            return;
        }
        if (current === '-') return;
        if (isOperator(last)) {
            current = current.slice(0, -1); // pichla operator badal do
        }
        display.value = current + value;
        return;
    }

    // Percent
    if (value === '%') {
        if (isDigit(last) || last === ')') display.value = current + '%';
        return;
    }

    // Dot: ek number mein sirf ek dot
    if (value === '.') {
        const lastNumber = current.split(/[+\-*/()%]/).pop();
        if (lastNumber.includes('.')) return;
        if (current === '' || isOperator(last) || last === '(') current += '0';
        display.value = current + '.';
        return;
    }

    // Digits
    if (isDigit(value)) {
        if (last === ')' || last === '%') current += '*'; // (2)3 -> (2)*3
        display.value = current + value;
        return;
    }

    display.value = current + value;
}

function handleBrackets() {
    let current = display.value === 'Error' ? '' : display.value;
    if (justEvaluated) {
        justEvaluated = false;
    }
    const last = current.slice(-1);
    const open = (current.match(/\(/g) || []).length;
    const close = (current.match(/\)/g) || []).length;

    if ((isDigit(last) || last === ')' || last === '%') && open > close) {
        display.value = current + ')';
    } else if (isDigit(last) || last === ')' || last === '%') {
        display.value = current + '*(';
    } else {
        display.value = current + '(';
    }
}

function calculate() {
    let expr = display.value;
    if (expr === '' || expr === 'Error') return;

    // Aakhir mein operator ho to hata do
    while (isOperator(expr.slice(-1)) || expr.slice(-1) === '.') {
        expr = expr.slice(0, -1);
    }

    // Khuley brackets band kar do
    const open = (expr.match(/\(/g) || []).length;
    const close = (expr.match(/\)/g) || []).length;
    expr += ')'.repeat(Math.max(0, open - close));

    // 50% -> (50/100)
    expr = expr.replace(/(\d+\.?\d*)%/g, '($1/100)');

    // Sirf allowed characters
    if (!/^[0-9+\-*/().\s]+$/.test(expr)) {
        display.value = 'Error';
        return;
    }

    try {
        const result = Function('"use strict"; return (' + expr + ')')();
        if (!isFinite(result)) {
            display.value = 'Error'; // 0 se divide
        } else {
            display.value = String(parseFloat(result.toFixed(10)));
        }
    } catch {
        display.value = 'Error';
    }
    justEvaluated = true;
}

function clearAll() {
    display.value = '';
    justEvaluated = false;
}

function deleteLast() {
    if (display.value === 'Error') {
        display.value = '';
        return;
    }
    display.value = display.value.slice(0, -1);
    justEvaluated = false;
}

// Button clicks
buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
        const value = btn.textContent.trim();

        if (value === 'AC') clearAll();
        else if (value === 'CLEAR') deleteLast();
        else if (value === '=') calculate();
        else if (value === '()') handleBrackets();
        else append(value);
    });
});

// Keyboard support
document.addEventListener('keydown', (e) => {
    const key = e.key;

    if (isDigit(key) || ['+', '-', '*', '/', '.', '%'].includes(key)) {
        append(key);
    } else if (key === '(' || key === ')') {
        append(key);
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        deleteLast();
    } else if (key === 'Escape') {
        clearAll();
    }
});