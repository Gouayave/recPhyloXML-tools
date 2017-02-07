var exports = module.exports = {};

var cladeUtil = require('./cladeUtil.js');
var flatEvents = require('./flatEvents');
var rpXMLtorpJSON = require('./rpXMLtorpJSON.js');


function exploseTree (xml,callback) {
  rpXMLtorpJSON.rpXMLString2rpJSON(xml,function (err,result) {
    var cladeRoot = result.recGeneTree.phylogeny.clade;
    var explosedTreeRoot = flatEvents.traverseTree(cladeRoot);
    callback(err,explosedTreeRoot);
  });
}

exports.exploseTree = exploseTree;
