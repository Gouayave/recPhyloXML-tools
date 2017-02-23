var exports = module.exports = {};
exports.populateSpTree = populateSpTree;

var d3hierarchy = require('d3-hierarchy');

//Le but de cette fonction est d'ajouter des éléments à l'arbres de especes:
// - Les espèces mortes qui sont dans l'arbre de gène
// - Donner à chaque noeud de l'arbre des espèces un nombre de gènes
// - Donner à chaque noeud de l'arbre des espèces un nb d'evenement

function populateSpTree (spTree,recTree) {

  console.error(JSON.stringify(recTree,null,1));
  var speciesNodes = d3hierarchy.hierarchy(spTree,function (n) {
    if(n.clade && !n._clade){
      n._clade = n.clade;
    }
    return n._clade;
  });

  var allSpecies = speciesNodes.descendants();

  var genesNodes = d3hierarchy.hierarchy(recTree,function (n) {
    return n.clade;
  });
  var allGenesNodes = genesNodes.descendants();

  // On cherche toutes les speciationsOut pour ajouter par la suite les espèces mortes dans l'arbre des espèces
  var allSpeciationOutNode = allGenesNodes.filter(function (geneNode) {
    return geneNode.data.eventsRec[0].eventType == "speciationOut" || geneNode.data.eventsRec[0].eventType == "speciationOutLoss";
  });

  // On cherche les espèces dont les enfants changeront par une espèces morte
  for (specOutNode of allSpeciationOutNode) {
    var speciesNode = getSpeciesClade(specOutNode.data.eventsRec[0].speciesLocation,allSpecies);
    addDeadSpeciesInSpeciesTree(speciesNode,specOutNode);
  }

  // genesNodes.each(function (gn) {
  //   var speci
  //   gn.data.speciesClade = getSpeciesClade(gn.data.eventsRec[0].speciesLocation,allSpecies);
  //   var name = "null"
  //   if(gn.data.speciesClade)
  //   {
  //     name = gn.data.speciesClade.data.name;
  //   }
  //   console.error(gn.data.name,name)
  // });



  //console.error(JSON.stringify(recTree,null,1));
  //ON a mtn l'arbre des espèces avec les espèces mortes



};

// recherche dans toute les espèces celle qui correspond à celle du gène
function getSpeciesClade(spLocation,allSpecies) {
  var spClade = allSpecies.find(function (child) {
    return child.data.name == spLocation;
  });
  return spClade;
}


// Modification de l'abre des especes
function addDeadSpeciesInSpeciesTree(speciesNode,specOutNode) {

  var nameSpecies = speciesNode.data.name;
  var geneName = specOutNode.data.name;
  var parentNode = speciesNode.parent;
  var indexClade = parentNode.data._clade.findIndex(function (c) {
    return nameSpecies == c.name;
  });

  var startClade = createNewSubTreeWithChild(nameSpecies+"_out",nameSpecies+"_dead",geneName);
  var currentClade = startClade;


  recursiveBifurcationOut(specOutNode.data);

  //Création de façon récursive d'un arbre de clade
  function recursiveBifurcationOut(specOutNodeClade) {
    if(specOutNodeClade.clade)
    {
      specOutNodeClade.clade.forEach(function (childClade,i) {
        if(childClade.eventsRec[0].eventType == "bifurcationOut")
        {
          var newTree = createNewSubTreeWithTwoChildren(nameSpecies+"_bif",nameSpecies+"_dead",geneName);
          currentClade._clade = [newTree];
          currentClade = newTree;
          recursiveBifurcationOut(childClade);
        }
      });
    }
  }
  parentNode.data._clade[indexClade] = startClade;
  startClade._clade.push(speciesNode.data);


}

//Creer un sous clade de l'arbre des espèces
function createNewSubTreeWithChild(nodeName,childName,geneName) {
    return {
      name : nodeName,
      geneNames : [geneName],
      spOut : true,
      _clade : [
        {
          name: childName,
          geneName : [geneName],
          dead : true
        }
      ]
    }
}

//Creer un sous clade de l'arbre des espèces
function createNewSubTreeWithTwoChildren(nodeName,childName,geneName) {
    return {
      name : nodeName,
      geneNames : [geneName],
      dead : true,
      _clade : [
        {
          name: childName,
          geneName : [geneName],
          dead : true
        },
        {
          name: childName,
          geneName : [geneName],
          dead : true
        }
      ]
    }
}
