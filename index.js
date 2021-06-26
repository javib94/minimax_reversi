
const express = require('express')
const app = express()
const port = process.env.PORT||3000 
var matrizheuristica= [
  [],
  [],
  [],
  [],
  [],
  [],
  [],
  [],
]
app.get('/', (req, res) => {
  console.log(req.query.turno)
  console.log(req.query.estado)
  var turno = req.query.turno
  var estado = req.query.estado
  if(turno!=undefined&&estado!=undefined){
    var matrix = toMatrix(estado.toString());
    //arreglo con los movimientos posibles a realizar. 
    var movimiento = minimax2(turno, matrix, true, 0, 2, null)
    //var movimientosposibles = getMovimientosPosibles(turno, matrix); // elementos [fila, columna, piezascomibles]  
    var response = movimiento[0]+""+movimiento[1]

    console.log(response)
    res.send(response)
  }else{
    res.send('24')
  }  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

// recibe el turno, estado, boolean, prof actual, max prof, movimiento que genero el estado actual
function minimax(turno, estado, maximizando, profundidad,  maxprof, movimiento){ //debo retornar [fila,columna,heuristica]
  if(profundidad==maxprof){
    // CALCULAR HEURISTICA 
    return [movimiento[0], movimiento[1], movimiento[2]]; //si ya no hay sucesores 
  }       
  var movimientosposibles = getMovimientosPosibles(turno, estado); // elementos [fila, columna, piezascomibles]  
  
  var estadoshijos = [];
  for(mov of movimientosposibles){
    var nuevoestado = ejecutarEstado(turno, estado, mov);
    estadoshijos.push([nuevoestado, mov, 0]); // cada hijo guarda [nuevoestado | movimiento que ejecuta 1 | heuristica(no calculada)]
                    //      0        1   2
  }
  if(estadoshijos.length==0){
    // CALCULAR HEURISTICA 
    return [movimiento[0], movimiento[1], movimiento[2]]; //si ya no hay sucesores 
  }else{
    //una vez generados los hijos mandarlos a generar sus hijos
    //console.log(estadoshijos)
    var mejorheuristic = 0
    var mejormov = []
    var flag = true
    var nextTurn = turno=='0'? '1' : '0'
    for(hijo of estadoshijos){
     
      var result = minimax(nextTurn, hijo[0], !maximizando, profundidad+1, maxprof, hijo[1])
      hijo[2] = result[2] //Le coloco la heuristica resultante 
      //console.log(hijo);
      if(flag){
        mejorheuristic = hijo[2] //solo la primera vez que entra al ciclo para empezar a comparar 
        mejormov = hijo[1]
        flag = !flag
      }
      if(maximizando){
        if(hijo[2]>mejorheuristic){
          mejorheuristic = hijo[2];
          mejormov = hijo[1];

        }
      }else{//minimizando
        if(hijo[2]<mejorheuristic){
          mejorheuristic = hijo[2];
          mejormov = hijo[1];
        }
      }
    }
    return [mejormov[0], mejormov[1], mejorheuristic]    
  }
}



function minimax2(turno, estado, maximizando, profundidad,  maxprof, movimiento){
  if(profundidad == maxprof){
    return [movimiento[0], movimiento[1], movimiento[2]*1]
    //         fila           columna      HEURISTICA                            
  }
  var movimientosposibles = getMovimientosPosibles(turno, estado); // elementos [fila, columna, piezascomibles]  
  var estadoshijos = [];
  for(mov of movimientosposibles){
    var nuevoestado = ejecutarEstado(turno, estado, mov);
    estadoshijos.push([nuevoestado, mov, 0]); // cada hijo guarda [nuevoestado | movimiento que ejecuta 1 | heuristica(no calculada)]
                    //     estado  movimiento    heristica sin definir
  }
  if(estadoshijos.length==0){
    return [movimiento[0], movimiento[1], movimiento[2]*1]
    //         fila           columna      HEURISTICA
  }
  var mejorheuristica;
  var nextTurn = '';
  var mejorhijo;
  if(turno === '0'){
    nextTurn = '1'  
  } else {
    nextTurn = '0'  
  }
  for(hijo of estadoshijos){
    var result = minimax2(nextTurn, hijo[0], !maximizando, profundidad+1, maxprof, hijo[1])
    hijo[2] = result[2];
    if(mejorheuristica == undefined){
      mejorheuristica = hijo[2]
      mejorhijo = hijo
    }else{
      if(maximizando){
        if(hijo[2]>mejorheuristica){
          mejorheuristica = hijo[2]
          mejorhijo = hijo
        }
      }else{
        if(hijo[2]<mejorheuristica){
          mejorheuristica = hijo[2]
          mejorhijo = hijo
        }
      }
    }
  }
  if(movimiento!=null){
    movimiento[2] = mejorheuristica;
    return movimiento;
  }else{
    return mejorhijo;
  }
}

function ejecutarEstado(turno, estado, movimiento){
  var nuevoestado = []
  for(i=0;i<8;i++){
    nuevoestado.push('')
    for(j=0;j<8;j++){
      if(movimiento[0]==i&&movimiento[1]==j){
        nuevoestado[i] += turno
      }else{
        //console.log(nuevoestado[i]);
        nuevoestado[i] += estado[i][j] 
      }
    }
  }
  return nuevoestado
}



function getMovimientosPosibles(turno, estado){
  var movimientos = [];
  for(i=0;i<8;i++){
    for(j=0;j<8;j++){//revisa en todas las posiciones si hay movimiento posible 
      var comida = isLegalMove(estado, turno, i,j); // retorna cuantas puede comer
      if(comida>0){
        movimientos.push([i,j,comida]);
      }
    }
  }
  return movimientos;
}

function isLegalMove(estado, turno, fila, columna){
  if(estado[fila][columna]!='2'){
    return 0; //si está ocupada ni hay que revisar
  }
  return  puedeComer(estado, turno, fila, columna)
}

function puedeComer(estado, turno, fila, columna){
  // arriba-izquierda 
  var oponente = '1'
  //caso contrario invertirlo
  if(turno=='1'){
    oponente = '0'
  }
  var comidatotal = 0;
  var comida = 0 
  var i = fila-1 //pivotes
  var j = columna-1
  var amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  var vacio = false //si es espacio vacio se sale 
  while(i>=0 && j>=0 && !amiga && !vacio){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i--;
    j--;
  }
  if(amiga){
    comidatotal += comida
  } 
  // aqui ya contó si hay comida en diagonal arriba--izquierda
  comida = 0
  i = fila -1//pivotes
  j = columna
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while(i>=0 && !amiga && !vacio){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i--;
  }
  if(amiga){
    comidatotal += comida
  }
  //contó comida hacia arriba 
  comida = 0 
  i = fila -1//pivotes
  j = columna +1
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while( i>=0 && j<8 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i--;
    j++;
  }
  if(amiga){
    comidatotal += comida
  } 
  // aqui ya contó si hay comida en diagonal arriba--derecha

  comida = 0 
  i = fila //pivotes
  j = columna+1
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while(j<8 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    j++;
  }
  if(amiga){
    comidatotal += comida
  } 
  //derecha
  comida = 0 
  i = fila +1//pivotes
  j = columna +1
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while( i<8 && j<8 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i++;
    j++;
  }
  if(amiga){
    comidatotal += comida
  } 
  // aqui ya contó si hay comida en diagonal abajo--derecha
  comida = 0 
  i = fila +1 //pivotes
  j = columna
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while( i<8 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i++;
  }
  if(amiga){
    comidatotal += comida
  }
  // aqui ya contó si hay comida abajo
  comida = 0 
  i = fila +1//pivotes
  j = columna-1
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while( i<8 && j>=0 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    i++;
    j--;
  }
  if(amiga){
    comidatotal += comida
  }
  // aqui ya contó si hay comida abajo--izquierda
  comida = 0 
  i = fila //pivotes
  j = columna-1
  amiga = false //variable para reconocer que se encontró una variable en el otro extremo de la direccion a evaluar 
  vacio = false //si es espacio vacio se sale 
  while( j>=0 && !amiga && !vacio ){
    if(estado[i][j]==oponente){ // si son del jugador contrario
      comida++
    }else if(estado[i][j]=='2'){ //si es espacio en blanco
      vacio = true
    }else if(estado[i][j]==turno){
      amiga = true
    }
    j--;
  }
  if(amiga){
    comidatotal += comida
  }
  // aqui ya contó si hay comida izquierda
  return comidatotal;
}

function toMatrix(arreglo){
  var size = 8;
  var res = []; 
  for(var i=0;i < arreglo.length; i = i+size)
  res.push(arreglo.slice(i,i+size));
  return res;
}

