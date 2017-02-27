var exports = module.exports = {};
exports.getAbstractPosition = getAbstractPosition;

var d3hierarchy = require('d3-hierarchy');

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

function preOrderTraversalCustom(rootGt,rootSp) {

  rootSp.arrayOfStories = rootSp.arrayOfStories || [];

  if(rootGt.clade)
  {

    if(rootGt.eventsRec[0].eventType == "duplication")
    {
      var outs = manageDuplication(rootSp,rootGt);
      for (out of outs) {
        preOrderTraversalCustom(out,rootSp)
      }
    }
    else {
      rootGt.spTree = rootSp;
      rootSp.arrayOfStories.push(rootGt);
      manageStandard(rootSp,rootGt);

      var c0gt = rootGt.clade[0].eventsRec[0].speciesLocation ||
      rootGt.clade[0].eventsRec[0].destinationSpecies;

      var c1gt = rootGt.clade[1].eventsRec[0].speciesLocation ||
      rootGt.clade[1].eventsRec[0].destinationSpecies;

      var c0sp = rootSp.clade[0].name;

      var c1sp = rootSp.clade[1].name;



      if(c0gt == c0sp){
        preOrderTraversalCustom(rootGt.clade[0],rootSp.clade[0]);
      } else if (c0gt == c1sp){
        preOrderTraversalCustom(rootGt.clade[0],rootSp.clade[1]);
      }

      if(c1gt == c0sp){
        preOrderTraversalCustom(rootGt.clade[1],rootSp.clade[0]);
      } else if (c1gt == c1sp){
        preOrderTraversalCustom(rootGt.clade[1],rootSp.clade[1]);
      }
    }



  }
  else {
    rootGt.spTree = rootSp;
    rootSp.arrayOfStories.push(rootGt);
    manageStandard(rootSp,rootGt);
  }
}


function getAbstractPosition(cladeSpT,cladeRecT) {
  preOrderTraversalCustom(cladeRecT,cladeSpT);
}

function manageStandard(cladeSpT,cladeRecT) {

  if(!cladeRecT.posInSpTree)
   cladeRecT.posInSpTree = [cladeSpT.numberOfEvents,cladeSpT.numberOfCanaux++];



  if(! (cladeRecT.eventsRec[0].eventType == "leaf" ) )
  {
    cladeSpT.numberOfStoriesOut = cladeSpT.numberOfStoriesOut + 1;
  }

}


function manageDuplication(cladeSpT,cladeRecT) {

  var speciesLocation = cladeSpT.name;
  cladeSpT.arrayOfStories = cladeSpT.arrayOfStories || [];

  var nodeRecT = d3hierarchy.hierarchy(cladeRecT,function (n) {
    if(n.clade && n.eventsRec[0].speciesLocation == speciesLocation)
    {
      n.spTree = cladeSpT;
      return n.clade;
    }
  });

  var numberOfCanaux = cladeSpT.numberOfCanaux;
  var numberOfEvents = cladeSpT.numberOfEvents;
  var numberOfStoriesOut = cladeSpT.numberOfStoriesOut;
  var arrayOfStoriesOut = [];

  inOrderTraversal(nodeRecT,function (n) {

    n.data.posInSpTree = [n.depth,numberOfCanaux++];
    if(n.depth > numberOfEvents)
    {
      numberOfEvents = n.depth;
    }
    if(!n.children && n.data.eventsRec[0].eventType != "loss")
    {
      n.data.posInOut = numberOfStoriesOut++;
    }
    if(!n.children)
    {
      arrayOfStoriesOut.push(n.data);
    }else {
      cladeSpT.arrayOfStories.push(n.data);
    }

  });

  cladeSpT.numberOfCanaux = numberOfCanaux;
  cladeSpT.numberOfEvents = numberOfEvents;
  cladeSpT.numberOfStoriesOut = numberOfStoriesOut;


  return arrayOfStoriesOut;
}
