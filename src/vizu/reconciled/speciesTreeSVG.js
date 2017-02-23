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

var storySize = 20;
var eventSize = 10 ;


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
    d.data.numberOfEvents = 5;
    d.data.numberOfCanaux = 5;
    d.data.numberOfStoriesOut = 2;
    // d.data.id = id++;
  });

  var posY = margin.top;
  inOrderTraversal(rootp,function (d) {
    var numberOfCanaux = d.data.numberOfCanaux || 1;
    var ctnSize = numberOfCanaux * storySize ;
    posY += ctnSize /2 ;
    d.y = posY;
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
    d.x = posX;
    d.posXEnd = posX + ctnLength + edgeWidth;

    if(d.posXEnd  > maxX)
    {
      maxX = d.posXEnd ;
    }
  });


  rootp.leaves().forEach(function (d) {
    d.maxX = maxX;
  })

  rootp.each(function (d) {
    d.data.chemins = [];
    var numberOfStoriesOut = d.data.numberOfStoriesOut || 1;
    var storySizeSrc = numberOfStoriesOut*storySize;

    var upX = d.x + storySizeSrc;
    var upY = d.y + storySizeSrc;
    var downX = d.x - storySizeSrc;
    var downY = d.y - storySizeSrc;

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
          d.data.chemins.push([d.x,upY - diffY*i]);
        }else{
          d.data.chemins.push([d.x ,downY+ diffY*i]);
        }
      }
    }
  });

  // svg
  // .attr("width", width + margin.right + margin.left)
  // .attr("height", height + margin.top + margin.bottom)
  // .append("g")
  // .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var points =
    svg.selectAll(".circle")
    .data(allNodes)
    .enter();

  points.append("circle")
  .attr("cx",function (d) {
      return getCanalCoord(d,1).x;
  })
  .attr("cy",function (d) {
      return getCanalCoord(d,1).y;
  })
  .attr("r",5)


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
    .style("stroke-width","2px")
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
  //     return "translate(" + d.x + "," + d.y + ")" ;
  //   })

  // var paths =
  //   svg.selectAll(".paths")
  //   .data(allLinks)
  //   .enter();
  //
  // paths
  //   .append("path")
  //   .attr("class", "paths")
  //   .style("fill","none")
  //   .style("stroke-width","1px")
  //   .style("stroke","blue")
  //   .attr("d", diagonal);
  //
  // paths
  //   .append("path")
  //   .attr("class", "paths")
  //   .style("fill","none")
  //   .style("stroke-width","1px")
  //   .style("stroke","blue")
  //   .attr("d", diagonal2);


  svg.selectAll(".node")
    .data(rootp.descendants())
    .enter()
    .append("text")
    .attr("class","node")
    //   .attr("transform", function(d) {
    //     return "translate(" + d.x + "," + d.y + ")" ;
    //   })
    .text(function(d) {
      var dead = d.data.dead ;
      return dead ? ""  : "(" + d.data.name +")" + d.data.numberOfStoriesOut;
    })
    .attr("text-anchor", function(d) {
      return "start";
    })
    .attr("font-size","20px");


}


function diagonalSpTree(d) {

  var numberOfEventSrc = d.source.data.numberOfEvents || 1;
  var numberOfEventTgt = d.target.data.numberOfEvents || 1;
  var numberOfCanauxSrc = d.source.data.numberOfCanaux || 1;
  var numberOfCanauxTgt = d.target.data.numberOfCanaux || 1;
  var targetHasChildren = d.target.children ? true : false;

  var posX = d.source.x;
  var posY = d.source.y;

  var path = d3.path();
  if (d.target.data.pos == 0) {

    //1
    posY -= numberOfCanauxSrc * storySize / 2;
    path.moveTo(posX, posY);
    //2
    posX += numberOfEventSrc * eventSize;
    path.lineTo(posX, posY);
    //3
    posY = d.target.y - (numberOfCanauxTgt * storySize / 2);
    path.lineTo(posX, posY);
    //4
    posX = d.target.x
    path.lineTo(posX, posY);
    //5

    if (!targetHasChildren) {
      // 5_1
      // posX += numberOfEventTgt * eventSize;
      posX = d.target.maxX;
      path.lineTo(posX, posY);
      // 5_2
      posY = d.target.y + (numberOfCanauxTgt * storySize / 2);
      path.lineTo(posX, posY);
      // 5_3
      posX = d.target.x;
      path.lineTo(posX, posY);
      // 5_4
      posY = d.source.y;
      path.lineTo(posX, posY);


    } else {
      //5
      posY = d.target.y + (numberOfCanauxTgt * storySize / 2);
      path.moveTo(posX, posY);
      //6
      posY = d.source.y;
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
    posY = d.target.y + (numberOfCanauxTgt * storySize / 2);
    path.lineTo(posX, posY);
    //4
    posX = d.target.x
    path.lineTo(posX, posY);
    //5

    if (!targetHasChildren) {
      // 5_1
      // posX += numberOfEventTgt * eventSize;
      posX = d.target.maxX;
      path.lineTo(posX, posY);
      // 5_2
      posY = d.target.y - (numberOfCanauxTgt * storySize / 2);
      path.lineTo(posX, posY);
      // 5_3
      posX = d.target.x;
      path.lineTo(posX, posY);
      // 5_4
      posY = d.source.y;
      path.lineTo(posX, posY);

    }
    else {
      //5
      posY = d.target.y - (numberOfCanauxTgt * storySize / 2);
      path.moveTo(posX, posY);
      //6
      posY = d.source.y;
      path.lineTo(posX, posY);

    }

  }
  return path.toString();
}

function getCanalCoord(nodeSpT,numCanal) {

  var numberOfCanaux = nodeSpT.data.numberOfCanaux || 1;

  var x = nodeSpT.x;
  var y = nodeSpT.y - (numberOfCanaux * storySize / 2) + (numCanal * storySize);

  if(nodeSpT.data.pos && nodeSpT.data.pos == 1)
  {
    y = nodeSpT.y + (numberOfCanaux * storySize / 2) - (numCanal * storySize);
  }

  return {
    x : x,
    y : y
  }
}

function diagonal(d) {
  var path = d3.path();
  path.moveTo(d.source.data.chemins[1][0], d.source.data.chemins[1][1]);
  path.lineTo(d.source.data.chemins[1][0], d.target.data.chemins[1][1]);
  path.lineTo(d.target.data.chemins[1][0], d.target.data.chemins[1][1]);
  return path.toString();
}

function diagonal2(d) {
  var path = d3.path();
  path.moveTo(d.source.data.chemins[0][0], d.source.data.chemins[0][1]);
  path.lineTo(d.source.data.chemins[0][0], d.target.data.chemins[0][1]);
  path.lineTo(d.target.data.chemins[0][0], d.target.data.chemins[0][1]);
  return path.toString();
}

// function diagonal(d) {
//   var path = d3.path();
//   path.moveTo(d.source.x, d.source.y);
//   path.lineTo(d.source.x, d.target.y);
//   path.lineTo(d.target.x, d.target.y);
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
