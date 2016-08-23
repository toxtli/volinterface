var config = require('./config.js');
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var app = express();
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var url = '';
var db = null;

String.prototype.startsWith = function(prefix) {
    return this.indexOf(prefix) === 0;
}

String.prototype.endsWith = function(suffix) {
    return this.match(suffix+"$") == suffix;
};

MongoClient.connect(config.DB_URL, function(err, dbObj) {
	console.log(err);
	db = dbObj;
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.get('/', function (req, res) {
	var params = req.query;
	res.json({'Hello':1});
});

router.route('/db/:table?/:id?')
	.get(function(req, res) {
		if (req.params.table != undefined) {
			var table = req.params.table;
			if (req.params.id == undefined) {
				if (req.query) {
					if (req.query.q != undefined) {
						try {
							var params = JSON.parse(req.query.q);
							params = analizeParams(params);
							db.collection(table).find(params).toArray(function(err, results){
							    res.json(results);
							});
						} catch(e) {
							res.json({error:'Selector is in a bad format.'});
						}
					} else {
						req.query = analizeParams(req.query);
						db.collection(table).find(req.query).toArray(function(err, results){
							res.json(results);
						});
					}
				} else {
					db.collection(table).find({}).toArray(function(err, results){
					    res.json(results);
					});
				}
			} else {
				var id = new ObjectID(req.params.id);
				db.collection(table).find({'_id':id}).toArray(function(err, results){
				    res.json(results);
				});
			}
		} else {
			res.json({error:'Table was not provided.'});
		}
	})
	.post(function(req, res) {
		if (req.params.table != undefined) {
			var table = req.params.table;
			if (Object.keys(req.body).length > 0) {
				db.collection(table).insertOne(req.body, function(err, result){
					res.json({status:'OK'});
				});
			} else if (req.query) {
				db.collection(table).insertOne(req.query, function(err, result){
					res.json({status:'OK'});
				});
			} else {
				res.json({error:'No data provided.'});
			}
		} else {
			res.json({error:'Table was not provided.'});
		}
	})
	.put(function(req, res) {
		console.log('ENTREEE');
		if (req.params.table != undefined) {
			if (Object.keys(req.body).length > 0) {
				var table = req.params.table;
				if (req.params.id == undefined) {
					if (req.query) {
						if (req.query.q != undefined) {
							try {
								var params = JSON.parse(req.query.q);
								params = analizeParams(params);
								db.collection(table).updateOne(params, {$set:req.body}, function(err, results){
								    res.json({status:'OK'});
								});
							} catch(e) {
								res.json({error:'Selector is in a bad format.'});
							}
						} else {
							req.query = analizeParams(req.query);
							db.collection(table).updateOne(req.query, {$set:req.body}, function(err, results){
								res.json({status:'OK'});
							});
						}
					} else {
						res.json({error:'Selector is not present.'});
					}
				} else {
					var id = new ObjectID(req.params.id);
					db.collection(table).updateOne({'_id':id}, {$set:req.body}, function(err, results){
					    res.json({status:'OK'});
					});
				}
			} else {
				res.json({error:'Data was not provided.'});
			}
		} else {
			res.json({error:'Table was not provided.'});
		}
	})
	.delete(function(req, res) {
		if (req.params.table != undefined) {
			var table = req.params.table;
			if (req.params.id == undefined) {
				if (req.query) {
					if (req.query.q != undefined) {
						try {
							var params = JSON.parse(req.query.q);
							params = analizeParams(params);
							db.collection(table).deleteOne(params, function(err, results){
					    		res.json({status:'OK'});
							});
						} catch(e) {
							res.json({error:'Selector is in a bad format.'});
						}
					} else {
						req.query = analizeParams(req.query);
						db.collection(table).deleteOne(req.query, function(err, results){
				    		res.json({status:'OK'});
						});
					}
				} else if (Object.keys(req.body).length > 0) {
					req.body = analizeParams(req.body);
					db.collection(table).deleteOne(req.body, function(err, results){
			    		res.json({status:'OK'});
					});
				} else {
					res.json({error:'No selected criteria.'});
				}
			} else {
				var id = new ObjectID(req.params.id);
				db.collection(table).deleteOne({'_id':id}, function(err, results){
				    res.json({status:'OK'});
				});
			}
		} else {
			res.json({error:'Table was not provided.'});
		}
	});

app.use('/api', router);

app.get('/db/save', function (req, res) {
	var params = req.query;
	db.collection('results').insertOne(params, function(err, result){
		console.log('Message stored.');
	});
	res.end(params.name);
});

var server = app.listen(config.PORT, function () {
	var host = server.address().address
	var port = server.address().port
	console.log("Example app listening at http://%s:%s", host, port);
});

function analizeParams(params) {
	for (var i in params) {
		var value = params[i];
		if (typeof value == 'string') {
			if (value.startsWith('%') && value.endsWith('%')) {
				value.pop();
				value.shift();
				params[i] = new RegExp(value, 'i');
			}
		}
	}
	return params;
}