var rpXML = require('../index.js');
var populateSpTree = require('../src/vizu/reconciled/populateSpTree.js');

var speciesTreeSvg = require('../src/vizu/reconciled/speciesTreeSVG.js');



var fs = require('fs');
var assert = require('assert');
var domv = require('domv');
var d3 = require('d3');

var pathRecPhylo = "/home/gence/Projets/rpXML-visu-cmd/examples/rpRef4.xml"
var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');

document = domv.createHtmlDomDocument();

rpXML.parse(xmlStrRecPhylo, function (err,recTree) {
  var svg = d3.select(document.body).append("svg").attr("id","visuRecPhylo");

  assert(recTree.recPhylo.recGeneTree[0].phylogeny);
  assert(recTree.recPhylo.spTree)
  var cladesRootGt =recTree.recPhylo.recGeneTree;
  cladesRootGt = cladesRootGt.map(function (cladeRootGt) {
    return cladeRootGt.phylogeny.clade;
  });


  var cladeRootSt = recTree.recPhylo.spTree.phylogeny.clade;


  for (cladeRootGt of cladesRootGt) {
    cladeRootGt = rpXML.flatTree(cladeRootGt);
    rpXML.reconcile(cladeRootGt,cladeRootSt);
    populateSpTree.populateSpTree(cladeRootSt,cladeRootGt);
  }
  speciesTreeSvg.init(cladeRootSt,cladesRootGt,svg);



  var svgtextout = "";
  svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
  svgtextout += document.body.innerHTML;


  console.log(svgtextout)


});
