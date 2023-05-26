const Tabla = require("cli-mapaK3");

const mapaK = new Tabla({
  chars: {
    top: "═",
    "top-mid": "╤",
    "top-left": "╔",
    "top-right": "╗",
    bottom: "═",
    "bottom-mid": "╧",
    "bottom-left": "╚",
    "bottom-right": "╝",
    left: "║",
    "left-mid": "╟",
    mid: "─",
    "mid-mid": "┼",
    right: "║",
    "right-mid": "╢",
    middle: "│",
  },
});

const crear_matriz = (cantidad_variables, expresion) => {
  Headers = {
    2: ["A/B", "0", "1"],
    3: ["A/BC", "00", "01", "11", "10"],
    4: ["AB/CD", "00", "01", "11", "10"],
  };

  columnas = {
    2: ["0", "1"],
    3: ["0", "1"],
    4: ["00", "01", "11", "10"],
  };

  let indice_terminos = [];

  mapaK.push(Headers[cantidad_variables]);

  let cantidad_columnas = columnas[cantidad_variables].length;

  for (let i = 0; i < cantidad_columnas; i++) {
    header = Headers[cantidad_variables].slice(1); // cortar el primer elemento del array porque no se usara

    let fila = [`${columnas[cantidad_variables][i]}`]; // agregar el primer elemento de la fila

    let contador_para_llenar_filas = 2
    if(cantidad_variables !== 2) {
      contador_para_llenar_filas = 4
    }


    for (let j = 0; j < contador_para_llenar_filas; j++) {
      let termino = `${columnas[cantidad_variables][i] + header[j]}`; // sumamos columna y fila para obtener el valor de la celda

      if (expresion.includes(termino)) {
        fila.push(`\x1b[32m${termino}\x1b[0m`); // agregar el termino a la fila y le damos color verde
        indice_terminos.push(`${i + 1}${j + 1}`);
      } else {
        fila.push(termino); // agregar el termino a la fila sin color
      }
    }

    mapaK.push(fila);
  }

  return [mapaK, indice_terminos];
};

const simplificar = (matriz, indice_terminos_existente) => {
  let grupos = [];

  for (let i = 0; i < indice_terminos_existente.length; i++) {
    let actual = indice_terminos_existente[i];
    let grupo = [];

    indice_terminos_existente.forEach((indice) => {
      if (indice === actual) return;

      if (
        Math.abs(+actual - +indice) === 1 ||
        Math.abs(+actual - +indice) === 10
      ) {
        grupo.push(actual, indice);
      }
    });

    // Quitar valores repetidos y ordenar el grupo
    grupo = Array.from(new Set(grupo)).sort();

    if (grupo.length === 0) continue;

    if (grupo.length === 3) grupo = grupo.slice(1);

    // Verificar si el grupo ya existe en grupos
    if (!grupos.some((g) => JSON.stringify(g) === JSON.stringify(grupo))) {
      grupos.push(grupo);
    }
  }

  // convertir a expresion algebraica

  let expresion = [];

  grupos.forEach((grupo) => {
    let grupoAux = [];

    for (let i = 0; i < grupo.length; i++) {
      const regex = /\x1b\[\d+m/g; // Expresión regular para eliminar el formato de color
      let fila = grupo[i][0];
      let columna = grupo[i][1];
      const termino = matriz[fila][columna].replace(regex, "");

      grupoAux.push(termino);
    }

    expresion.push(
      convertirATerminos(compararTerminos(grupoAux[0], grupoAux[1])).termino
    );

    // console.log(expresion);
  });

  return expresion.join(" + ");
};

function convertirATerminos(texto) {
  let termino = "";
  let letras = "";

  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === "1") {
      termino += String.fromCharCode(65 + i); // Convertir a letra A, B, C, ...
      letras += String.fromCharCode(65 + i) + "'";
    } else if (texto[i] === "0") {
      termino += String.fromCharCode(65 + i) + "'";
    }
  }

  return { termino, letras };
}

function compararTerminos(termino1, termino2) {
  let resultado = "";

  for (let i = 0; i < termino1.length; i++) {
    if (termino1[i] === termino2[i]) {
      resultado += termino1[i];
    } else {
      resultado += "-";
    }
  }

  return resultado;
}

module.exports = { mapaK, crear_matriz, simplificar };
