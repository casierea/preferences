/*
-------------------------------------------------------------------------------
Name:         TB_FindAndReplaceNodeName.js

Description:  Finds a given string and replaces it with another in all nodes, or selected nodes.

Usage:        With nodes selected, will affect only selected nodes -- otherwise applies to all nodes
              in the scene. Will find all occurences of a given string in the NAME of the node, and 
              replace it with the desired string. Wildcards are available; ? will match any single
              character, and * will match any number of characters.
              Run the function TB_FindAndReplaceNodeName(). 

Author:       Chris Fourney

Created:      v01 2020/09/10

Copyright:    (c) Toon Boom Animation 2020

-------------------------------------------------------------------------------
*/

function private_getLcs(str1, str2) {
  //Find the longest common substring.
  
  var lcsNeedle   = str1;
  var lcsHaystack = str2;
  
  if( str1.length > str2.length ){ 
    lcsHaystack = str1;
    lcsNeedle   = str2;
  }
    
  var foundMatch = false;
  
  //Compare the whole string at first.
  var lsclen = lcsNeedle.length
  
  //Move the cursor on the search and find the largest match.
  for(var lcsLength=0; lcsLength<lcsNeedle.length; lcsLength++){
    
    var lscStart=0
    for(var lcsRemaining=0; lcsRemaining<lcsLength+1; lcsRemaining++){  
      //-- Find every sliced value of the smaller string, and compare it against the bigger string.
      // identify if it exists within.
      
      var slice = lcsNeedle.slice( lscStart, lsclen+lscStart )      
      var re = new RegExp("(" + slice + ")", "i");
      
      if(re.test(lcsHaystack)){
       foundMatch=true;
       result = RegExp.$1;
       break;
      }
      
      lscStart = lscStart + 1;
    }
     
    if(foundMatch){
     return result; 
    }
    
    //Reduce the needle size.
    lsclen = lsclen - 1;
  }
   
  result = "";
  return result;
}

function private_lcsList( nodeList ){
  //Find the longest common substring from all node names.
  
  var lcsRanking = {};
  //Compare every second node name and find the ranking largest common substring
  //So an initial replace can be guessed -- compare all against all is too slow, 
  //this is a fast enough solution for larger selections.
  
  for( var n=0; n< nodeList.length-1; n+=2 ){
    var lcs = private_getLcs( node.getName(nodeList[n]), node.getName(nodeList[n+1]) );
    
    //Toss away anything smaller than 3
    if( lcs.length < 3 )
      continue;
    
    if( !lcsRanking[lcs] ){
      lcsRanking[lcs] = 0;
    } 

    lcsRanking[lcs]++;
  }
  
  var highestRanking = 0;
  var rankedValue = false;
  for( var x in lcsRanking ){
    if( lcsRanking[x] > highestRanking ){
      rankedValue = x;
      highestRanking = lcsRanking[x];
    }
  }
  
  return rankedValue;
}

function private_getNodes( group, nodeList ){   
  var subnodeCount = node.numberOfSubNodes( group );

  for( var n=0; n<subnodeCount;n++ ){
    var nn = node.subNode( group, n );
    nodeList.push( nn );
    
    if( node.type(nn) == "GROUP" ){
      nodeList = private_getNodes( nn, nodeList );       //Call yourself, and dig one group deeper.
    }
  }
  
  return nodeList;
}

