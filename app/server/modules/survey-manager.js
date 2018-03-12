var crypto 		= require('crypto');
var MongoDB 	= require('mongodb').Db;
var Server 		= require('mongodb').Server;
var moment 		= require('moment');
var fsx = require('fs-extra');
var fs = require('fs'); //file system
var path = require('path');
var loader = require('./collection-loader');
var GL = require('../global');
var AN = require('./annotation-manager');

var dbPort 		= 27017;
var dbHost 		= 'localhost';
var dbName 		= 'suave';


/* establish the database connection */

var db = new MongoDB(dbName, new Server(dbHost, dbPort, {auto_reconnect: true}), {w: 1});
	db.open(function(e, d){
	if (e) {
		console.log(e);
	}
});

var surveys = db.collection('surveys_test');

/*Create a new survey
para: 1. files: req parameter
			2. user: user name
			3. callback: callback function with an error parameter
*/
exports.createNewSurvey = function(files, user, callback){
	//find the survey in database
	var name = files.body.name.replace(/[^\w]/gi, '_');
  surveys.findOne({"name": name, "user": user}, function(e, o){
		if (o){
			callback("Name is taken");
		}
    else{
			//read the raw file
      fs.readFile(files.file.path, function(err, data){
				if (!fs.existsSync(__dirname + "/../../public/surveys")){
			    fs.mkdirSync(__dirname + "/../../public/surveys");
			  }

        var newPath = __dirname + "/../../public/surveys/"+user+"_"
          +name+".csv";
				//save the survey
				fs.writeFile(newPath, data, function(err){
          if(err){
            callback(err);
          }else{
						var date = new Date();
						//save into the database
            surveys.insert({"fullname":files.body.name ,"name": name, "user": user,
            "csv": newPath, "view": "grid", "views": 111000, "collection": "default",
						 "hidden": 0, "date":date.toString(), "originalname": files.file.originalname}, callback);
          }
        });

				//initialize the about survey page
				var aboutPath = __dirname + "/../../public/surveys/"+user+"_"
          +name+"about.html"
					var aboutContent = GL.getAbout(1) + files.body.name + GL.getAbout(2)
					+ GL.getAbout(3) + GL.getAbout(4) + GL.getAbout(5);
				fs.writeFile(aboutPath, aboutContent, function(err){
          if(err){
            callback(err);
          }
        });
      });
    }
	});
}

/*Replace a survey with a new csv
para: 1. files: req parameter
			2. user: user name
			3. callback: callback function with 1) error 2) output
*/
exports.replaceSurvey = function(files, user, callback){
	//find the survey in the database
  surveys.findOne({"name": files.body.name, "user": user}, function(e, o){
		if (e){
			callback("Survey does not exist!");
		}
    else{
			var survey = o;
			//reset the survey's paramters in database
			surveys.findAndModify({"name":files.body.name, "user": user}, [["name", '1']],
			{$set: {collection: {name: "default"}, iName: "", "originalname": files.file.originalname}},
			{new:true}, function(e, o){
				if(e) callback(e);
			});

			/*
			surveys.findAndModify({"name":files.body.name, "user": user}, [["name", '1']],
			{$set: {iName: ""}}, {new:true}, function(e, o){
				if(e) callback(e);
			});*/

			//read new raw csv file
      fs.readFile(files.file.path, function(err, data){
				if (!fs.existsSync(__dirname + "/../../public/surveys")){
			    fs.mkdirSync(__dirname + "/../../public/surveys");
			  }

				var name = files.body.name.replace(/ /g,"-");
        var newPath = __dirname + "/../../public/surveys/"+user+"_"
          +name+".csv";
				//save the file
        fs.writeFile(newPath, data, function(err){
          if(err){
            callback(err);
          }else{
						callback(null, survey);
          }
        });
      });
    }
	});
}

/*Change the image collection for a survey
para: 1. files: req parameter
			2. user: user name
			3. collection: collection json
			4. callback: callback function with an error parameter
*/
exports.changeCollection = function(files, user, collection, callback){
	var imgPath = __dirname + "/../../public/surveys/"+user+"_"
		+files.body.name;
	if (!fs.existsSync(imgPath)){
		fs.mkdirSync(imgPath);
	}
	var filePath = __dirname + "/../../public/surveys/"+user+"_"
		+files.body.name+".csv";

	//modify the paras in database
	surveys.findAndModify({"name":files.body.name, "user": user}, [["name", '1']],
	{$set: {collection: collection}}, {new:true}, function(e, o){
		if(e) callback(e);
	});

	//modify and save the csv file
	var data;
	if(!collection.name) collection = JSON.parse(collection);
	loader.setCSV(filePath, collection, function(o, message){
		if(o == "err"){
			callback(message);
		}else{
			data = o;
			imgIndex = data[0].indexOf('#img');
			imgSet = {};
			for(var i = 1; i < data.length; i++){
				if(!imgSet[data[i][imgIndex]]) imgSet[data[i][imgIndex]] = 1;
			}

			loader.saveCSV(filePath, data, function(error){
				if(error){
					callback("Unable to save file");
				}else{
					loader.copyImages(imgPath, Object.keys(imgSet), function(error){
						if(error){
							callback("Unable to match image set");
						}else{
							callback(null);
						}
					})
				}
			});
		}
	});
}

