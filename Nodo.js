
const Movimiento = require("./Movimiento.js")

class Nodo{
    constructor(turno, estado, deph, maximizar){
     //   console.log(estado)
        this.turno = turno
        this.oponente = turno=='1'?'0':'1'
        this.estado = estado
        this.deph = deph
        this.maximizar = maximizar
        this.heuristica = 0
        this.hijos = []
        this.listaMovimientos = []
        this.listaMovimientosOpp = []
    }    
    generarHeuristicas(){
        if(this.hijos.length==0){
            this.heuristica = this.calcularHeuristica(this.estado);
        }else{
            for(let hijo of this.hijos){
                hijo.generarHeuristicas()
            }
            this.heuristica = this.hijos[0].heuristica;
            for(let hijo of this.hijos){
                if(this.maximizar&&hijo.heuristica>this.heuristica){
                    this.heuristica = hijo.heuristica
                }
                if((!this.maximizar)&&hijo.heuristica<this.heuristica){
                    this.heuristica = hijo.heuristica
                }
            }
        }
    }

    generarSucesores(maxdeph){
        for(let i=0;i<8;i++){
            for(let j=0;j<8;j++){//revisa en todas las posiciones si hay movimiento posible 
                let movimiento = this.canMove(i, j);
                //console.log(movimiento)
                if(movimiento!=null){
                    this.listaMovimientos.push(movimiento)
                }
                let movimientoOpp = this.canMoveOponente(i, j);
                if(movimientoOpp!=null){
                    this.listaMovimientosOpp.push(movimientoOpp)
                }
            }
        }
        //console.log(this.listaMovimientos)
        if(this.deph==maxdeph){   
            return;
        }
        
        for(let movimiento of this.listaMovimientos){
            let nuevohijo = new Nodo(this.oponente, movimiento.nuevoestado, this.deph+1, !this.maximizar)
            nuevohijo.generarSucesores(maxdeph)
            this.hijos.push(nuevohijo)
        }
    }
    
    canMove(fila, columna){
        if(this.estado[fila][columna]!='2'){
            return null; //si está ocupada ni hay que revisar
        }else{
            let totalcaptured = 0;
            let newState = this.copiarEstado();
            let directions = [[-1,-1], [-1,0], [-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1]]
            newState[fila][columna] = this.turno;
            //console.log(newState)
            for(let k = 0; k<8 ; k++){
                let dir = directions[k];
                let i = fila + dir[0];
                let j = columna + dir[1];
                let flagBlank = true;
                let flagOwn = true;
                let captured = 0;
                while(flagBlank&&flagOwn&&i>=0&&i<8&&j>=0&&j<8){
                    if(this.estado[i][j]=='2'){
                        flagBlank = false;
                    }else if(this.estado[i][j]==this.turno){
                        flagOwn = false;
                    } else if(this.estado[i][j]==this.oponente){
                        captured++;
                        newState[i][j] = this.turno;
                    }
                    i+=dir[0];
                    j+=dir[1];
                }
                if(!flagOwn&&captured>0){
                    totalcaptured+=captured    
                }
            }
            if(totalcaptured>0){
                return new Movimiento(fila, columna, totalcaptured, newState)
            }
            return null 
        }
    }
       canMoveOponente(fila, columna){
        if(this.estado[fila][columna]!='2'){
            return null; //si está ocupada ni hay que revisar
        }else{
            let totalcaptured = 0;
            let newState = this.copiarEstado();
            let directions = [ [1,1], [1,0], [1,-1], [0,-1],[-1,-1], [-1,0], [-1,1], [0,1], [1,1], [1,0], [1,-1], [0,-1]]
            newState[fila][columna] = this.turno;
            for(let k = 0; k<8 ; k++){
                let dir = directions[k];
                //console.log (dir)
                let i = fila + dir[0];
                let j = columna + dir[1];
                let flagBlank = true;
                let flagOwn = true;
                let captured = 0;
                while(flagBlank&&flagOwn&&i>=0&&i<8&&j>=0&&j<8){
                    if(this.estado[i][j]=='2'){
                        flagBlank = false;
                        continue;
                    }
                    if(this.estado[i][j]==this.oponente){
                        flagOwn = false;
                        continue;
                    }
                    if(this.estado[i][j]==this.turno){
                        totalcaptured++;
                        newState[i][j] = this.oponente;
                    }
                    i+=dir[0];
                    j+=dir[1];
                }
                if(!flagOwn&&captured>0){
                    totalcaptured+=captured    
                }
            }
            if(totalcaptured>0){
                return new Movimiento(fila, columna, totalcaptured, newState)
            }
            return null
        }
    }
 
