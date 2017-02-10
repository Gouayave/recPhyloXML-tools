var parse = require('../src/parse.js');
var flatTree = require('../src/flatTree.js');
var generateSVG = require('../src/generateSvg.js');
var d3 = require('d3');


var fs = require('fs');
var assert = require('assert');
var domv = require('domv');



var pathRecPhylo = "/home/gence/testDTLB2"

var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');


parse.parse(xmlStrRecPhylo, function (err,recTree) {
  var document = domv.createHtmlDomDocument();
  assert(recTree.recPhylo.recGeneTree[0].phylogeny);
  var cladeRoot = recTree.recPhylo.recGeneTree[0].phylogeny.clade;
  flatTree.flatTree(cladeRoot);


  var svg = d3.select(document.body).append("svg");

  generateSVG.generateSVG(svg,cladeRoot);

  var svgtextout = "";
  svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
  svgtextout += document.body.innerHTML;

  //console.log(lines);
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
