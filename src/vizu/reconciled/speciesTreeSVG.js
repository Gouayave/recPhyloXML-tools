var exports = module.exports = {};
exports.init = init;


var d3 = require('d3');



var margin = {
    top: 120,
    right: 120,
    bottom: 20,
    left: 120
  },
  width = 1500 - margin.right - margin.left,
  height = 2000 - margin.top - margin.bottom;

var color = d3.scaleOrdinal(d3.schemeCategory20);

var i = 0;
var id = 0;

var canalSizeX = 20;
var EventY = 150;




function init(cladeRootSt,svg) {

  svg
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var rootp = d3.hierarchy(cladeRootSt, function(d) {
    return d._clade ? d._clade : d.clade;
  });



  var dendrogramSpTree =
    d3
    .cluster()
    .size([1500, 1000]);

  dendrogramSpTree(rootp);

  rootp.each(function(d) {
    var temp;
    temp = d.x;
    d.x = d.y + 20;
    d.y = temp;
    d.data.id = id++;
  });



  var links = rootp.links();

  links.forEach(function(e, i) {
    if (i % 2 == 0) {
      e.leftLink = true;
    } else {
      e.rightLink = true;
    }
  });



  var link =
    svg.selectAll(".linkCtn")
    .data(links)
    .enter();

  var glink = link.append("g")
    .attr("class", "linkCtn");


  glink
    .append("path")
    .attr("class", "linkDown")
    .style("fill","none")
    .style("stroke-width","2px")
    .style("stroke-dasharray",function (d) {
      var targetClade = d.target.data;
      return targetClade.dead ? "5" : "0";
    })
    .style("stroke","black")
    .attr("d", diagonalLinkDown)


  glink
    .append("path")
    .attr("class", "linkUp")
    .style("fill","none")
    .style("stroke-width","2px")
    .style("stroke-dasharray",function (d) {
      var targetClade = d.target.data;
      return targetClade.dead ? "5" : "0";
    })
    .style("stroke","black")
    .attr("d", diagonalLinkUp);

  // glink
  //   .append("path")
  //   .attr("class", "link")
  //   .attr("d", diagonal);


  glink.filter(function(d) {
      return  d.target.data.dead;
    })
    .attr("class", "linkCtn linkDead");

  var node = svg.selectAll(".node")
    .data(rootp.descendants())
    .enter()
    .append("g")
    .attr("class", function(d) {
      return "node" + (d.children ? " node--internal" : " node--leaf");
    })
    .attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    })


  // symbol = d3.symbol().size(64).type(d3.symbolCircle)
  // node
  //   .append("path")
  //   .attr("class", "symbol")
  //   .attr("fill", function(d, i) {
  //     return color(d.data.id);
  //   })
  //   .attr("stroke", function(d, i) {
  //     return color(d.data.id);
  //   })
  //   .attr("d", symbol);


    // symbolDead = d3.symbol().size(512).type(d3.symbolCross)
    // node
    //   .append("path")
    //   .filter(function (d) {
    //     return d.data.dead && !d.children;
    //   })
    //   .attr("transform", "translate(20,0) , rotate(45)")
    //   .attr("class", "symbolCross")
    //   .attr("fill", "none")
    //   .attr("stroke", "tomato")
    //   .attr("d", symbolDead);

  node.append("text")
    .text(function(d) {
      var dead = d.data.dead ;
      // console.log(d.data.dead,d.data.)
      return dead ? ""  : "(" + d.data.name +")" ;
    })
    // .attr("fill", function(d, i) {
    //   return color(d.data.id);
    // })
    .attr("text-anchor", function(d) {
      return "start";
    })
    .attr("font-size","20px");


}


function diagonalLinkDown(d) {
  var path = d3.path();

  if (d.leftLink) {
    if (d.source.data.spOut) {
      if (d.target.data.dead) {
        path.moveTo(d.source.x + canalSizeX, d.source.y - canalSizeX);
      } else {
        path.moveTo(d.source.x + canalSizeX, d.source.y + canalSizeX);
      }

    } else {
      path.moveTo(d.source.x + canalSizeX, d.source.y);
    }

    path.lineTo(d.source.x + canalSizeX, d.target.y + canalSizeX);


    if (d.target.children) {
      path.lineTo(d.target.x - canalSizeX, d.target.y + canalSizeX);
    } else {
      path.lineTo(d.target.x, d.target.y + canalSizeX);
      path.lineTo(d.target.x, d.target.y);
    }
  } else {
    if (d.source.data.spOut) {
      if (d.target.data.dead) {
        path.moveTo(d.source.x + canalSizeX, d.source.y + canalSizeX);
      } else {
        path.moveTo(d.source.x + canalSizeX, d.source.y - canalSizeX);
      }

    } else {
      path.moveTo(d.source.x + canalSizeX, d.source.y);
    }

    path.lineTo(d.source.x + canalSizeX, d.target.y - canalSizeX);

    if (d.target.children) {
      path.lineTo(d.target.x - canalSizeX, d.target.y - canalSizeX);
    } else {
      path.lineTo(d.target.x, d.target.y - canalSizeX);
      path.lineTo(d.target.x, d.target.y);
    }
  }
  return path.toString();
}

function diagonalLinkUp(d) {
  var path = d3.path();

  if (d.leftLink) {
    if (d.source.data.spOut) {
      if (d.target.data.dead) {
        path.moveTo(d.source.x - canalSizeX, d.source.y - canalSizeX);
      } else {
        path.moveTo(d.source.x - canalSizeX, d.source.y - canalSizeX);
      }
    } else {
      path.moveTo(d.source.x - canalSizeX, d.source.y - canalSizeX);
    }

    path.lineTo(d.source.x - canalSizeX, d.target.y - canalSizeX);

    if (d.target.children) {
      path.lineTo(d.target.x - canalSizeX, d.target.y - canalSizeX);
    } else {
      path.lineTo(d.target.x, d.target.y - canalSizeX);
      path.lineTo(d.target.x, d.target.y);
    }
  } else {
    if (d.source.data.spOut) {
      if (d.target.data.dead) {
        path.moveTo(d.source.x - canalSizeX, d.source.y + canalSizeX);
      } else {
        path.moveTo(d.source.x - canalSizeX, d.source.y + canalSizeX);
      }

    } else {
      path.moveTo(d.source.x - canalSizeX, d.source.y + canalSizeX);
    }
    path.lineTo(d.source.x - canalSizeX, d.target.y + canalSizeX);

    if (d.target.children) {
      path.lineTo(d.target.x - canalSizeX, d.target.y + canalSizeX);
    } else {
      path.lineTo(d.target.x, d.target.y + canalSizeX);
      path.lineTo(d.target.x, d.target.y);
    }
  }
  return path.toString();
}

function diagonal(d) {
  var path = d3.path();
  path.moveTo(d.source.x, d.source.y);
  path.lineTo(d.source.x, d.target.y);
  path.lineTo(d.target.x, d.target.y);
  return path.toString();
}



// function update(rootp) {
//
//
//   var dendrogramSpTree =
//     d3
//     .dendrogramSpTree()
//     .size([canalSizeX, EventY]);
//
//   dendrogramSpTree(rootp);
//
//   var t =
//     d3.transition()
//     .ease(d3.easeExpIn)
//     .duration(750);
//
//   var links = rootp.links();
//
//   links.forEach(function(e, i) {
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
//     .data(links)
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
//       return "translate(" + d.x + "," + d.y + ")";
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