/*Change the image definition for a survey
para: 1. files: req parameter
			2. user: user name
			3. collection: dzc url
			4. callback: callback function with an error parameter
*/
exports.changeImageDefinition = function(files, user, dzc, callback){
	//modify the paras in database
	surveys.findAndModify({"name":files.body.name, "user": user}, [["name", '1']],
	{$set: {"dzc": dzc}}, {new:true}, function(e, o){
		if(e) callback(e);
		else callback(null);
	});
}

/*Change #name tag for the csv file
para: 1. files: req parameter
			2. user: user name
			3. callback: callback function with an error parameter
*/
exports.changeCollectionItemName = function(files, user, callback){
	var filePath = __dirname + "/../../public/surveys/"+user+"_"
		+files.body.name+".csv";

	surveys.findAndModify({"name":files.body.name, "user": user}, [["name", '1']],
	{$set: {iName: files.body.iName}}, {new:true}, function(e, o){
		if(e) callback(e);
	});

	//load csv data
	var data;
	loader.setCSViName(filePath, files.body.iName, function(o){
		if(o == "err"){
			callback("Unable to read file");
		}else{
			data = o;
			loader.saveCSV(filePath, data, function(e){
				if(e){
					callback("Unable to save file")
				}else{
					callback(null);
				}
			});
		}
	});
}

/*Get surveys for a user
para: 1. username
			2. callback: callback function with 1) error 2) output
*/
exports.getSurveyByUsername = function(username, callback)
{
	surveys.find({user: username}).toArray(function(e, o){
		callback(null, o);
	});
}

/*Get surveys for users
para: 1. usernames
			2. callback: callback function with 1) error 2) output
*/
exports.getSurveysByUserList = function(usernames, callback)
{
	var users = usernames.map(function(user){return user.user});

	surveys.aggregate([
    // Match the selected documents by "user"
    { "$match": {"user": { "$in": users } }}
	], function(e, o){
		if (e) {
			callback(e, null);
		} else{
			callback(e, o);
		}
	});
}

/*Get unhidden surveys for public purpose
para: 1. username
			2. callback: callback function with 1) error 2) output
*/
exports.getPublicSurveyByUsername = function(username, callback)
{
	surveys.find({user: username, "hidden": 0}).toArray(function(e, o){
		callback(null, o);
	});
}

/*Delete all surveys
para: 1. callback: callback function with 1) error
*/
exports.delAllRecords = function(callback)
{
	var tmp = __dirname + "/../surveys/*";
  var files = __dirname + "/../../public/surveys/*";
  fsx.remove(tmp, function(err){
    if(err) return console.error(err);
  });
  fsx.remove(files, function(err){
    if(err) return console.error(err);
  });
	surveys.remove({}, callback);
}

/*Delete surveys for a user
para: 1. user: username
			2. callback: callback function with 1) error 2) output
*/
exports.deleteSurvey = function(user, callback)
{
  var tmp = __dirname + "/../surveys/*";
  var file = __dirname + "/../../public/surveys/"+user+"_*";
  fsx.remove(tmp, function(err){
    if(err) return console.error(err);
  });
  fsx.remove(file, function(err){
    if(err) return console.error(err);
  });

	surveys.find({"user": user}, {name: 1}).toArray(function(error, survey){
		for(var i = 0; i < survey.length; i++){
			AN.deleteSnapshotsBySurvey(survey[i].name, user, function(e, o){
				if(e) callback(e);
			});
		}
		surveys.remove({"user": user}, callback);
	});
}

/*Delete a survey
para: 1. filename
			2. user: username
			2. callback: callback function with 1) error
*/
exports.deleteSurveyByName = function(filename, user, callback)
{
  var tmp = __dirname + "/../surveys/*";
  var file = __dirname + "/../../public/surveys/"+user+"_"+filename+"*";
  fsx.remove(tmp, function(err){
    if(err) return console.error(err);
  });
  fsx.remove(file, function(err){
    if(err) return console.error(err);
  });
	surveys.remove({"name": filename, "user": user});
	AN.deleteSnapshotsBySurvey(filename, user, function(e, o){
		if(e) callback(e);
		else callback();
	});
}

/*Hide a survey by filename and user
para: 1. filename
			2. user: username
			3. callback: callback function with 1) error 2) output
*/
exports.hideSurveyByNameID = function(filename, user, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			if(o.hidden == 1) o.hidden = 0;
			else o.hidden = 1;
			surveys.save(o, callback);
		}
	});
}

/*Change a survey's default view
para: 1. filename
			2. user: username
			3. view: default view to be updated
			4. callback: callback function with 1) error 2) output
*/
exports.changeViewByNameID = function(filename, user, view, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			o.view = view;
			surveys.save(o, callback);
		}
	});
}

/*Change a survey's view options
para: 1. filename
			2. user: username
			3. view: view options to be updated
			4. callback: callback function with 1) error 2) output
*/
exports.changeViewOptionsByNameID = function(filename, user, views, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			o.views = views;
			surveys.save(o, callback);
		}
	});
}

/*Get a survey's view options
para: 1. filename
			2. user: username
			3. callback: callback function with 1) error 2) output
*/
exports.getViewOptionsByName = function(filename, user, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			callback(null, o.views);
		}
	});
}

exports.getSurveyDzc= function(user, filename, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			callback(null, o.dzc);
		}
	});
}

exports.changeSurveyDzc = function(filename, user, dzc, callback)
{
	surveys.findOne({"name":filename, "user": user}, function(e, o){
		if (e){
			callback(e);
		}	else{
			o.dzc = dzc;
			surveys.save(o, callback);
		}
	});
}
