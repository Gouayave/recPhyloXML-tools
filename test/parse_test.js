var parse = require('../modules/parse.js');
var flatTree = require('../modules/flatTree.js');
var generateSVG = require('../modules/generateSvg.js');
var fs = require('fs');
var assert = require('assert');
var domv = require('domv');
var d3 = require('d3');

var pathRecGeneTree = "examples/example_3.xml"
var pathRecPhylo = "examples/rpexample_1.xml"

var xmlStrRecGeneTree = fs.readFileSync(pathRecGeneTree, 'utf8');
var xmlStrRecPhylo = fs.readFileSync(pathRecPhylo, 'utf8');


parse.parse(xmlStrRecGeneTree, function (err,recTree) {
  var document = domv.createHtmlDomDocument();
  assert(recTree.recGeneTree.phylogeny);
  var cladeRoot = recTree.recGeneTree.phylogeny.clade;
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
