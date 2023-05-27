// Importar la biblioteca 'cli-table3' para crear tablas en la consola
const Tabla = require("cli-table3");

// Crear una nueva instancia de la tabla con bordes personalizados
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


// Función para crear la tabla de mapas de Karnaugh
const crear_mapaK = (cantidad_variables, expresion) => {
  // Definir los encabezados de la tabla para diferentes cantidades de variables
  const Headers = {
    2: ["A/B", "0", "1"],
    3: ["A/BC", "00", "01", "11", "10"],
    4: ["AB/CD", "00", "01", "11", "10"],
  };

  // Definir las columnas de la tabla para diferentes cantidades de variables
  const filas = {
    2: ["0", "1"],
    3: ["0", "1"],
    4: ["00", "01", "11", "10"],
  };

  // Lista para almacenar las ubicaciones de los términos en la expresión
  let ubicacion_terminos = [];

  // Agregar el encabezado correspondiente a la cantidad de variables al mapa
  mapaK.push(Headers[cantidad_variables]);

  // Obtener la cantidad de filas en función de la cantidad de variables
  let cantidad_filas = filas[cantidad_variables].length;

  // Recorrer las filas de la tabla
  for (let i = 0; i < cantidad_filas; i++) {
    // Cortar el primer elemento del array de encabezados porque no se usará o sea quitara el A/BC
    let header = Headers[cantidad_variables].slice(1);

    // Crear una nueva fila y agregar el primer elemento de la fila, aqui agregamos el 0 y luego el 1
    let fila = [`${filas[cantidad_variables][i]}`];

    // Determinar la cantidad de iteraciones para llenar las filas, o sea nos dice cuantos elemento habrá
    let contador_para_llenar_filas = 2;

    if (cantidad_variables !== 2) {
      contador_para_llenar_filas = 4;
    }

    // Llenar las filas con los términos de la expresión y agregar color si el término está presente en la expresion algebraica ingresada
    for (let j = 0; j < contador_para_llenar_filas; j++) {
      // Sumar la columna y la fila para obtener el valor de la celda o sea 0 + 00 = 000 y asi sucesivamente en todo el mapa
      let termino = `${filas[cantidad_variables][i] + header[j]}`;

      // Verificar si el término está presente en la expresión que el usuario ingreso
      if (expresion.includes(termino)) {
        // Agregar el término a la fila y darle color verde
        fila.push(`\x1b[32m${termino}\x1b[0m`);

        // Agregar la ubicación del término a la lista de ubicaciones
        ubicacion_terminos.push(`${i + 1}${j + 1}`);
      } else {
        // Agregar el término a la fila sin color
        fila.push(termino);
      }
    }

    // Agregar la fila al mapa
    mapaK.push(fila);
  }

  // Retornar el mapa y la lista de ubicaciones de términos de las expresiones que el usuario ingreso
  return [mapaK, ubicacion_terminos];
};

