var fs = require('fs');
var readline = require('readline');
var stream = require('stream');
var d3 = require('d3');
var domv = require('domv');
var exploseTree = require('./src/exploseTree.js');
var createSVG = require('./src/createSvg.js');

var argv = require('minimist')(process.argv.slice(2));

var ontree = false;
var tree = "";
var treesXmlStr = [];



var ifileUrl = argv.i;
var ofileUrl = argv.o;
var idtree = 0;
const rl = readline.createInterface({
  input: fs.createReadStream(ifileUrl)
});

if(argv.n)
{
  idtree = argv.n;
  oneTree(idtree);
}else {
  allTrees();
}



function oneTree(idtree) {
  var treeNumber = 0;
  var xml="";
  rl.on('line', (line) => {

    //Je vérifie que je suis dans un arbre
    if(line.includes("<recGeneTree")){
      ontree = true;
    }

    if (line.includes("</recGeneTree>")) {
      tree+= line;
      if(treeNumber == idtree)
      {
        xml = tree;
      }

      tree = "";
      ontree = false;
      treeNumber++;
    }

    if(ontree)
    {
      tree+= line;
    }
  });

  rl.on('close', function() {

      var document = domv.createHtmlDomDocument();
      exploseTree.exploseTree(xml,function(err,explosedTree) {


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

  });
}

function allTrees() {
  rl.on('line', (line) => {

    //Je vérifie que je suis dans un arbre
    if(line.includes("<recGeneTree")){
      ontree = true;
    }

    if (line.includes("</recGeneTree>")) {
      tree+= line;
      treesXmlStr.push(tree);
      tree = "";
      ontree = false;
    }

    if(ontree)
    {
      tree+= line;
    }
  });

  rl.on('close', function() {

    var i = 0;
    for (xml of treesXmlStr) {
      var document = domv.createHtmlDomDocument();
      exploseTree.exploseTree(xml,function(err,explosedTree) {


         var svg = d3.select(document.body).append("svg");
         var cladeRoot = explosedTree;

         createSVG.createSVG(svg,cladeRoot);

         var svgtextout = "";
         svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
         svgtextout += document.body.innerHTML;

         //console.log(lines);
         try{
             if(ofileUrl.endsWith(".svg")){
               ofileUrl = ofileUrl.substring(0, ofileUrl.length - 4);
             }
             fs.writeFileSync(ofileUrl+"_"+i+".svg",svgtextout);
             i++;
         } catch (err) {
             console.error(err);
             process.exit();
         }
     });

    }
  });
}




// exploseTree.exploseTree(xml,function(err,explosedTree) {
//
//
//     var svg = d3.select(document.body).append("svg");
//     var cladeRoot = explosedTree;
//
//     createSVG.createSVG(svg,cladeRoot);
//
//     var svgtextout = "";
//     svgtextout += "\<?xml version=\"1.0\" standalone=\"no\"?\>\n\<!DOCTYPE svg PUBLIC \"-//W3C//DTD SVG 1.1//EN\" \n\"http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd\"\> ";
//     svgtextout += document.body.innerHTML;
//
//     //console.log(lines);
//     try{
//         fs.writeFileSync(ofileUrl,svgtextout);
//     } catch (err) {
//         console.error(err);
//         process.exit();
//     }
// });
