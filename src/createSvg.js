var exports = module.exports = {};
exports.createSVG = createSVG;
var d3 = require('d3');
d3.layout = {};

var svgLinks = {};

svgLinks.shoulder = function(d) {
  var path = d3.path();
  path.moveTo(d.source.x, d.source.y);
  path.lineTo(d.source.x, d.target.y);
  path.lineTo(d.target.x, d.target.y);
  return path.toString();
}

svgLinks.line = function(d) {
  var path = d3.path();
  path.moveTo(d.source.x, d.source.y);
  path.lineTo(d.target.x, d.target.y);
  return path.toString();
}

svgLinks.radial = function(d) {
  var path = "";
  path += "M" + [d.source.x, d.source.y];

  path += "C" + [d.target.x, (d.source.y + d.target.y) / 2] + " "
  path += [d.target.x, d.target.y]+ " "
  path += [d.target.x, d.target.y];
  return path;
};


d3.layout.dendrogram = function () {
  var layout = d3.tree();

  var layoutDendrogram = function (root) {
    layout(root);
    root.each(function (d) {
      var temp = d.x;
      d.x = d.y;
      d.y = temp;
    });
  }

  layoutDendrogram.nodeSize = function (x) {
    var temp = x[0];
    x[0] = x[1];
    x[1] = temp;
    layout = layout.nodeSize(x);
    return layoutDendrogram;
  }

  layoutDendrogram.Size = function (x) {
    layout = layout.Size(x);
    return layoutDendrogram;
  }

  return layoutDendrogram;

}

// layout.cladogram = d3.cluster;
d3.layout.cladogram = function () {
  var layout = d3.cluster();

  var layoutCladogram = function (root) {
    layout(root);
    root.each(function (d) {
      var temp = d.x;
      d.x = d.y;
      d.y = temp;
    });
  }

  layoutCladogram.nodeSize = function (x) {
    var temp = x[0];
    x[0] = x[1];
    x[1] = temp;
    layout = layout.nodeSize(x);
    return layoutCladogram;
  }

  layoutCladogram.Size = function (x) {
    layout = layout.Size(x);
    return layoutCladogram;
  }

  return layoutCladogram;

}


d3.layout.radial = function () {

  var layout = d3.cluster()
    .separation(function(a, b) {
      return (a.parent == b.parent ? 1 : 1) / a.depth;
    });

  var layoutRadial = function (root) {
    layout(root);
    root.each(function (d) {
      var coor = _project(d.x,d.y)
      d.x = coor[1];
      d.y = coor[0];

    });
  }

  layoutRadial.nodeSize = function (x) {
    var temp = x[0];
    x[0] = x[1];
    x[1] = temp;
    layout = layout.nodeSize(x);
    return layoutRadial;
  }

  layoutRadial.Size = function (x) {
    layout = layout.Size(x);
    return layoutRadial;
  }

  function _project(x, y) {
    var angle = (x - 90) / 180 * Math.PI,
      radius = y;
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  }


  return layoutRadial;
}




