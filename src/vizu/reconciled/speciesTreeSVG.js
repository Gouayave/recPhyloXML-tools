var exports = module.exports = {};
exports.init = init;

var d3 = require('d3');

var margin = {
    top: 0,
    right: 120,
    bottom: 20,
    left: 0
  },
  width = 1500 - margin.right - margin.left,
  height = 2000 - margin.top - margin.bottom;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var i = 0;
var id = 0;

var storySize = 10;
var eventSize = 20 ;


function inOrderTraversal(node,callback) {
  // Check if the current node is empty / null
  if(node.children)
  {
    // Traverse the left subtree by recursively calling the in-order function.
    inOrderTraversal(node.children[0],callback);
    // Display the data part of the root (or current node).
    callback(node);
    // Traverse the right subtree by recursively calling the in-order function.
    inOrderTraversal(node.children[1],callback);
  }
  else {
    callback(node);
  }

};


function init(cladeRootSt,cladesRootGt,svg) {

  var rootp = d3.hierarchy(cladeRootSt, function(d) {
    return d._clade ? d._clade : d.clade;
  });

  var allNodes = rootp.descendants();
  var allLinks = rootp.links();




  rootp.each(function(d) {
    if(d.children){
      d.children.forEach(function (child,i) {
        child.data.pos = i;
      });
    }
    // d.data.numberOfEvents = d.data.numberOfEvents || 1;
    // d.data.numberOfCanaux = d.data.numberOfCanaux || 1;
    // d.data.numberOfStoriesOut = d.data.numberOfStoriesOut || 1;
    // d.data.id = id++;
  });

  var posY = margin.top;
  inOrderTraversal(rootp,function (d) {
    var numberOfCanaux = d.data.numberOfCanaux || 1;
    var ctnSize = numberOfCanaux * storySize ;
    posY += ctnSize /2 ;
    d.data.y = posY;
    posY += ctnSize /2 ;
  });

  var posX = margin.left;
  var maxX = 0;
  rootp.each(function (d) {
    var numberOfEvents = d.data.numberOfEvents || 1 ;
    var numberOfStoriesOut = d.data.numberOfStoriesOut || 1 ;

    var ctnLength = numberOfEvents * eventSize ;
    var edgeWidth = numberOfStoriesOut * storySize ;
    if(d.parent)
    {
      posX = d.parent.posXEnd;
    }
    d.data.x = posX;
    d.posXEnd = posX + ctnLength + edgeWidth;

    if(d.posXEnd  > maxX)
    {
      maxX = d.posXEnd ;
    }
  });


  rootp.leaves().forEach(function (d) {
    d.maxX = maxX;
  });



  rootp.each(function (d) {
    d.data.chemins = [];
    var numberOfStoriesOut = d.data.numberOfStoriesOut || 1;
    var storySizeSrc = numberOfStoriesOut*storySize;

    var upX = d.data.x + storySizeSrc;
    var upY = d.data.y + storySizeSrc;
    var downX = d.data.x - storySizeSrc;
    var downY = d.data.y - storySizeSrc;

    var diffX = (upX - downX) / (numberOfStoriesOut +1 );
    var diffY = (upY - downY) / (numberOfStoriesOut +1 );;

    for (var i = 1; i < (numberOfStoriesOut + 1) ; i++) {
      if(d.children){
        if(d.data.pos == 1 ){
          d.data.chemins.push([downX + diffX*i,upY - diffY*i]);
        }else{
          d.data.chemins.push([downX + diffX*i,downY + diffY*i]);
        }
      }
      else{
        if(d.data.pos == 1 ){
          d.data.chemins.push([d.data.x,upY - diffY*i]);
        }else{
          d.data.chemins.push([d.data.x ,downY+ diffY*i]);
        }
      }
    }
  });

  // svg
  // .attr("width", width + margin.right + margin.left)
  // .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  for (cladeRootGt of cladesRootGt) {

    var rootgt = d3.hierarchy(cladeRootGt, function(d) {
      return d.clade;
    });

    rootgt.each(function (n) {
      var coord = getCanalCoord(n.data.spTree,n.data.posInSpTree);
      n.data.x = coord.x;
      n.data.y = coord.y;
    });


    generateSVGGene(svg,cladeRootGt);
  }



  // var points =
  //   svg.selectAll(".circle")
  //   .data(arrayPosTest)
  //   .enter();
  //
  // points.append("circle")
  // .attr("cx",function (d) {
  //     return d.x;
  // })
  // .attr("cy",function (d) {
  //     return d.y;
  // })
  // .attr("r",1)


  var link =
    svg.selectAll(".linkCtn")
    .data(allLinks)
    .enter();

  var glink = link.append("g")
    .attr("class", "linkCtn");


  link
    .append("path")
    .attr("class", "linkCtn")
    .style("fill","none")
    .style("stroke-width","1px")
    .style("stroke-dasharray",function (d) {
      var targetClade = d.target.data;
      return targetClade.dead ? "5" : "0";
    })
    .style("stroke","black")
    .attr("d", diagonalSpTree);




  glink.filter(function(d) {
      return  d.target.data.dead;
    })
    .attr("class", "linkCtn linkDead");

  // var node = svg.selectAll(".node")
  //   .data(rootp.descendants())
  //   .enter()
  //   .append("g")
  //   .attr("class", function(d) {
  //     return "node" + (d.children ? " node--internal" : " node--leaf");
  //   })
  //   .attr("transform", function(d) {
  //     return "translate(" + d.data.x + "," + d.data.y + ")" ;
  //   })



  svg.selectAll(".node")
    .data(rootp.descendants())
    .enter()
    .append("text")
    .attr("class","node")
      .attr("transform", function(d) {
        return "translate(" + d.data.x + "," + d.data.y + ")" ;
      })
    .text(function(d) {
      var dead = d.data.dead ;
      return dead ? ""  : "(" + d.data.name +")" + d.data.numberOfStoriesOut;
    })
    .attr("text-anchor", function(d) {
      return "start";
    })
    .attr("font-size","8px");


}


