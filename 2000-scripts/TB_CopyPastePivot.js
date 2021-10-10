/*
-------------------------------------------------------------------------------
Name:         TB_CopyPastePivot.js

Description:  Copies a pivot's position from a peg, and allows it to be pasted back to other pegs.

Usage:        With a peg selected, use TB_CopyPivot to remember the position of the selected node's pivot.
              With peg(s) selected, use TB_PastePivot to paste the copied position.

Author:       Chris Fourney

Created:      v01 2021/05/07

Copyright:    (c) Toon Boom Animation 2020

-------------------------------------------------------------------------------
*/


function TB_CopyPivot()
{
  var selCount = selection.numberOfNodesSelected();

  var clipboard = QApplication.clipboard();
  if( !clipboard )
    return;
  
  var clipboardString = "";

  for( var n=0;n<selCount;n++ )
  {
    var selNode = selection.selectedNode(n);
    var selType = node.type(selNode);

    selType = selType.toUpperCase();
    
    if( selType == "PEG" || selType == "READ" )
    {
      var vals = [];
      vals.push( node.getTextAttr(selNode, 1, "pivot.x") );
      vals.push( node.getTextAttr(selNode, 1, "pivot.y") );
      
      clipboardString = vals.join( "," );
      
    }
    else if( selType == "TRANSFORMLIMIT" )
    {
      var vals = [];
      vals.push( node.getTextAttr(selNode, 1, "pos.x") );
      vals.push( node.getTextAttr(selNode, 1, "pos.y") );
      
      clipboardString = vals.join( "," );
    }
    
    clipboard.setText( clipboardString );

  }
}

function TB_PastePivot()
{
  scene.beginUndoRedoAccum("PastePivot");

  //selection.selectedNode(int i);
  var selCount = selection.numberOfNodesSelected();
  
  var clipboard = QApplication.clipboard();
  if( !clipboard )
    return;
  
  var clipboardString = clipboard.text();
  var clipboardVals   = clipboardString.split(",");
  
  if( clipboardVals.length < 2 )
  {
    MessageLog.trace( tr.translate("Unable to paste pivot -- no pivot has been copied.") );
    return;
  }
  
  var x = parseFloat( clipboardVals[0] );
  var y = parseFloat( clipboardVals[1] );
  
  if( isNaN(x) || isNaN(y) )
  {
    MessageLog.trace( tr.translate("Unable to paste pivot -- invalid pivot value in clipboard.") );
    return;
  }

  for( var n=0;n<selCount;n++ )
  {
    var selNode = selection.selectedNode(n);
    var selType = node.type(selNode);

    selType = selType.toUpperCase();


    if( selType == "PEG" || selType == "READ" )
    {
      node.setTextAttr(selNode, "pivot.x", 0, x);
      node.setTextAttr(selNode, "pivot.y", 0, y);
    }
    else if( selType == "TRANSFORMLIMIT" )
    {
      node.setTextAttr(selNode, "pos.x", 1, x);
      node.setTextAttr(selNode, "pos.y", 1, y);
      node.setTextAttr(selNode, "pos.separate", 1,"true");
    }
  }
  
  scene.endUndoRedoAccum();
}