/*
var databaseUrl = 'mydb';
var collections = ['users']
var db = require('mongojs').connect(databaseUrl, collections);
*/
var mongojs = require('mongojs');
var db = mongojs('groupnotedb', ['users', 'uni','units']);

module.exports = db;