    calcularHeuristica(grid)  {
        let my_color = this.turno;
        let opp_color = this.oponente;
        let my_tiles = 0, opp_tiles = 0, i, j, k, my_front_tiles = 0, opp_front_tiles = 0, x, y;
        let p = 0, c = 0, l = 0, m = 0, f = 0, d = 0;
    
        let X1 = [-1, -1, 0, 1, 1, 1, 0, -1];
        let Y1 = [0, 1, 1, 1, 0, -1, -1, -1];
        /*let V = [
         [20, -3, 11,  8,  8, 11, -3, 20],
         [-3, -7, -4,  1,  1, -4, -7, -3],
         [11, -4,  2,  2,  2,  2, -4, 11],
         [ 8,  1,  2, -3, -3,  2,  1,  8],
         [ 8,  1,  2, -3, -3,  2,  1,  8],
         [11, -4,  2,  2,  2,  2, -4, 11],
         [-3, -7, -4,  1,  1, -4, -7, -3],
         [20, -3, 11,  8,  8, 11, -3, 20]
        ]*/
        let V = [
            [120, -20, 20,  5,  5, 20, -20, 120],
            [-20, -40, -5, -5, -5, -5, -40, -20],
            [ 20,  -5,  15, 3,  3, 15,  -5,  20],
            [  5,  -5,  3,  3,  3,  3,  -5,   5],
            [  5,  -5,  3,  3,  3,  3,  -5,   5],
            [ 20,  -5,  15, 3,  3, 15,  -5,  20],            
            [-20, -40, -5, -5, -5, -5, -40, -20],
            [120, -20, 20,  5,  5, 20, -20, 120]
           ]
    
    // Piece difference, frontier disks and disk squares
        for(let i=0; i<8; i++){
            for(let j=0; j<8; j++)  {
                if(grid[i][j] == my_color)  {
                    d += V[i][j];
                    my_tiles++;
                } else if(grid[i][j] == opp_color)  {
                    d -= V[i][j];
                    opp_tiles++;
                }
                if(grid[i][j] != '2')   {
                    for(k=0; k<8; k++)  {
                        x = i + X1[k]; 
                        y = j + Y1[k];
                        if(x >= 0 && x < 8 && y >= 0 && y < 8 && grid[x][y] == '2') {
                            if(grid[i][j] == my_color){ 
                                my_front_tiles++;
                            }
                            else{
                             opp_front_tiles++;
                            }
                            break;
                        }
                    }
                }
            }
        }
        if(my_tiles > opp_tiles){
            p = (100.0 * my_tiles)/(my_tiles + opp_tiles);
        }else if(my_tiles < opp_tiles){
            p = -(100.0 * opp_tiles)/(my_tiles + opp_tiles);
        }
        else {
            p = 0;
        }
    
        if(my_front_tiles > opp_front_tiles){
            f = -(100.0 * my_front_tiles)/(my_front_tiles + opp_front_tiles);
        } else if(my_front_tiles < opp_front_tiles){
            f = (100.0 * opp_front_tiles)/(my_front_tiles + opp_front_tiles);
        }
        else {
            f = 0;
        }
    
    // Corner occupancy
        my_tiles = 0;
        opp_tiles = 0;
        if(grid[0][0] == my_color){ 
            my_tiles++;
        } else if(grid[0][0] == opp_color) {
            opp_tiles++; 
        }
        if(grid[0][7] == my_color) { 
            my_tiles++;
        }else if(grid[0][7] == opp_color) {
            opp_tiles++; 
        }
        if(grid[7][0] == my_color){ 
            my_tiles++;
        }else if(grid[7][0] == opp_color){
             opp_tiles++;
        }
        if(grid[7][7] == my_color) {
            my_tiles++;
        }
        else if(grid[7][7] == opp_color){ 
            opp_tiles++;
        }
        c = 25 * (my_tiles - opp_tiles);
    
    // Corner closeness
        my_tiles = 0;
        opp_tiles = 0;
        if(grid[0][0] == '2')   {
            if(grid[0][1] == my_color) {
                my_tiles++;
            }else if(grid[0][1] == opp_color) {
                opp_tiles++;
            }
            if(grid[1][1] == my_color) {
                my_tiles++;
            }else if(grid[1][1] == opp_color) {
                opp_tiles++;
            }if(grid[1][0] == my_color) {
                my_tiles++;
            }else if(grid[1][0] == opp_color) {
                opp_tiles++;
            }
        }
        if(grid[0][7] == '2')   {
            if(grid[0][6] == my_color) {
                my_tiles++;
            }else if(grid[0][6] == opp_color){ 
                opp_tiles++;
            }
            if(grid[1][6] == my_color) {
                my_tiles++;
            }else if(grid[1][6] == opp_color){
                opp_tiles++;
            }
            if(grid[1][7] == my_color){ 
                my_tiles++;
            }else if(grid[1][7] == opp_color){ 
                opp_tiles++;
            }
        }

        if(grid[7][0] == '2')   {
            if(grid[7][1] == my_color){ my_tiles++;}
            else if(grid[7][1] == opp_color){ opp_tiles++;}
            if(grid[6][1] == my_color){ my_tiles++;}
            else if(grid[6][1] == opp_color){ opp_tiles++;}
            if(grid[6][0] == my_color) {my_tiles++;}
            else if(grid[6][0] == opp_color) {opp_tiles++;}
        }
        if(grid[7][7] == '2')   {
            if(grid[6][7] == my_color){ my_tiles++;}
            else if(grid[6][7] == opp_color){ opp_tiles++;}
            if(grid[6][6] == my_color){ my_tiles++;}
            else if(grid[6][6] == opp_color){ opp_tiles++;}
            if(grid[7][6] == my_color){ my_tiles++;}
            else if(grid[7][6] == opp_color){ opp_tiles++;}
        }
        l = -12.5 * (my_tiles - opp_tiles);
    
    // Mobility
        my_tiles = this.listaMovimientos.length;
        opp_tiles = this.listaMovimientosOpp.length;
        if(my_tiles > opp_tiles){
            m = (100.0 * my_tiles)/(my_tiles + opp_tiles);
        }else if(my_tiles < opp_tiles){
            m = -(100.0 * opp_tiles)/(my_tiles + opp_tiles);
        }else{ m = 0;}
    
    // final weighted score
        let score = (10 * p) + (801.724 * c) + (382.026 * l) + (78.922 * m) + (74.396 * f) + (10 * d);
        return score;
    }
    
    copiarEstado(){
        let nuevoestado = []
        for(let i=0; i<8; i++){
            nuevoestado.push([])
            for(let j=0; j<8; j++){
                nuevoestado[i].push(this.estado[i][j])
            }
        } 
        return nuevoestado
    }
    
}
module.exports = Nodo