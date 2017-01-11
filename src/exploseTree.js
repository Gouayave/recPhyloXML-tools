var exports = module.exports = {};

cladeUtil = require('./cladeUtil.js');
flatEvents = require('./flatEvents');
rpXMLtorpJSON = require('./rpXMLtorpJSON');


function exploseTree (path,callback) {
  rpXMLtorpJSON.rpXMLFile2rpJSON(path,function (err,result) {
    var cladeRoot = result.recGeneTree.phylogeny.clade;
    var explosedTreeRoot = flatEvents.traverseTree(cladeRoot);
    callback(err,explosedTreeRoot);
  });
}

exports.exploseTree = exploseTree;
