
const express = require('express')
const app = express()
const port = process.env.PORT||3000 

app.get('/', (req, res) => {
  console.log(req.query.turno)
  console.log(req.query.estado)
  var turno = req.query.turno
  var estado = req.query.estado
  if(turno!= undefined && estado!=undefined){
    res.end('20')
  }else{
      res.end('20')
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

function toMatrix(){
    var matrix = []
    return 0
}