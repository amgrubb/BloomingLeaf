package simulation;

import java.util.HashMap;
import java.util.List;
import java.util.ListIterator;

import org.jacop.constraints.And;
import org.jacop.constraints.Constraint;
import org.jacop.constraints.IfThen;
import org.jacop.constraints.IfThenElse;
import org.jacop.constraints.Or;
import org.jacop.constraints.PrimitiveConstraint;
import org.jacop.constraints.XgtY;
import org.jacop.constraints.XltY;
import org.jacop.constraints.XlteqY;
import org.jacop.core.BooleanVar;
import org.jacop.core.IntVar;

public class CSPIntentions {
	private final static boolean DEBUG = true;

	/**
	 *  Creates the dynamic function constraints for the full path.
	 *  NotBoth constraints created at the end of the function.
	 */
	private void initializeEvolvingFunctionsForIntentions(
			List<Constraint> constraints, ModelSpec spec,  
			BooleanVar[][][] values, HashMap<String, Integer> uniqueIDToValueIndex,
			IntVar[] timePoints, HashMap<IntVar, List<String>> timePointMap) {
	
    	for (Intention element : spec.getIntentions()){
    		if (DEBUG) System.out.println("Evolving Intention for " + element.id);
    		
    		IntentionalElementDynamicType tempType = element.dynamicType;
        	if ((tempType == IntentionalElementDynamicType.NT) || (element.dynamicType == IntentionalElementDynamicType.RND) || 
        		(tempType == IntentionalElementDynamicType.NB))
        		continue;
 
    		IntVar[] epochs = this.functionEBCollection.get(element);
    		boolean[] dynFVal = element.getDynamicFunctionMarkedValue();
    		
    	}
	}
    		/*
    		if (tempType == IntentionalElementDynamicType.CONST){
    			for (int t = 1; t < this.values[i].length; t++){
    				constraints.add(new And(createXeqY(this.values[i][t], this.values[i][0])));
    			}
    		} else if ((tempType == IntentionalElementDynamicType.INC) || (tempType == IntentionalElementDynamicType.MONP)){
    			for (int t = 0; t < this.values[i].length; t++){
    				for (int s = 0; s < this.values[i].length; s++){
    					if (t==s)
    						continue;
    					PrimitiveConstraint timeCondition = new XltY(this.timePoints[t], this.timePoints[s]);
    					initializePathIncreaseHelper(i, t, s, timeCondition, false);
    				}
    				if (tempType == IntentionalElementDynamicType.MONP){
    					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
    					constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), new And(tempDynValue)));
    				} else 
    					initializePathIncreaseMaxValueHelper(i, t, dynFVal, null);
    			}
        	} else if ((tempType == IntentionalElementDynamicType.DEC) || (tempType == IntentionalElementDynamicType.MONN)){
        		for (int t = 0; t < this.values[i].length; t++){
        			for (int s = 0; s < this.values[i].length; s++){
        				if (t==s)
        					continue;
    					PrimitiveConstraint timeCondition = new XltY(this.timePoints[t], this.timePoints[s]);
        				initializePathDecreaseHelper(i, t, s, timeCondition, false);
        			}
        			if (tempType == IntentionalElementDynamicType.MONN){
        				PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
        				constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), new And(tempDynValue)));
        			} else  
        				initializePathDecreaseMaxValueHelper(i, t, dynFVal, null);
        		}
        	} else if (tempType == IntentionalElementDynamicType.SD){
      			for (int t = 0; t < this.values[i].length; t++){
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(createXeqC(this.values[i][t], boolFS)),
            				new And(createXeqC(this.values[i][t], boolFD))));
            	}
        	} else if (tempType == IntentionalElementDynamicType.DS){
      			for (int t = 0; t < this.values[i].length; t++){
            		constraints.add(new IfThenElse(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(createXeqC(this.values[i][t], boolFD)),
            				new And(createXeqC(this.values[i][t], boolFS))));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.RC){
      			for (int t = 0; t < this.values[i].length; t++){
					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
            		constraints.add(new IfThen(new XlteqY(epochs[0], this.timePoints[t]), 
            				new And(tempDynValue)));
            	}    		
        	} else if (tempType == IntentionalElementDynamicType.CR){
      			for (int t = 0; t < this.values[i].length; t++){
					PrimitiveConstraint[] tempDynValue = createXeqC(this.values[i][t], dynFVal);
            		constraints.add(new IfThen(new XgtY(epochs[0], this.timePoints[t]), 
            				new And(tempDynValue)));
            	}    	
      		///************ UD Functions ******************	
        	} else if (tempType == IntentionalElementDynamicType.UD){
        		// Repeat has been unrolled.
        		if (epochs == null){	// Assume at least one EB.
					throw new RuntimeException("UD functions must have at least one EB. Fix node: " + element.getId());
				}
        		
				UDFunctionCSP funcUD = element.getCspUDFunct();
				String[] segmentDynamic = funcUD.getFunctions();
				boolean[][] segmentDynamicValue = funcUD.getDynamicValues();
				int numSegments = segmentDynamic.length;		//Segments not EBs
				IntVar segmentStart = null;
				IntVar segmentEnd = null;
				for (int nS = 0; nS < numSegments; nS ++){
					if (nS == 0){
						segmentStart = this.timePoints[0];//ths.zero;
						segmentEnd = epochs[0];
					} else if (nS == numSegments - 1) {
						segmentStart = epochs[nS - 1];
						segmentEnd = this.infinity;
					} else {
						segmentStart = epochs[nS - 1];
						segmentEnd = epochs[nS];
					}
					if (segmentDynamic[nS].equals(IntentionalElementDynamicType.CONST.getCode())){
						// Case: Constant - Unknown
						if (!segmentDynamicValue[nS][0] && !segmentDynamicValue[nS][1] && !segmentDynamicValue[nS][2] && !segmentDynamicValue[nS][3]){
							// For Constant-Unknown, we First find the timePoint index of the start of the segment.
							int startIndex = -1;
							if (nS == 0)
								startIndex = 0;
							else{
								IntVar startTime = epochToTimePoint.get(segmentStart);
								while((startTime != null) && (startTime.id.charAt(0) != 'T')){
									startTime = epochToTimePoint.get(startTime);
								}
								if (startTime == null){
									throw new RuntimeException("UD Function not correct " + element.getId() + " has missing EB.");
								}
								for (int p = 0; p < timePoints.length; p++){
									if (timePoints[p] == startTime){
										startIndex = p;
										break;
									}
								}
								if (startIndex == -1){
									throw new RuntimeException("UD Function not correct " + element.getId() + " has missing EB.");
								}
							}
							for (int t = 0; t < this.values[i].length; t++){
								PrimitiveConstraint[] tempConstant = createXeqY(this.values[i][t], this.values[i][startIndex]);
								constraints.add(new IfThen(
										new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
										new And(tempConstant)));
							}
						}else{
							// Case: Constant FS, PS, PD, FD.
							for (int t = 0; t < this.values[i].length; t++){
								PrimitiveConstraint[] tempConstant = createXeqC(this.values[i][t], segmentDynamicValue[nS]);
								constraints.add(new IfThen(
										new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
										new And(tempConstant)));
							}
						}
	
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.INC.getCode())){	
						//INCREASING
		    			for (int t = 0; t < this.values[i].length; t++){
		    				for (int s = 0; s < this.values[i].length; s++){
		    					if (t==s)
		    						continue;
		                		PrimitiveConstraint timeCondition = new And(new XltY(this.timePoints[t], this.timePoints[s]),
	                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
	                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))));
		    					initializePathIncreaseHelper(i, t, s, timeCondition, false);
		    				}
	                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t]));
		    				initializePathIncreaseMaxValueHelper(i, t, segmentDynamicValue[nS], timeCondition);
		    			}
					} else if (segmentDynamic[nS].equals(IntentionalElementDynamicType.DEC.getCode())){
						//DECREASING
						for (int t = 0; t < this.values[i].length; t++){
		        			for (int s = 0; s < this.values[i].length; s++){
		        				if (t==s)
		        					continue;
		                		PrimitiveConstraint timeCondition = new And(new XltY(this.timePoints[t], this.timePoints[s]),
	                					new And(new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t])),
	                							new And(new XlteqY(segmentStart, this.timePoints[s]), new XgtY(segmentEnd, this.timePoints[s]))));
		        				initializePathDecreaseHelper(i, t, s, timeCondition, false);
		        			}
	                		PrimitiveConstraint timeCondition = new And(new XlteqY(segmentStart, this.timePoints[t]), new XgtY(segmentEnd, this.timePoints[t]));
	        				initializePathDecreaseMaxValueHelper(i, t, segmentDynamicValue[nS], timeCondition);
		        		}
					}
				}
        	}
*/
	