function createSVG(svg,cladeRoot) {

  var g = svg.append("g");

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var symbol = d3.symbol().size(128);

  margin = {
    top: 40,
    down: 20,
    left: 200,
    right: 300
  }

  nodeWidth = 30;
  nodeHeigth = 30;
  action = null;

  var layout = d3.layout.cladogram();
  var diagonal = svgLinks.shoulder;


  updateLayout(cladeRoot);

  function updateLayout(cRoot) {
    var treeRoot = d3.hierarchy(cRoot, function(d) {
      return d.clade;
    });

    layout.nodeSize([nodeWidth, nodeHeigth]);

    layout(treeRoot);
    updateSvg(treeRoot);
  }


  function updateSvg(treeRoot) {

    var nodes = treeRoot.descendants();
    var links = treeRoot.links();


    var minX = d3.min(nodes, function(d) {
      return d.x;
    });
    var maxX = d3.max(nodes, function(d) {
      return d.x;
    });

    var widthSVG = maxX - minX;

    var minY = d3.min(nodes, function(d) {
      return d.y;
    });
    var maxY = d3.max(nodes, function(d) {
      return d.y;
    });

    var heightSVG = maxY - minY;


    svg.attr("width", widthSVG + margin.right + margin.left);
    svg.attr("height", heightSVG + margin.top + margin.down);
    g.attr("transform", "translate(" + (margin.right - minX) + "," + (margin.top - minY) + ")")

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
      .attr("stroke-width",2)
      .attr("stroke",function (d) {
        if(d.target.data.deadSpecies)
        {
          return "#fff";
        }
        else {
          return "#0e2e2e";
        }
      })
      .attr("d", diagonal);



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
        return "translate(" + [d.x, d.y] + ")";
      })
      .on("click",action)
      // .on("mouseover", );



    allNodes
      .select(".gsymbol")
      .attr("transform", function(d) {
        var str = "";
        if (d.data.loss) {
          str += "rotate(45)";
        }
        if (d.data.event.eventType === "leaf") {
          str += "rotate(90)";
        } else {
          str += "";
        }
        return str;
      });

    allNodes
      .select(".symbol")
      .attr("fill", function(d) {
        switch (d.data.event.eventType) {
          case "speciation":
            return color(1)
            break;
          case "speciationOutLoss":
            return color(2)
            break;
          case "speciationOut":
            return color(2)
            break;
          case "bifurcationOut":
            return "black"
            break;
          case "transferBack":
            return color(3)
            break;
          case "duplication":
            return color(4)
            break;
          case "speciationLoss":
            return color(1)
            break;
          case "leaf":
            if (d.data.loss) {

              if(d.data.deadSpecies)
              {
                return "white"
              }
              else {
                return "black";
              }
            }
            else {
              return color(5);
            }
            break;
          default:

        }
      })
      .attr("d", function(d) {
        switch (d.data.event.eventType) {
          case "speciation":
            return symbol.type(d3.symbolCircle)()
            break;
          case "speciationOutLoss":
            return symbol.type(d3.symbolCircle)()
            break;
          case "speciationOut":
            return symbol.type(d3.symbolCircle)()
            break;
          case "bifurcationOut":
            return symbol.type(d3.symbolCircle)()
            break;
          case "transferBack":
            return symbol.type(d3.symbolDiamond)()
            break;
          case "duplication":
            return symbol.type(d3.symbolSquare)()
            break;
          case "speciationLoss":
            return symbol.type(d3.symbolCircle)()
            break;
          case "leaf":
            if (d.data.loss) {
              return symbol.type(d3.symbolCross)()
            } else {
              return symbol.type(d3.symbolTriangle)()
            }

            break;
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
        switch (d.data.event.eventType) {
          case "speciation":
            return color(1)
            break;
          case "speciationOutLoss":
            return color(2)
            break;
          case "speciationOut":
            return color(2)
            break;
          case "bifurcationOut":
            return "black"
            break;
          case "transferBack":
            return color(3)
            break;
          case "duplication":
            return color(4)
            break;
          case "speciationLoss":
            return color(1)
            break;
          case "leaf":
            if (d.data.loss) {
              return "black";
            } else {
              return color(5);
            }
            break;
          default:

        }
      })


    allNodes
      .select(".label")
      .attr("y", function(d) {
        return d.children ? -8 : 3;
      })
      .attr("x", function(d) {
        return d.children ? -8 : 8;
      })
      .style("text-anchor", function(d) {
        return d.children ? "end" : "start";
      })
      .text(function(d) {
        var name = "";
        if (d.data.name && d.data.event.eventType === "leaf") {
          name += d.data.event.geneName;
        }
        if (d.data.event.speciesLocation) {
          name += " (" + d.data.event.speciesLocation + ")";
        }
        if (d.data.event.destinationSpecies) {
          name += " ( -> " + d.data.event.destinationSpecies + ")";
        }
        return name;
      });
  };

}