function diagonalSpTree(d) {

  var numberOfEventSrc = d.source.data.numberOfEvents || 1;
  var numberOfEventTgt = d.target.data.numberOfEvents || 1;
  var numberOfCanauxSrc = d.source.data.numberOfCanaux || 1;
  var numberOfCanauxTgt = d.target.data.numberOfCanaux || 1;
  var targetHasChildren = d.target.children ? true : false;

  var posX = d.source.data.x;
  var posY = d.source.data.y;

  var path = d3.path();
  if (d.target.data.pos == 0) {

    //1
    posY -= numberOfCanauxSrc * storySize / 2;
    path.moveTo(posX, posY);
    //2
    posX += numberOfEventSrc * eventSize;
    path.lineTo(posX, posY);
    //3
    posY = d.target.data.y - (numberOfCanauxTgt * storySize / 2);
    path.lineTo(posX, posY);
    //4
    posX = d.target.data.x
    path.lineTo(posX, posY);
    //5

    if (!targetHasChildren) {
      // 5_1
      // posX += numberOfEventTgt * eventSize;
      posX = d.target.maxX;
      path.lineTo(posX, posY);
      // 5_2
      posY = d.target.data.y + (numberOfCanauxTgt * storySize / 2);
      path.lineTo(posX, posY);
      // 5_3
      posX = d.target.data.x;
      path.lineTo(posX, posY);
      // 5_4
      posY = d.source.data.y;
      path.lineTo(posX, posY);


    } else {
      //5
      posY = d.target.data.y + (numberOfCanauxTgt * storySize / 2);
      path.moveTo(posX, posY);
      //6
      posY = d.source.data.y;
      path.lineTo(posX, posY);

    }

  }
  else if (d.target.data.pos == 1) {

    //1
    posY += numberOfCanauxSrc * storySize / 2;
    path.moveTo(posX, posY);
    //2
    posX += numberOfEventSrc * eventSize;
    path.lineTo(posX, posY);
    //3
    posY = d.target.data.y + (numberOfCanauxTgt * storySize / 2);
    path.lineTo(posX, posY);
    //4
    posX = d.target.data.x
    path.lineTo(posX, posY);
    //5

    if (!targetHasChildren) {
      // 5_1
      // posX += numberOfEventTgt * eventSize;
      posX = d.target.maxX;
      path.lineTo(posX, posY);
      // 5_2
      posY = d.target.data.y - (numberOfCanauxTgt * storySize / 2);
      path.lineTo(posX, posY);
      // 5_3
      posX = d.target.data.x;
      path.lineTo(posX, posY);
      // 5_4
      posY = d.source.data.y;
      path.lineTo(posX, posY);

    }
    else {
      //5
      posY = d.target.data.y - (numberOfCanauxTgt * storySize / 2);
      path.moveTo(posX, posY);
      //6
      posY = d.source.data.y;
      path.lineTo(posX, posY);

    }

  }
  return path.toString();
}