function private_escapeRegex(string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function private_renameNode( nodeString, findRegexp, replaceText ){
  //-- Find and replace. 
  var oldName = node.getName(nodeString);
  var newName = oldName.replace(findRegexp, replaceText);
  
  //Make sure we're not trying to rename it with something existing.
  var newNameIdx = newName;
  var expectedFull = node.parentNode(nodeString) + "/" + newNameIdx;
  
  if( newNameIdx == oldName ){
    return;
  }
  
  var idx = 1;
  while( node.getName(expectedFull) ){
    var split = ("000"+idx).split(-3);
    newNameIdx = newName + split;
    
    var expectedFull = node.parentNode(nodeString) + "/" + newNameIdx;
    idx++;
  }
  
  var formatName = translator.tr("Renaming from %1 to %2");
  formatName = formatName.split("%1").join(nodeString);
  formatName = formatName.split("%2").join(newNameIdx);
  MessageLog.trace( formatName );
  
  node.rename( nodeString, newNameIdx );
}

//Internal function for doing the work.
function private_findReplaceNodeName( nodes, findText, replaceText, replaceAll, matchCase )
{
  var findText    = findText;
  var replaceText = replaceText;
  
  //Theyre the same! Ignore the action.
  if( findText == replaceText )
    return;
  
  //Collect the groups, modify them LAST.
  var groups = [];
  
  var startFind = false;
  var stopFind  = false;
  if( findText.slice(0, 1) == "^" ){
    startFind = true;
    findText = findText.slice(1, findText.length);
  }
  
  if( findText.slice(findText.length-1, findText.length) == "$" ){
    stopFind = true;
    findText = findText.slice(0, findText.length-1);
  }
  
  //Sanitize the names of the module.
  var find_re_star = findText.split( "*" );
  for( var x=0; x<find_re_star.length; x++ ){
    var find_re_qmark = find_re_star[x].split("?");
    for( var n=0; n<find_re_qmark.length; n++ ){
      find_re_qmark[n] = private_escapeRegex(find_re_qmark[n]);
      
      find_re_qmark[n] = find_re_qmark[n].split( " " ).join( "_" );
      find_re_qmark[n] = find_re_qmark[n].split( "/" ).join( "" );
    }

    find_re_star[x] = find_re_qmark.join(".?");
  }
  
  var regExpBase = find_re_star.join(".+");
  
  var helperString = "";
  if(replaceAll){
    helperString += "g";
  }
  if(!matchCase){
    helperString += "i";
  }
  
  if(startFind){
    regExpBase = "^" + regExpBase;
  }
  
  if(stopFind){
    regExpBase = regExpBase + "$";
  }
  
  var findRegexp = new RegExp("(" + regExpBase + ")", helperString);
  
  scene.beginUndoRedoAccum( translator.tr("Find and Replace Node Name") );
  
  //Iterate all the nodes and replace the offending portion of their names.
  for( var n=0;n<nodes.length;n++ ){
    if( node.type(nodes[n]) == "GROUP" )
    {
      groups.push(nodes[n]);
      continue;
    }
    
    private_renameNode( nodes[n], findRegexp, replaceText );
  }
  
  for( var n=0;n<groups.length;n++ ){
    private_renameNode( groups[n], findRegexp, replaceText );
  }
  
  scene.endUndoRedoAccum( );
  
}


//Used to find and replace existing node names in the scene.
// ? will match one character.
// * will match any number of character.
function TB_FindAndReplaceNodeName()
{
  try{
    //Check to see if this is a selection mode, or all nodes.
    var selNodeCount = selection.numberOfNodesSelected();
    
    var nodes = [];
    if( selNodeCount > 0 )
    {
      // Add all selected nodes to the list of nodes to rename.
      for( var n=0; n<selNodeCount; n++ ){
        nodes.push( selection.selectedNode(n) );
      }
    }else{
      //All nodes mode, add all nodes to this list.
      nodes = private_getNodes( "Top", [] );
    }
  
    if( nodes.length == 0 ){
      //No nodes.
      MessageLog.trace( translator.tr("Error : No nodes to find and replace.") );
      return;
    }
  
    var lcs_string = private_lcsList( nodes );
    
    //Create a find and replace GUI for the user.
  
    var findReplace = new Dialog();
    findReplace.title = translator.tr("Find and Replace - Node Names");
    
    var bodyText = new Label();
    
    var textVal = translator.tr("Find a string in all node names and replace it with another:");
    if( selNodeCount>0 )
    {
      textVal = translator.tr("Find a string in selected node names and replace it with another:");
    }
    
    bodyText.text = textVal;
    findReplace.add( bodyText );

    findReplace.addSpace( 15 );

    var findValue   = new LineEdit();
    findValue.label = translator.tr("Find:");
    findValue.text = lcs_string ? lcs_string : "";
    findReplace.add( findValue );
    
    var replaceValue   = new LineEdit();
    replaceValue.label = translator.tr("Replace:");
    replaceValue.text = lcs_string ? lcs_string : "";
    findReplace.add( replaceValue );
    
    var matchCase = new CheckBox();
    matchCase.text = translator.tr("Match Case");
    matchCase.checked = true;
    findReplace.add( matchCase );
    

    var replaceAll = new CheckBox();
    replaceAll.text = translator.tr("Replace All Matches in Name");
    replaceAll.checked = true;
    findReplace.add( replaceAll );
    
    var results = findReplace.exec();
    
    if(!results)
    {
      return;
    }
    
    private_findReplaceNodeName( nodes, findValue.text, replaceValue.text, replaceAll.checked, matchCase.checked );

  }catch(err){
    MessageLog.trace( translator.tr("Error: ") + err.message + "  " + err.lineNumber );
  }
  
}