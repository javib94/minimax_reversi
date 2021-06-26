
const Nodo = require("./Nodo.js")

class Minimax{
    constructor(turno, estadoinicial, maxdeph){
        this.root = new Nodo(turno, estadoinicial, 0, false)
        this.maxdeph = maxdeph
    }
    ejecutar(){
        
        this.root.generarSucesores(3);
        this.root.generarHeuristicas();
        //console.log("raiz: ", this.root.hijos)
        for(let i in this.root.hijos){
            if(this.root.hijos[i].heuristica == this.root.heuristica){
                return this.root.listaMovimientos[i]
            }
        }
    }
}

module.exports = Minimax