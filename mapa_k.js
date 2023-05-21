const prompt = require('prompt-sync')({ sigint: true });

const expression = prompt('Enter your algebraic boolean expression: ');

let expressionArray = expression.split('+');

let expressionArrayNumbers = []

console.log(expressionArray);

for (const term of expressionArray) {
    console.log(term);
    let auxTerm = '';

    for (const literal of term) {
        
        if (literal.match('[a-zA-Z]')) {
            auxTerm += '1'
        }

        if (literal === '~' || literal === '!' || literal === "'") {
            auxTerm = auxTerm.slice(0, -1) + '0';
        }
    }

    expressionArrayNumbers.push(auxTerm);

}

console.log(expressionArrayNumbers)

map_k()