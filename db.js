var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server;
//   , format = require('util').format;

var mongo = require('mongodb');

var serverOptions = {'auto_reconnect':true,'poolSize':10};

var client = new MongoClient(new Server('localhost',27017, serverOptions), {});

var stringGen = require('crypto');


function addAUser(name,password, res)
{
	client.open(function(err,client) //open database
		{
			var db = client.db('Tasks');

			db.collection('tasks').find({username:name}).toArray(function(err,docs){			
				if(docs.length <= 0)
				{
					//create salt
					stringGen.randomBytes(48, function(ex, buf) {

						var token = buf.toString('base64').replace(/\//g,'_').replace(/\+/g,'-');
						password += token;
						var signature = encryptPassword(password);
					
						db.collection('tasks').insert({username:name,pass:signature,salt:token},{w:1}, function(err,doc){
						db.close();
						if(err)
						{
							console.log("Add a user error " + err);
							res.json({message:'failed'});
						}
						else
						{
							res.json({message:'success'});
						}	
						});
					});					
				}
				else  //user already there. send error message
				{
					res.json({message:'failed:duplicate'});
					db.close();
				}		
			});
		});
}

function login(name,password,res)
{
	client.open(function (err,client){
		var db = client.db('Tasks');
		db.collection('tasks').find({username:name}).toArray(function(err,docs){
			db.close();			
			if(docs.length <= 0)
			{
				res.json({message:'failed:no user by that name'});
			}
			else
			{
				var signature = encryptPassword(password+docs[0].salt);
				if(docs[0].pass === signature)
				{
					res.json({message:'success'});
				}				
				else
				{
					res.json({message:'failed: wrong password'});
				}
			}
		
		});
	});
}

function updateList(name,password,lists,res)
{
	client.open(function (err,client){
		var db = client.db('Tasks');
		db.collection('tasks').find({username:name}).toArray(function(err,docs){
						
			if(docs.length <= 0)
			{
				db.close();
				res.json({message:'failed:no user'});
			}
			else
			{
				//go check password and return token
				var token = encryptPassword(password+docs[0].salt);
				if(docs[0].pass === token) //validate user
				{
					//add new tasks
					db.collection('tasks').update({username:name},{$addToSet:{tasks:{$each:lists.add}}},function(err,docs){
						//console.log("update done ");
						if(!err)
						{
							//delete exsiting tasks
							db.collection('tasks').update({username:name},{$pullAll:{tasks:lists.delete}},function(err,doc){
								if(!err)
								{
									//close transaction as true
									res.json({message:'success'});
								}						
								else
								{
									console.log('Error on delete: ' + err);
									//close trasaction as false
									res.json({message:'failed: db update'});
								}
							db.close();
							});
							
						} 
						else
						{
							console.log('Error on add: ' + err);
							//close transaction false							
							db.close();	
							res.json({message:'failed db update'});						
						}
						 
					});
				}				
				else
				{
					db.close();
					res.json({message:'failed:bad password'});
				}
			}
			
		});
	});
}

function getAllTasks(username,password,res)
{
	client.open(function (err,client){
		var db = client.db('Tasks');
		db.collection('tasks').find({username:username}).toArray(function(err,docs){
					
			if(docs.length <= 0)
			{
				db.close();
				res.json({message:'failed:no user'});
			}
			else
			{
				//go check password and return token
				var token = encryptPassword(password+docs[0].salt);
				if(docs[0].pass === token) //validate user
				{
					var list = [];
					//organize tasks into sections.
					for(var i = 0; i < docs[0].tasks.length;i++)
					{
						list.push(docs[0].tasks[i]);
						/*if(!(docs[0].tasks[i].section in myMap))
						{
							myMap[docs[0].tasks[i].section] = [];
						}
						//save the task name and status to the section array
						var tempTask = {};
						tempTask['name'] = docs[0].tasks[i].name;
						tempTask['status'] = docs[0].tasks[i].status;
						(myMap[docs[0].tasks[i].section]).push(docs[0].tasks[i]);*/
					} 
					res.json({message:"success",tasks:list});
				}
				else
				{
					res.json({message:'failed:bad password'});
				}
			}
			db.close();
		});
	});
}

//add A Task function
function addATask(name,password,addList,res)
{
	client.open(function (err,client){
		var db = client.db('Tasks');
		db.collection('tasks').find({username:name}).toArray(function(err,docs){
						
			if(docs.length <= 0)
			{
				db.close();
				res.json({message:'failed:no user'});
			}
			else
			{
				//go check password and return token
				var token = encryptPassword(password+docs[0].salt);
				if(docs[0].pass === token) //validate user
				{
					//add new tasks
					db.collection('tasks').update({username:name},{$addToSet:{tasks:{$each:addList}}},function(err,docs){
						if(!err)
							res.json({message:'success'});
						else
							res.json({message:'failed'});
						db.close();
					});
				}
				else
				{
					db.close();
					res.json({message:'failed:invalid password'});
				}
			}
		});
	});
}
//delete A Task function
function deleteATask(name,password,deleteList,res)
{
	client.open(function (err,client){
		var db = client.db('Tasks');
		db.collection('tasks').find({username:name}).toArray(function(err,docs){
						
			if(docs.length <= 0)
			{
				db.close();
				res.json({message:'failed:no user'});
			}
			else
			{
				//go check password and return token
				var token = encryptPassword(password+docs[0].salt);
				if(docs[0].pass === token) //validate user
				{
					//add new tasks
					db.collection('tasks').update({username:name},{$pullAll:{tasks:deleteList}},function(err,docs){
						if(!err)
							res.json({message:'success'});
						else
							res.json({message:'failed'});
						db.close();
					});
				}
				else
				{
					db.close();
					res.json({message:'failed:invalid password'});
				}
			}
		});
	});
}


function encryptPassword(password)
{
	var crypto = require('crypto'),hmac,signature;
	hmac = crypto.createHmac("sha1",'passwordSecrete');
	hmac.update(password);
	signature = hmac.digest("hex");
	//console.log(signature);
	return signature;
}

exports.addAUser = addAUser;
exports.login = login;
exports.updateList = updateList; 
exports.getAllTasks = getAllTasks;
exports.addATask = addATask;
exports.deleteATask = deleteATask;