function getCanalCoord(nodeSpT,abstractCoord) {

  var numberOfCanaux = nodeSpT.numberOfCanaux;
  var i = abstractCoord[0];
  var j = abstractCoord[1];

  var x = nodeSpT.x + i * eventSize;
  var y = 0;


  if(nodeSpT.pos && nodeSpT.pos == 1)
  {
    y = nodeSpT.y + (numberOfCanaux * storySize / 2) - (j * storySize)
    - (storySize / 2);
  }else {
    y = nodeSpT.y - (numberOfCanaux * storySize / 2) + (j * storySize)
    + (storySize / 2);
  }
  // console.error(nodeSpT)
  return {
    x : x,
    y : y
  }
}

function generateSVGGene(svg,cladeRoot,config = {}) {


  var configLayout = {
    layout : config.layout || "cladogramSpecial",
    links : config.links || "shoulder",
    symbolSize : config.symbolSize || 32,
    lengthLinkLoss : config.lengthLinkLoss || 10,
    linkStrokeSize : config.linkStrokeSize || 2,
    nodeWidth : config.nodeWidth || 30,
    nodeHeigth : config.nodeHeigth || 30,
    margin : config.margin || { top: 10, down: 20, left: 500  , right: 50},
    color : config.color || {
      speciation : "#1F77B4",
      speciationOutLoss : "#2CA02C",
      speciationOut : "#2CA02C",
      bifurcationOut : "#000000",
      transferBack : "#D62728",
      duplication : "#9467BD",
      speciationLoss : "#1F77B4",
      leaf : "#FF7F0E",
      loss : "#000000"
    },
    symbols : config.symbols || {
      speciation : "symbolCircle",
      speciationOutLoss : "symbolCircle",
      speciationOut : "symbolCircle",
      bifurcationOut : "symbolCircle",
      transferBack : "symbolDiamond",
      duplication : "symbolSquare",
      speciationLoss : "symbolCircle"
    }
  }

  var g = svg
  .append("g")
  .attr("width", "auto")
  .attr("height", "auto")
  .append("g")
  .attr("id","svgZone");

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var symbol = d3.symbol().size(configLayout.symbolSize);

  margin = configLayout.margin;

  nodeWidth = configLayout.nodeWidth;
  nodeHeigth = configLayout.nodeHeigth;
  action = null;



  updateLayout(cladeRoot);

  function updateLayout(cRoot) {
    var treeRoot = d3.hierarchy(cRoot, function(d) {
      return d.clade;
    });

    treeRoot.each(function (d) {
      var eventsRec = d.data.eventsRec;
      d.data.lastEvent = eventsRec[eventsRec.length - 1];
    });

    updateSvg(treeRoot);
  }


  function updateSvg(treeRoot) {

    var nodes = treeRoot.descendants();
    var links = treeRoot.links();



    //------LINK----------
    var link =
      g.selectAll(".link")
      .data(links);

    //EXIT
    link.exit().remove();

    //ENTER
    var linkEnter =
      link
      .enter()
      .append("path")
      .attr("class", "link");


    linkEnter
      .merge(link)
      .attr("fill","none")
      .attr("stroke-width",configLayout.linkStrokeSize)
      .attr("stroke",function (d) {
        if(d.target.data.deadSpecies)
        {
          return "#fff";
        }
        else {
          return "#0e2e2e";
        }
      })
      .attr("d", diagonalGene)
      .attr('stroke-dasharray',function(d){
            var et = d.target.data.lastEvent.eventType;
            var sl = d.target.data.lastEvent.speciesLocation;
            if(et === "transferBack" || et === "bifurcationOut" || sl == "Out")
                return '5,5';
        });



    //------NODE----------
    var node =
      g.selectAll(".node")
      .data(nodes);


    //ENTER
    var nodeEnter =
      node
      .enter()
      .append("g")
      .attr("class", "node");


    nodeEnter
      .append("g")
      .attr("class", "gsymbol")
      .append("path")
      .attr("class", "symbol");

    nodeEnter
      .append("text")
      .attr("class", "label");

    //EXIT
    node.exit().remove();


    //ENTER + UPDATE
    var allNodes =
      nodeEnter
      .merge(node)
      .attr("transform", function(d) {
        return "translate(" + [d.data.x, d.data.y] + ")";
      })
      .on("click",action)
      // .on("mouseover", );



    allNodes
      .select(".gsymbol")
      .attr("transform", function(d) {
        var str = "";
        if (d.data.lastEvent.eventType === "loss") {
          str += "rotate(45)";
        }
        if (d.data.lastEvent.eventType === "leaf") {
          str += "rotate(90)";
        } else {
          str += "";
        }
        return str;
      });

    allNodes
      .select(".symbol")
      .attr("fill", function(d) {
        switch (d.data.lastEvent.eventType) {
          case "speciation":
            return configLayout.color.speciation
            break;
          case "speciationOutLoss":
            return configLayout.color.speciationOutLoss
            break;
          case "speciationOut":
            return configLayout.color.speciationOut
            break;
          case "bifurcationOut":
            return configLayout.color.bifurcationOut
            break;
          case "transferBack":
            return configLayout.color.transferBack
            break;
          case "duplication":
            return configLayout.color.duplication
            break;
          case "speciationLoss":
            return configLayout.color.speciationLoss
            break;
          case "leaf":
            return configLayout.color.leaf
            break;
          case "loss":
            return configLayout.color.loss
            break;
          default:
        }

      })
      .attr("d", function(d) {
        switch (d.data.lastEvent.eventType) {
          case "speciation":
            return symbol.type(d3[configLayout.symbols.speciation])()
            break;
          case "speciationOutLoss":
            return symbol.type(d3[configLayout.symbols.speciationOutLoss])()
            break;
          case "speciationOut":
            return symbol.type(d3[configLayout.symbols.speciationOut])()
            break;
          case "bifurcationOut":
            return symbol.type(d3[configLayout.symbols.bifurcationOut])()
            break;
          case "transferBack":
            return symbol.type(d3[configLayout.symbols.transferBack])()
            break;
          case "duplication":
            return symbol.type(d3[configLayout.symbols.duplication])()
            break;
          case "speciationLoss":
            return symbol.type(d3[configLayout.symbols.speciationLoss])()
            break;
          case "leaf":
            return symbol.type(d3.symbolTriangle)()
            break;
          case "loss":
            return symbol.type(d3.symbolCross)()
          default:

        }
      })
      .attr("stroke-width", "0px")
      .filter(function (d) {
        return d.data._clade? true : false;
      })
      .attr("fill", "white")
      .attr("stroke-width", "2px")
      .attr("stroke", function(d) {
        switch (d.data.lastEvent.eventType) {
          case "speciation":
            return configLayout.color.speciation
            break;
          case "speciationOutLoss":
            return configLayout.color.speciationOutLoss
            break;
          case "speciationOut":
            return configLayout.color.speciationOut
            break;
          case "bifurcationOut":
            return configLayout.color.bifurcationOut
            break;
          case "transferBack":
            return configLayout.color.transferBack
            break;
          case "duplication":
            return configLayout.color.duplication
            break;
          case "speciationLoss":
            return configLayout.color.speciationLoss
            break;
          case "leaf":
            return configLayout.color.leaf
            break;
          case "loss":
            return configLayout.color.loss
            break;
          default:

        }
      })


      function getMethods(obj) {
          var result = [];
          for (var id in obj) {
            try {
              if (typeof(obj[id]) == "function") {
                result.push(id + ": " + obj[id].toString());
              }
            } catch (err) {
              result.push(id + ": inaccessible");
            }
          }
          return result;
        }


  };

}

