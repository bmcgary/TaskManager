var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var routesHandled = require('./routesHandled');



app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = 1337;

var router = express.Router();

router.post('/register',function(req,res){output(req,"register");routesHandled.addAUser(req,res)});
router.post('/login',function(req,res){output(req,"login");routesHandled.login(req,res)});
router.post('/updateList',function(req,res){output(req,"updateList");routesHandled.updateList(req,res)});
router.post('/getAllTasks',function(req,res){output(req,"getAllTasks");routesHandled.getAllTasks(req,res)});
router.post('/addTask',function(req,res){output(req,"addTask");routesHandled.addTask(req,res)});
router.post('/deleteTask',function(req,res){output(req,"deleteTask");routesHandled.deleteTask(req,res)});
router.get('/test',function(req,res){output(req,"test");res.json({message:'default'});});

app.use('/',router);

app.listen(port);
console.log("Server started");

function output(req,origin)
{
	console.log("Time:" + Date() + " IP:" + req.connection.remoteAddress + " At:" + origin);
}