	public static void addNBFunctions() {
//    	// Not Both Dynamic Functions.
//    	List<NotBothLink> notBothLinkList = this.spec.getNotBothLink();	
//    	for(ListIterator<NotBothLink> ec = notBothLinkList.listIterator(); ec.hasNext(); ){		
//    		NotBothLink link = ec.next();
//            IntVar epoch = this.notBothEBCollection.get(link);
//            int ele1 = link.getElement1().getIdNum();
//            int ele2 = link.getElement2().getIdNum();
//            for (int t = 0; t < this.values[ele1].length; t++){
//            	if(link.isFinalDenied())
//            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[t]), 
//            				new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolTT))),
//            				new Or(new And(new And(createXeqC(this.values[ele1][t], boolFS)), new And(createXeqC(this.values[ele2][t], boolFD))),
//            					   new And(new And(createXeqC(this.values[ele1][t], boolFD)), new And(createXeqC(this.values[ele2][t], boolFS))))));
//            	else
//            		constraints.add(new IfThenElse(new XgtY(epoch, this.timePoints[t]), 
//            				new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolTT))),
//            				new Or(new And(new And(createXeqC(this.values[ele1][t], boolFS)), new And(createXeqC(this.values[ele2][t], boolTT))),
//            					   new And(new And(createXeqC(this.values[ele1][t], boolTT)), new And(createXeqC(this.values[ele2][t], boolFS))))));            		
//            }
//    	}
		System.out.print("Add NB functions");
	}
	
}