function diagonalGene(d) {

  var eventTypeSrc = d.source.data.lastEvent.eventType;
  var numberOfEventSrc = d.source.data.spTree.numberOfEvents ;
  var path = d3.path();
  // console.error(d.source);
  var posX = d.source.data.x;
  var posY = d.source.data.y;
  path.moveTo(posX, posY);

  if(eventTypeSrc == "speciation" || eventTypeSrc == "speciationLoss"){

    //TODO à refaire
    posX += (++numberOfEventSrc) * eventSize + (d.source.data.posInSpTree[1] + 1) * (storySize)
    - storySize/2;

    path.lineTo(posX,posY);

    // if(d.target.data.spTree.pos == 0)
    posY = d.target.data.y ;
    path.lineTo(posX,posY);
  } else {
    posX = d.source.data.x;
    posY = d.target.data.y;
    path.lineTo(posX,posY);
  }

  posX = d.target.data.x;
  posY = d.target.data.y;
  path.lineTo(d.target.data.x, d.target.data.y);

  return path.toString();
}

function functionName() {

}

// function diagonal(d) {
//   var path = d3.path();
//   path.moveTo(d.source.data.chemins[1][0], d.source.data.chemins[1][1]);
//   path.lineTo(d.source.data.chemins[1][0], d.target.data.chemins[1][1]);
//   path.lineTo(d.target.data.chemins[1][0], d.target.data.chemins[1][1]);
//   return path.toString();
// }
//
// function diagonal2(d) {
//   var path = d3.path();
//   path.moveTo(d.source.data.chemins[0][0], d.source.data.chemins[0][1]);
//   path.lineTo(d.source.data.chemins[0][0], d.target.data.chemins[0][1]);
//   path.lineTo(d.target.data.chemins[0][0], d.target.data.chemins[0][1]);
//   return path.toString();
// }

