var db = require('./db');

function addAUser(req,res)
{
	//console.log(req.body.username);
	//res.json(req.body.username);

	db.addAUser(req.body.username,req.body.password,res);
}

function login(req,res)
{
	db.login(req.body.username,req.body.password,res);
}

function updateList(req,res)
{
	db.updateList(req.body.username,req.body.password,req.body.lists,res);
}

function getAllTasks(req,res)
{
	db.getAllTasks(req.body.username,req.body.password,res);
}

function addATask(req,res)
{
	db.addATask(req.body.username,req.body.password,req.body.addlist,res);
}

function deleteATask(req,res)
{
	db.deleteATask(req.body.username,req.body.password,req.body.deletelist,res);
}

exports.addAUser = addAUser;
exports.login = login;
exports.updateList = updateList;
exports.getAllTasks = getAllTasks;
exports.addTask = addATask;
exports.deleteTask = deleteATask;


