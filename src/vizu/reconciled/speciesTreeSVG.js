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

var canalSize = 20;
var depth = 150;


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



function init(cladeRootSt,svg) {

  svg
  .attr("width", width + margin.right + margin.left)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var rootp = d3.hierarchy(cladeRootSt, function(d) {
    return d._clade ? d._clade : d.clade;
  });


  rootp.each(function(d) {
    d.data.numberOfStories = Math.floor((Math.random() * 3) + 1);
    d.data.id = id++;
  });

  var posY = 0;
  inOrderTraversal(rootp,function (d) {
    var ctnSize = d.data.numberOfStories * canalSize ;
    posY += ctnSize;
    d.y = posY;
    posY += ctnSize;
  });

  var maxXLeave = 0;

  rootp.each(function (d) {
    var posX = 0;
    var ctnSize = d.data.numberOfStories * canalSize ;
    posX = d.depth *depth;
    posX += ctnSize;
    d.x = posX;
    posX += ctnSize;

    if(maxXLeave < d.x){
        maxXLeave = d.x;
    }
  });

  for (leave of rootp.leaves()) {
    leave.x = maxXLeave;
  }





  var links = rootp.links();

  links.forEach(function(e, i) {
    if (i % 2 == 0) {
      e.leftLink = true;
    } else {
      e.rightLink = true;
    }
  });


  var pointsData = [];
  rootp.each(function (d) {
    var canalSizeSrc = (d.data.numberOfStories )*canalSize;

    var upX = d.x + canalSizeSrc;
    var downX = d.x - canalSizeSrc;
    var upY = d.y + canalSizeSrc;
    var downY = d.y - canalSizeSrc;

    var diffX = (upX - downX) / (d.data.numberOfStories +1 );
    var diffY = (upY - downY) / (d.data.numberOfStories +1 );;

    for (var i = 1; i < (d.data.numberOfStories + 1) ; i++) {
      if(d.children){
        pointsData.push([downX + diffX*i,downY+ diffY*i]);
      }
      else{
        pointsData.push([d.x ,downY+ diffY*i]);
      }
    }
  });

  var points =
    svg.selectAll(".circle")
    .data(pointsData)
    .enter();

  points.append("circle")
  .attr("cx",function (d) {
      return d[0];
  })
  .attr("cy",function (d) {
      return d[1];
  })
  .attr("r",5)


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
    .attr("d", diagonalLinkDown);


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
      return "translate(" + d.x + "," + d.y + ")" ;
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
      return dead ? ""  : "(" + d.data.name +")" + d.data.numberOfStories;
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
  var targetHasChildren = d.target.children ? true : false;
  var canalSizeSrc = d.source.data.numberOfStories*canalSize;
  var canalSizeTar = d.target.data.numberOfStories*canalSize;

  if (d.leftLink) {

    path.moveTo(d.source.x + canalSizeSrc, d.source.y);
    path.lineTo(d.source.x + canalSizeSrc, d.target.y + canalSizeTar);

    if (targetHasChildren) {
      path.lineTo(d.target.x - canalSizeTar, d.target.y + canalSizeTar);
    } else {
      path.lineTo(d.target.x, d.target.y + canalSizeTar);
      path.lineTo(d.target.x, d.target.y);
    }
  } else if (d.rightLink)  {
    path.moveTo(d.source.x + canalSizeSrc, d.source.y);

    path.lineTo(d.source.x + canalSizeSrc, d.target.y - canalSizeTar);

    if (targetHasChildren) {
      path.lineTo(d.target.x - canalSizeTar, d.target.y - canalSizeTar);
    } else {
      path.lineTo(d.target.x, d.target.y - canalSizeTar);
      path.lineTo(d.target.x, d.target.y);
    }
  }
  return path.toString();
}

function diagonalLinkUp(d,numberOfStories) {

  var path = d3.path();
  var targetHasChildren = d.target.children ? true : false;
  var canalSizeSrc = d.source.data.numberOfStories*canalSize;
  var canalSizeTar = d.target.data.numberOfStories*canalSize;

  if (d.leftLink) {

    path.moveTo(d.source.x - canalSizeSrc, d.source.y - canalSizeSrc);
    path.lineTo(d.source.x - canalSizeSrc, d.target.y - canalSizeTar);

    if (targetHasChildren) {
      path.lineTo(d.target.x - canalSizeTar, d.target.y - canalSizeTar);
    } else {
      path.lineTo(d.target.x, d.target.y - canalSizeTar);
      path.lineTo(d.target.x, d.target.y);
    }
  } else if (d.rightLink) {
    path.moveTo(d.source.x - canalSizeSrc, d.source.y + canalSizeSrc);
    path.lineTo(d.source.x - canalSizeSrc, d.target.y + canalSizeTar);

    if (targetHasChildren) {
      path.lineTo(d.target.x - canalSizeTar, d.target.y + canalSizeTar);
    } else {
      path.lineTo(d.target.x, d.target.y + canalSizeTar);
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
//     .size([canalSize, EventY]);
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
