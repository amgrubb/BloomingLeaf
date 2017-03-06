/**
 * 
 */
package simulation;

import org.jacop.constraints.PrimitiveConstraint;
import org.jacop.constraints.XeqC;

/**
 * @author A.M.Grubb
 *
 */
public class IntentionalElement extends LinkableElement {
    // OBJECT VARIABLES
	Actor actor = null;
	IntentionalElementType type = IntentionalElementType.GOAL;
	IntentionalElementDynamicType dynamicType = IntentionalElementDynamicType.NT;
	DecompositionType decompositionType = null;
	boolean userDefinedDynamicType = false;
	UDFunction intUDFunct = null;	
	UDFunctionCSP cspUDFunct = null;
	boolean[] dynamicFunctionMarkedValue;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}
	
	public DecompositionType getDecompositionType() {
		return DecompositionType.AND; //decompositionType;
	}
	//TODO: This method is not currently called, and should be called by the Model Constructor.
	public void setDecompositionType(DecompositionType decompositionType) {
		this.decompositionType = decompositionType;
	}	

	public boolean isUserDefinedDynamicType() {
		return userDefinedDynamicType;
	}
	public UDFunction getIntUDFunct() {
		return intUDFunct;
	}
	
	public UDFunctionCSP getCspUDFunct() {
		return cspUDFunct;
	}

	public void setUserDefinedDynamicType(String inputLine, int maxEpoch) {
		this.userDefinedDynamicType = true;
		this.dynamicType = IntentionalElementDynamicType.UD;
		this.intUDFunct = new UDFunction(this, inputLine, maxEpoch);
		this.cspUDFunct = new UDFunctionCSP(this, inputLine);
	}
	
	public void setDynamicType(IntentionalElementDynamicType dynamicType, int maxEpoch) {
		this.dynamicType = dynamicType;
	}
	public void setDynamicFunctionMarkedValue(boolean[] dynamicFunctionMarkedValue) {
		if (!userDefinedDynamicType)
			this.dynamicFunctionMarkedValue = dynamicFunctionMarkedValue;
		else
			System.out.println("Error Assigning User-Defined: unknown epoch boundary value.");
	}
	public void oldSetDynamicFunctionMarkedValue(int dynamicFunctionMarkedValue) {
		switch (dynamicFunctionMarkedValue) {
		case 0:	
			this.dynamicFunctionMarkedValue = new boolean[] {true, true, false, false};
			break;
		case 1:	
			this.dynamicFunctionMarkedValue = new boolean[] {false, true, false, false};
			break;
		case 2:	
			this.dynamicFunctionMarkedValue = new boolean[] {false, false, true, false};
			break;
		case 3:	
			this.dynamicFunctionMarkedValue = new boolean[] {false, false, true, true};
			break;
		}
	}
	public boolean[] getDynamicFunctionMarkedValue() {
		if (userDefinedDynamicType)
			return null;
		else
			return dynamicFunctionMarkedValue;
	}
	public int oldGetDynamicFunctionMarkedValue() {
			if (userDefinedDynamicType)
				return -1;
			else
				if (this.dynamicFunctionMarkedValue[0] && this.dynamicFunctionMarkedValue[1] && !this.dynamicFunctionMarkedValue[2] && !this.dynamicFunctionMarkedValue[3])
					return 0;
				else if (!this.dynamicFunctionMarkedValue[0] && this.dynamicFunctionMarkedValue[1] && !this.dynamicFunctionMarkedValue[2] && !this.dynamicFunctionMarkedValue[3])
					return 1; 
				else if (!this.dynamicFunctionMarkedValue[0] && !this.dynamicFunctionMarkedValue[1] && this.dynamicFunctionMarkedValue[2] && !this.dynamicFunctionMarkedValue[3])
					return 1; 
				else if (!this.dynamicFunctionMarkedValue[0] && !this.dynamicFunctionMarkedValue[1] && this.dynamicFunctionMarkedValue[2] && this.dynamicFunctionMarkedValue[3])
					return 1; 
				else 
					return 5; 
	}
	public IntentionalElement(String nodeID, String nodeName, Actor nodeActor, String nodeType){
		super(nodeID, nodeName);
		this.actor = nodeActor;
		this.type = IntentionalElementType.getByName(nodeType); 
	}

}