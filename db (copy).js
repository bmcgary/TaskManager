var MongoClient = require('mongodb').MongoClient,
	Server = require('mongodb').Server;
//   , format = require('util').format;

var mongo = require('mongodb');

var serverOptions = {'auto_reconnect':true,'poolSize':10};

var client = new MongoClient(new Server('localhost',27017, serverOptions), {});


function addAUser(name,password, res)
{
	client.open(function(err,client) //open database
		{
			var db = client.db('Tasks');

			db.collection('tasks').find({username:name}).toArray(function(err,docs){			
				if(docs.length <= 0)
				{
					db.collection('tasks').insert({username:name,pass:password,salt:'SALT',tasks:[]},{w:1}, function(err,doc){
					db.close();
					if(err)
					{
						console.log("There was an error " + err);
						res.json({message:'failed'});
					}
					else
					{
						res.json({message:'success'});
					}	
					});
					
				}
				else  //user already there. send error message
				{
					res.json({message:'duplicate'});
					db.close();
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
				res.json({message:'false:no user'});
			}
			else
			{
				if(docs[0].pass === password) //validate user
				{
					//add new tasks
					db.collection('tasks').update({username:name},{$addToSet:{tasks:{$each:lists.add}}},function(err,docs){
						console.log("update done ");
						if(!err)
						{
							//delete exsiting tasks
							//console.log(lists.delete);

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
									res.json({message:'failed db update'});
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
					res.json({message:'false:bad password'});
				}
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
				res.json({message:'false'});
			}
			else
			{
				if(docs[0].pass === password)
				{
					res.json({message:'true'});
				}				
				else
				{
					res.json({message:'false'});
				}
			}
		
		});
	});
}

exports.addAUser = addAUser;
exports.login = login;
exports.updateList = updateList; 
