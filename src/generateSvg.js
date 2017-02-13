var exports = module.exports = {};
exports.generateSVG = generateSVG;

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


d3.layout.cladogramSpecial = function (lengthLoss) {
  var layout = d3.cluster();

  var layoutcladogramSpecial = function (root) {
    layout(root);
    root.each(function (d) {
      var temp = d.x;
      d.x = d.y;
      d.y = temp;
    });

    var leaves = root.leaves();
    for (d of leaves) {
      if(d.data.lastEvent.eventType == 'loss'){
        d.x = d.parent.x + lengthLoss;
      }
    }
  }

  layoutcladogramSpecial.nodeSize = function (x) {
    var temp = x[0];
    x[0] = x[1];
    x[1] = temp;
    layout = layout.nodeSize(x);
    return layoutcladogramSpecial;
  }

  layoutcladogramSpecial.Size = function (x) {
    layout = layout.Size(x);
    return layoutcladogramSpecial;
  }

  return layoutcladogramSpecial;

}


function generateSVG(svg,cladeRoot) {

  var g = svg.append("g");

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var symbol = d3.symbol().size(128);

  margin = {
    top: 40,
    down: 20,
    left: 200,
    right: 50
  }

  nodeWidth = 30;
  nodeHeigth = 30;
  action = null;

  var layout = d3.layout.cladogramSpecial(10);
  var diagonal = svgLinks.shoulder;


  updateLayout(cladeRoot);

  function updateLayout(cRoot) {
    var treeRoot = d3.hierarchy(cRoot, function(d) {
      return d.clade;
    });

    treeRoot.each(function (d) {
      var eventsRec = d.data.eventsRec;
      d.data.lastEvent = eventsRec[eventsRec.length - 1];
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
      .attr("d", diagonal)
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
        return "translate(" + [d.x, d.y] + ")";
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
            return "#fdc747"
            break;
          case "speciationOutLoss":
            return "#1f9dea"
            break;
          case "speciationOut":
            return "#1f9dea"
            break;
          case "bifurcationOut":
            return "black"
            break;
          case "transferBack":
            return "#1c8116"
            break;
          case "duplication":
            return "#d46e52"
            break;
          case "speciationLoss":
            return "#fdc747"
            break;
          case "leaf":
            return "#63cf95";
            break;
          case "loss":
            return "black";
            break;
          default:

        }
      })
      .attr("d", function(d) {
        switch (d.data.lastEvent.eventType) {
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
            return "#fdc747"
            break;
          case "speciationOutLoss":
            return "#1f9dea"
            break;
          case "speciationOut":
            return "#1f9dea"
            break;
          case "bifurcationOut":
            return "black"
            break;
          case "transferBack":
            return "#1c8116"
            break;
          case "duplication":
            return "#d46e52"
            break;
          case "speciationLoss":
            return "#fdc747"
            break;
          case "leaf":
              return "#63cf95";
            break;
          case "loss":
              return "black";
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
        if (d.data.name && d.data.lastEvent.eventType === "leaf") {
          name += (d.data.name || d.data.lastEvent.geneName);
        }
        if (d.data.lastEvent.speciesLocation) {
          name += " (" + d.data.lastEvent.speciesLocation + ")";
        }
        if (d.data.lastEvent.destinationSpecies) {
          name += " ( -> " + d.data.lastEvent.destinationSpecies + ")";
        }
        return name;
      });
  };

}
