/*
-------------------------------------------------------------------------------
Name:         TB_CheckSelectedPegPivots.js

Description:  Logs all peg pivots to the Message Log view whose pivot values remain X = 0, Y = 0. 


Usage: When building rigs, it is helpful to check to make sure you have set all the pivots for the
pegs before saving it out to be animated. To use this script, Alt or Option drag across all groups or
pegs in the Node View (to select everything within groups). With everything selected, click the script
button TB_CheckSelectedPegPivots in your customized Node View toolbar. The Message Log View window will 
show a list of pegs that still have their pivot values at X = 0, Y = 0. Sometimes the Message Log has 
a lot of text, so you may want to right click on it and Clear Log before running this script.

Author:       Marie-Eve Chartrand

Created:      v01 2020/05/14

Copyright:    (c) Toon Boom Animation 2020

-------------------------------------------------------------------------------
*/
function TB_CheckSelectedPegPivots(){

	var nodes = selection.numberOfNodesSelected();

	MessageLog.trace("START OF PIVOT CHECK.");

	for(var n = 0; n < nodes; n++){

		var nd = selection.selectedNode(n);
		var nodeType = node.type(nd);

		 if( nodeType == "PEG" ){

			var pivotX = node.getTextAttr	(nd, 0, "pivot.x");
   			var pivotY = node.getTextAttr	(nd, 0, "pivot.y");

			if(pivotX == 0.0000 && pivotY == 0.0000){MessageLog.trace("Pivot at 0: " + nd)};
				
		}//END OF IF	

	}//END OF FOR	

	MessageLog.trace("END OF PIVOT CHECK.\n\n\n");

}//END OF FUNCTION