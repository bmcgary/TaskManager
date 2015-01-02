var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routesHandled = require('./routesHandled');



app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 1337;

var router = express.Router();

router.get('/regester',function(req,res){routesHandled.addAUser(req,res)});
router.get('/login',function(req,res){routesHandled.login(req,res)});
router.post('/updateList',function(req,res){routesHandled.updateList(req,res)});
router.post('/getAllTasks',function(req,res){routesHandled.getAllTasks(req,res)});
router.post('/addTask',function(req,res){routesHandled.addTask(req,res)});
router.post('/deleteTask',function(req,res){routesHandled.deleteTask(req,res)});
router.get('/test',function(req,res){res.json({message:'default'});});

app.use('/',router);

app.listen(port);
console.log("Server started");