// function update(rootp) {
//
//
//   var dendrogramSpTree =
//     d3
//     .dendrogramSpTree()
//     .size([storySize, EventY]);
//
//   dendrogramSpTree(rootp);
//
//   var t =
//     d3.transition()
//     .ease(d3.easeExpIn)
//     .duration(750);
//
//   var allLinks = rootp.allLinks();
//
//   allLinks.forEach(function(e, i) {
//     if (i % 2 == 0) {
//       e.rightLink = false;
//       e.leftLink = true;
//     } else {
//       e.rightLink = true;
//       e.leftLink = false;
//     }
//
//   });
//
//   var glink =
//     svg
//     .selectAll(".linkCtn")
//     .data(allLinks)
//     .attr("class", "linkCtn");
//
//
//
//   glink.select(".linkDown")
//     .transition(t)
//     .attr("d", diagonalLinkDown);
//
//   glink.select(".linkUp")
//     .transition(t)
//     .attr("d", diagonalLinkUp);
//
//
//   glink
//     .select(".link")
//     .transition(t)
//     .attr("d", diagonal);
//
//   glink.filter(function(d) {
//       return  d.target.data.dead;
//     })
//     .transition(t)
//     .attr("class", "linkCtn linkDead");
//
//   var node = svg.selectAll(".node")
//     .data(rootp.descendants())
//     .transition(t)
//     .attr("transform", function(d) {
//       return "translate(" + d.data.data.x + "," + d.data.data.y + ")";
//     })
//
//   svg.selectAll(".symbol")
//     .data(rootp.descendants())
//     .attr("fill", function(d, i) {
//       return color(d.data.id);
//     });
//
//   svg.selectAll("text")
//     .data(rootp.descendants())
//     .attr("stroke", function(d, i) {
//       return color(d.data.id);
//     })
//     .text(function(d) {
//       return d.data.name
//     });
//
//
// }
// init(root);

// function click(d) {
//   if (d.children) {
//     var interchild = d.children[0];
//     d.children[0] = d.children[1];
//     d.children[1] = interchild;
//   }
//   var ancestors = d.ancestors();
//   var newRoot = ancestors[ancestors.length - 1];
//   update(newRoot);
// }