// Función para simplificar la expresión utilizando los mapas de Karnaugh
function simplificar (mapaK, ubicacion_terminos){
  // Lista para almacenar los grupos de términos que se pueden simplificar del mapa
  let grupos = [];

  
  // Recorrer las ubicaciones de los términos que ingreso el usuario
  // ['11','12','14','24']
  for(let i=0; i < ubicacion_terminos.length; i++){

    let ubicacionActual = ubicacion_terminos[i]// sera cada una de las ubicaciones
    let grupo = []; // variable para agrupar terminos cercanos

    // Recorrer nuevamente las ubicaciones para formar grupos de términos que se pueden simplificar
    ubicacion_terminos.forEach((ubicacion) => {

      //ubicacion es cada una de las ubicaciones y se comparara con la ubicacion actual osea que por ejemplo el 11  se comparara con todos
      //11 es ubicacion actual todos los demas son ubicacion(va ir cambiando mientras da vueltas el bucle)

      if (ubicacion === ubicacionActual) return; 

      // Verificar si las ubicaciones difieren en una única variable ('1') o en dos variables ('10')
      if (
        Math.abs(+ubicacionActual - +ubicacion) === 1 ||
        Math.abs(+ubicacionActual - +ubicacion) === 10  // si el resultado de la resta es 1 o 10 entonces se guardan en un grupo
      ) {
        grupo.push(ubicacionActual, ubicacion);
      }
    });

    // Eliminar valores duplicados y ordenar el grupo
    grupo = Array.from(new Set(grupo)).sort();

    // Verificar si el grupo ya existe en la lista de grupos
    if (!grupos.some((g) => JSON.stringify(g) === JSON.stringify(grupo))) {
      grupos.push(grupo);
    }

  }
    

  // Convertir los grupos de términos en una expresión algebraica
  let expresion = [];

  grupos.forEach((grupo) => {
    let grupoAux = [];

    // Convertir cada término del grupo a su forma simplificada
    for (let i = 0; i < grupo.length; i++) {
      // Expresión regular para eliminar el formato de color de los términos
      const regex = /\x1b\[\d+m/g;

      let fila = grupo[i][0]; // obtenemos la ubicacion de la fila donde se encuentra el elemento
      let columna = grupo[i][1]; // obtenemos la ubicacion de la columna donde se encuentra el elemento

      // Obtener el término del mapaK y eliminar el formato de color
      const termino = mapaK[fila][columna].replace(regex, "");

      grupoAux.push(termino);//agregar el termino al grupo aux
    }

    // comparamos los terminos para simplificarlos osea 000 y 001 = 00
    let simplificacion = compararTerminos(grupoAux[0], grupoAux[1])

    // convertir los términos del grupo en una forma simplificada osea el 00 = A'B'
    expresion.push(
      convertirATerminos(simplificacion).termino
    );
  });

  // Unir todos los términos de la expresión simplificada con un signo de suma
  return expresion.join(" + ");
};

// Función para convertir un texto en términos y letras
function convertirATerminos(texto) {
  let termino = ""; // Variable para almacenar el término resultante
  let letras = ""; // Variable para almacenar las letras resultantes

  // Recorrer el texto y convertir '1' en una letra y '0' en una letra con comilla simple
  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === "1") {
      // Si el carácter es '1', convertirlo en una letra y agregarlo al término
      termino += String.fromCharCode(65 + i);
      letras += String.fromCharCode(65 + i) + "'";
    } else if (texto[i] === "0") {
      // Si el carácter es '0', convertirlo en una letra con comilla simple y agregarlo al término
      termino += String.fromCharCode(65 + i) + "'";
    }
  }

  // Devolver un objeto con el término y las letras resultantes
  return { termino, letras };
}

// Función para comparar dos términos y encontrar las partes comunes
function compararTerminos(termino1, termino2) {
  let resultado = ""; // Variable para almacenar el resultado

  // Recorrer los términos y comparar cada posición
  for (let i = 0; i < termino1.length; i++) {
    if (termino1[i] === termino2[i]) {
      // Si los términos tienen el mismo valor en una posición, agregar ese valor al resultado
      resultado += termino1[i];
    } else {
      // Si los términos difieren en una posición, agregar un guion ('-') al resultado
      resultado += "-";
    }
  }

  // Devolver el resultado obtenido después de comparar todos los caracteres de los términos
  return resultado;
}


// Exportar las funciones y la tabla para su uso en otros módulos
module.exports = { mapaK, crear_mapaK, simplificar };

// 000 + 001 + 010 + 110
// ╔══════╤═════╤═════╤═════╤═════╗
// ║ A/BC │ 00  │ 01  │ 11  │ 10  ║-> es un arreglo
// ╟──────┼─────┼─────┼─────┼─────╢
// ║ 0    │ 000 │ 001 │ 011 │ 010 ║-> es otro arreglo
// ╟──────┼─────┼─────┼─────┼─────╢
// ║ 1    │ 100 │ 101 │ 111 │ 110 ║-> es otro arreglo 2
// ╚══════╧═════╧═════╧═════╧═════╝

// [es un arreglo, es otro arreglo, es otro arreglo 2][1][2]

// 000 + 001 + 010 + 110
// ╔══════╤═════╤═════╗
// ║ A/BC │ 0   │  1  ║-> es un arreglo
// ╟──────┼─────┼─────╢
// ║ 0    │ 00  │  01 ║-> es otro arreglo
// ╟──────┼─────┼─────╢
// ║ 1    │ 10  │ 11  ║-> es otro arreglo 2
// ╚══════╧═════╧═════╝