const { crear_matriz, simplificar } = require("./utils.js");

const prompt = require("prompt-sync")({ sigint: true });

const cantidad_variables = +prompt("Ingresa la cantidad de variables: ");
const expresion = prompt("Ingresa tu expresión booleana algebraica: ");

let expresionArray = expresion.split("+");
let expresionArrayNumeros = [];

for (const term of expresionArray) {
  let auxiliar = "";

  for (const letra of term) {
    if (letra.match("[a-zA-Z]")) {
      auxiliar += "1";
    }

    if (letra === "~" || letra === "!" || letra === "'") {
      auxiliar = auxiliar.slice(0, -1) + "0";
    }
  }

  expresionArrayNumeros.push(auxiliar);
}

console.log(expresionArray.join(" + "));
console.log(expresionArrayNumeros.join(" + "));

const [table, indice_terminos] = crear_matriz(
  cantidad_variables,
  expresionArrayNumeros
);
const simplificacion = simplificar(table, indice_terminos);

console.log(table.toString());
console.log(simplificacion);
