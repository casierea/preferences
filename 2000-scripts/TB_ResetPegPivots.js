/*
-------------------------------------------------------------------------------
Name:         TB_ResetPegPivots.js

Description:  Resets all selected Peg pivots to X = 0, Y = 0. 


Usage: This is helpful when copying an existing file template of an already-built character rig. 
Here are typical instructions on how to complete the process: Normally, you would copy all
the pegs, drawing layers, etc from the Node View and then Paste Special. In the Paste Special
dialogue, In Drawings, check "Do Nothing", uncheck "Enforce Key Exposure", uncheck "Paste
Only Drawings from the Current Syced Layer. In Options, checkmark "Nodes: Create New Columns"
In Add/Remove Keyframes, uncheck all the boxes. When you click ok, an empty skeleton of your
rig will be pasted with no drawing swaps. Usually, keyframes will still be pasted on the Timeline.
In the Timeline, collapse the rig by pressing 0 and then delete all keyframes. On Frame 1, with
the rig collapsed, use the Animate Current Frame and Transform tool and press R to reset all layers
so all keyframed values will be 0's and 1's in the Coordinate Toolbar. In the Node View, Alt or Option
drag across the entire rig or rig group in order to select all elements inside of the selected group
or groups. Then click on the TB_ResetPegPivots script button when added to your toolbar in order to
reset all peg pivots to X = 0, Y = 0.

Author:       Marie-Eve Chartrand

Created:      v01 2020/05/14

Copyright:    (c) Toon Boom Animation 2020

-------------------------------------------------------------------------------
*/
function TB_ResetPegPivot(){

	//Undo Stack
	scene.beginUndoRedoAccum("Reset Peg Pivot");

	var nodes = selection.numberOfNodesSelected();


	for(var n = 0; n < nodes; n++){

		var nd = selection.selectedNode(n);
		var nodeType = node.type(nd);


		 if( nodeType == "PEG" ){

			node.setTextAttr	(nd, "pivot.x", 0, 0);
   			node.setTextAttr	(nd, "pivot.y", 0, 0);
			
		
		}//END OF IF	


	}//END OF FOR	


	scene.endUndoRedoAccum();
	

}//END OF FUNCTION