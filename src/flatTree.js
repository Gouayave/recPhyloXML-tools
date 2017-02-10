var exports = module.exports = {};
exports.flatTree = flatTree;

var d3hierarchy = require('d3-hierarchy');


function flatTree(treeRoot) {

  treeRootNode = d3hierarchy.hierarchy(treeRoot,function(d) {
    return d.clade;
  });

  treeRootNode.each(function (node) {

    if(node.children && node.children.length)
    {
      node.children.forEach(function (child,posChild) {

        var listEvents = child.data.eventsRec;
        var newEvent = null;


        while (listEvents && (newEvent = listEvents.shift()))
        {

          switch (newEvent.eventType) {
            case "speciationLoss":
              var newChildName = child.data.name+"_SpL";
              var lossChildName = child.data.name+"_Loss";
              var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"Undefined");
              node.data.clade[posChild] = newChild;
              newChild.clade.push(child.data);
              break;


            case "speciationOutLoss":
                var newChildName = child.data.name+"_SpOL";
                var lossChildName = child.data.name+"_Loss";
                var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"Undefined");
                node.data.clade[posChild] = newChild;
                newChild.clade.push(child.data);
              break;

            case "transferBack":
                var newChildName = child.data.name+"_TrB";
                var lossChildName = child.data.name+"_Loss";
                var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"Out");
                node.data.clade[posChild] = newChild;
                newChild.clade.push(child.data);
              break;

            default:
              child.data.eventsRec = [newEvent];

          }
        }
      });
    }
  });
  return treeRoot;
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
