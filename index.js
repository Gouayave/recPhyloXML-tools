var fs = require('fs');
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
