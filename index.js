
const express = require('express')
const app = express()
const port = process.env.PORT||3000 

app.get('/', (req, res) => {
  console.log(req.query.turno)
  console.log(req.query.estado)
  var turno = req.query.turno
  var estado = req.query.estado
  if(turno!=undefined&&estado!=undefined){
    var matrix = toMatrix(estado.toString());
    //arreglo con los movimientos posibles a realizar. 
    var movimiento = minimax(turno, matrix, true, 0, 2)
    //var movimientosposibles = getMovimientosPosibles(turno, matrix); // elementos [fila, columna, piezascomibles]  
    var response = movimiento[0]+""+movimiento[1]
    console.log(movimiento)
    res.send(response)
  }else{
    res.send('24')
  }  
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})


function minimax(turno, estado, maximizando, profundidad,  maxprof){ //debo retornar [fila,columna,heuristica]
  if(profundidad==maxprof){
    return;
  }       
  var movimientosposibles = getMovimientosPosibles(turno, estado); // elementos [fila, columna, piezascomibles]  
  
  var estadoshijos = [];
  for(mov of movimientosposibles){
    var nuevoestado = ejecutarEstado(turno, estado, mov);
    estadoshijos.push([nuevoestado, mov, 0]); // cada hijo guarda [nuevoestado | movimiento que ejecuta 1 | heuristica(no calculada)]
  }
  if(profundidad==maxprof-1){ //si mis hijos son nodos hoja 
    var mejorheuristic = estadoshijos[0][1][2];
    var mejormov = estadoshijos[0][1]
    var flag = true;
    for(hijo of estadoshijos){
      //HEURISTICA AQUI
      hijo[2] = hijo[1][2]; //Heuristica igual a la cantidad de fichas a comer. 
      //MODIFICAR AQUI
      if(flag){
        mejorheuristic = hijo[2] //solo la primera vez que entra al ciclo para empezar a comparar 
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
    return [mejormov[0], mejormov[1], mejorheuristic];
  }else{
    //una vez generados los hijos mandarlos a generar sus hijos
    //console.log(estadoshijos)
    var mejorheuristic = estadoshijos[0][1][2];
    var mejormov = estadoshijos[0][1]
    var flag = true;
    var nextTurn = turno=='0'? '1' : '0'
    for(hijo of estadoshijos){
      var result = minimax(nextTurn, hijo[0], !maximizando, profundidad+1, maxprof)
      hijo[2] = result[2] //Le coloco la heuristica resultante 
      if(flag){
        mejorheuristic = hijo[2] //solo la primera vez que entra al ciclo para empezar a comparar 
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
    return [mejormov[0], mejormov[1], mejorheuristic];
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

