var fs = require('fs');
var parse = require('xml2js').parseString;
var d3 = require('d3');
document = require('node-jsdom').jsdom();
var exploseTree = require('./src/exploseTree.js');
var createSVG = require('./src/createSvg.js');
//Test
var inspect = require('util').inspect;

var argv = require('minimist')(process.argv.slice(2));

var ifileUrl = argv.i;
var ofileUrl = argv.o;


exploseTree.exploseTree(ifileUrl,function(err,explosedTree) {


    var svg = d3.select(document.body).append("svg");
    var cladeRoot = explosedTree;

    createSVG.createSVG(svg,cladeRoot);

    var svgtextout = "";
    svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
    svgtextout += document.body.innerHTML;

    //console.log(lines);
    try{
        fs.writeFileSync(ofileUrl,svgtextout);
    } catch (err) {
        console.error(err);
        process.exit();
    }
});


// function draw () {
//   // console.log(parsedTree.recGeneTree.phylogeny[0].clade[0]);
//   var root = d3.hierarchy(explosedTree,function(d){return d.clade});
//   //Write file in path argv -o value
//   d3.tree()
//     .size([1000,1000])(root);
//
//   var svg = d3.select(document.body).append("svg").append("g").attr("id","main");
//
//   var gnode = svg
//       .append("g")
//       .attr('stroke-width',4)
//       .attr('stroke','red')
//       .attr('fill','none')
//       .attr('transform','rotate(-90,500,500)');
//
//   var gtext = gnode
//       .append("g")
//       .attr('stroke-width',1)
//       .attr('stroke','black');
//
//
//   var enodes = gnode.selectAll("path").data(root.descendants()).enter();
//   var etextnodes = gtext.selectAll("text").data(root.descendants()).enter();
//
//   enodes
//   .append('path')
//   .attr('d',function(d){
//       if(d.parent)
//       {
//           var path = d3.path();
//           path.moveTo(d.parent.x,d.parent.y);
//           path.lineTo(d.x,d.parent.y);
//           path.lineTo(d.x,d.y);
//           //path.moveTo(d.x,d.y);
//           //path.lineTo(d.children[1].x,d.y);
//           //path.lineTo(d.children[1].x,d.children[1].y);
//           return path.toString();
//       }
//   })
//   .attr('stroke-dasharray',function(d){
//       var et = d.data.event.eventType;
//       if(et === "transferBack" || et === "bifurcationOut")
//           return '5,5';
//   });
//
//   etextnodes
//   .append("text")
//   .attr('x',function(d){return d.x})
//   .attr('y',function(d){return d.y})
//   .text(function(d){
//       var et = d.data.event.eventType;
//       if(et === "transferBack")
//           return 'tb';
//       else if(et === "bifurcationOut")
//           return 'bo';
//       else if(et === "leaf")
//           return 'le';
//
//   });
//
//
// }
