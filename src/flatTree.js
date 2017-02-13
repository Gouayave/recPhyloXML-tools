var exports = module.exports = {};
exports.flatTree = flatTree;

var d3hierarchy = require('d3-hierarchy');

var defaultConfig = {
  transferBack : true,
  speciationLoss : true,
  speciationOutLoss : true,
}

function flatTree(treeRoot,config = {}) {

  var virtualRoot = {
    name : "Out",
    eventsRec : treeRoot.eventsRec,
    clade : [treeRoot]
  }

  treeRootNode = d3hierarchy.hierarchy(virtualRoot,function(d) {
    return d.clade;
  });

  treeRootNode.each(function (node) {

    if(node.children && node.children.length)
    {
      node.children.forEach(function (child,posChild) {

        var listEvents = child.data.eventsRec;
        var newEvent = null;
        var startNode = undefined;
        var currentNode = undefined;


        while (listEvents && (newEvent = listEvents.shift())){
          switch (newEvent.eventType) {
            case "speciationLoss":
              var newChildName = child.data.name+"_SpL";
              var lossChildName = child.data.name+"_Loss";
              if(config.speciationLoss == false)
              {
                var newChild = createNewSubTree(newChildName,newEvent);
              }
              else {
                var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"undefined");
              }

              if(!startNode && !currentNode)
              {
                startNode = newChild;
                currentNode = newChild;
              }else {
                currentNode.clade.push(newChild);
                currentNode = newChild;
              }


              break;


            case "speciationOutLoss":
                var newChildName = child.data.name+"_SpOL";
                var lossChildName = child.data.name+"_Loss";
                if(config.speciationOutLoss == false)
                {
                  var newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,newEvent.speciesLocation);
                }

                if(!startNode && !currentNode)
                {
                  startNode = newChild;
                  currentNode = newChild;
                }else {
                  currentNode.clade.push(newChild);
                  currentNode = newChild;
                }

              break;

            case "transferBack":
                var newChildName = child.data.name+"_TrB";
                var lossChildName = child.data.name+"_Loss";
                if(config.transferBack == false)
                {
                  var newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"out");
                }

                if(!startNode && !currentNode)
                {
                  startNode = newChild;
                  currentNode = newChild;
                }else {
                  currentNode.clade.push(newChild);
                  currentNode = newChild;
                }

              break;

            default:
              child.data.eventsRec = [newEvent];
          }
        }
        if(startNode && currentNode)
        {
          node.data.clade[posChild] = startNode;
          currentNode.clade.push(child.data);
        }

      });
    }
  });


  return virtualRoot.clade[0];
}

function createNewSubTreeWithChild(nodeName,nodeEvent,childName,childSpeciesLocation) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : [
      {
        name: childName,
        eventsRec : [{eventType: 'loss' , speciesLocation: childSpeciesLocation}]
      }
    ]
  }
}

function createNewSubTree(nodeName,nodeEvent) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : []
  }
}


//Insert a short subTree in a tree
// function insertSubTree(root, subTreeRoot) {
//   var oldSubTree = root.clade[posSubTree];
//   root.clade[posSubTree] = subTreeRoot;
//   subTreeRoot.clade.push(oldSubTree);
// }


// function createNewSubTree(nodeName,nodeEvent) {
//   return {
//     subName : nodeName,
//     event : nodeEvent,
//     clade : []
//   }
// }
