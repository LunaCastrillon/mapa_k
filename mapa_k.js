// Importar las funciones y variables necesarias desde el archivo 'utils.js'
const { crear_mapaK, simplificar } = require("./utils.js");

// Importar la biblioteca 'prompt-sync' para recibir entradas desde la consola
const prompt = require("prompt-sync")({ sigint: true });

// Solicitar al usuario la cantidad de variables
const cantidad_variables = +prompt("Ingresa la cantidad de variables: ");

// Solicitar al usuario la expresión booleana algebraica
const expresion = prompt("Ingresa tu expresión booleana algebraica: ");

// Dividir la expresión en términos separados por '+'
let expresionArray = expresion.split("+");

// Arreglo para almacenar los términos de la expresión convertidos a números
let expresionArrayNumeros = [];

// Iterar sobre cada término de la expresión
for (const term of expresionArray) {
  let auxiliar = "";
 
  // Iterar sobre cada letra del término
  for (const letra of term) {
    if (letra.match("[a-zA-Z]")) {
      auxiliar += "1"; // Si la letra es una letra del alfabeto, se agrega "1" a 'auxiliar'
    }

    if (letra === "~" || letra === "!" || letra === "'") {
      auxiliar = auxiliar.slice(0, -1) + "0"; // Si la letra es '~', '!' o "'", se cambia el último dígito de 'auxiliar' a "0"
    }
  }

  expresionArrayNumeros.push(auxiliar); // Agregar 'auxiliar' al arreglo 'expresionArrayNumeros'
}

// Imprimir la expresión original
console.log(expresionArray.join(" + "));

// Imprimir la expresión convertida a números
console.log(expresionArrayNumeros.join(" + "));

// Crear la matriz utilizando la función 'crear_matriz'
const [mapaK, indice_terminos] = crear_mapaK(
  cantidad_variables,
  expresionArrayNumeros
);

// Simplificar la matriz utilizando la función 'simplificar'
const simplificacion = simplificar(mapaK, indice_terminos);

// Imprimir la tabla
console.log(mapaK.toString());

// Imprimir la simplificación
console.log(simplificacion);
