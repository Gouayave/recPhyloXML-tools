const parse = require('../modules/parse.js');
const flatTree = require('../modules/flatTree.js');
const fs = require('fs');
const assert = require('assert');
var pathRecGeneTree = "examples/example_2.xml"
var pathRecPhylo = "examples/rpexample_1.xml"

var xmlStrRecGeneTree = fs.readFileSync(pathRecGeneTree, 'utf8');
var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');


parse.parse(xmlStrRecGeneTree, function (err,recTree) {
  assert(recTree.recGeneTree.phylogeny);
  var cladeRoot = recTree.recGeneTree.phylogeny.clade;
  flatTree.flatTree(cladeRoot);
});

// parse.parse(xmlStrRecPhylo, function (err,recTree) {
//   assert(recTree.recPhylo.recGeneTree.length);
//   // console.log(recTree.recPhylo.recGeneTree[0])
// });
