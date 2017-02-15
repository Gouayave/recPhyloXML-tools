var parse = require('../src/parse.js');
var flatTree = require('../src/flatTree.js');
var generateSVG = require('../src/generateSvg.js');
var reconcile = require('../src/reconcile.js');
var d3 = require('d3');


var fs = require('fs');
var assert = require('assert');
var domv = require('domv');



var pathRecPhylo = "/home/gence/Projets/rpXML-visu-cmd/examples/example_5.xml"
var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');

var flatTreeConfig = {
  transferBack : false
}

// var config = {
//   layout : "cladogramSpecial",
//   links : "shoulder",
//   symbolSize : 512  ,
//   lengthLinkLoss : 10,
//   linkStrokeSize : 2,
//   nodeWidth : 60,
//   nodeHeigth : 60,
//   margin : { top: 40, down: 20, left: 50, right: 50},
//   color : {
//     speciation : "#1F77B4",
//     speciationOutLoss : "#D62728",
//     speciationOut : "#D62728",
//     bifurcationOut : "#D62728",
//     transferBack : "#D62728",
//     duplication : "#9467BD",
//     speciationLoss : "#1F77B4",
//     leaf : "#1F77B4",
//     loss : "#000000"
//   }
// }

parse.parse(xmlStrRecPhylo, function (err,recTree) {
  document = domv.createHtmlDomDocument();
  assert(recTree.recPhylo.recGeneTree[0].phylogeny);
  var cladeRootGt = recTree.recPhylo.recGeneTree[0].phylogeny.clade;
  cladeRootGt = flatTree.flatTree(cladeRootGt,flatTreeConfig);


  if(recTree.recPhylo.spTree)
  {
    var cladeRootSt = recTree.recPhylo.spTree.phylogeny.clade;
    reconcile.reconcile(cladeRootGt,cladeRootSt);
  }


  var svg = d3.select(document.body).append("svg").attr("id","visuRecPhylo");


  generateSVG.generateSVG(svg,cladeRootGt);


  var svgtextout = "";
  svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
  svgtextout += document.body.innerHTML;


  try{
      console.log(svgtextout)
  } catch (err) {
      console.error(err);
      process.exit();
  }
});

// parse.parse(xmlStrRecPhylo, function (err,recTree) {
//   assert(recTree.recPhylo.recGeneTree.length);
//   // console.log(recTree.recPhylo.recGeneTree[0])
// });
