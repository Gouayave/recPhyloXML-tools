var rpXML = require('../index.js');
var populateSpTree = require('../src/vizu/reconciled/populateSpTree.js');

var fs = require('fs');
var assert = require('assert');


var pathRecPhylo = "/home/gence/Projets/rpXML-visu-cmd/examples/rpRef.xml"
var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');


rpXML.parse(xmlStrRecPhylo, function (err,recTree) {

  assert(recTree.recPhylo.recGeneTree[0].phylogeny);
  assert(recTree.recPhylo.spTree)
  var cladeRootGt = recTree.recPhylo.recGeneTree[0].phylogeny.clade;
  var cladeRootSt = recTree.recPhylo.spTree.phylogeny.clade;

  cladeRootGt = rpXML.flatTree(cladeRootGt);
  rpXML.reconcile(cladeRootGt,cladeRootSt);

  populateSpTree.populateSpTree(cladeRootSt,cladeRootGt);

});
