var express = require('express')
var app = express()
var cors = require('cors')
var port = 3000;

var corsOptions = {
 origin:'http://localhost:3001',
 methods:['GET','POST']
}

app.use(cors(corsOptions))

app.get('/get',(request,response)=>{
    response.send("Get Request Received")
})

app.get('/params/:id',(req, res)=>{
    res.send(req.params.id)
});

var f1 = (req, res, next)=>{next();};
var f2 = (req, res, next)=>{next();};
var f3 = (req, res)=>{res.status(500).send("SERIES CALLBACKS EXECUTED")};

app.get('/series/callbacks',[f1,f2,f3])

app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})