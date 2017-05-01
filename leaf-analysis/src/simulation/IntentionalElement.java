/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public class IntentionalElement extends LinkableElement {
    // OBJECT VARIABLES
	Actor actor = null;
	IntentionalElementType type = IntentionalElementType.GOAL;
	public IntentionalElementDynamicType dynamicType = IntentionalElementDynamicType.NT;
	boolean userDefinedDynamicType = false;	
	UDFunctionCSP cspUDFunct = null;
	boolean[] dynamicFunctionMarkedValue;
	
	public int getIdNum() {
		return Integer.parseInt(id);
	}

	public Actor getActor() {
		return actor;
	}

	public void setActor(Actor actor) {
		this.actor = actor;
	}

	public IntentionalElementType getType() {
		return type;
	}

	public void setType(IntentionalElementType type) {
		this.type = type;
	}

	public IntentionalElementDynamicType getDynamicType() {
		return dynamicType;
	}

	public void setUserDefinedDynamicType(boolean userDefinedDynamicType) {
		this.userDefinedDynamicType = userDefinedDynamicType;
	}

	public void setCspUDFunct(UDFunctionCSP cspUDFunct) {
		this.cspUDFunct = cspUDFunct;
	}

	public boolean isUserDefinedDynamicType() {
		return userDefinedDynamicType;
	}
		
	public UDFunctionCSP getCspUDFunct() {
		return cspUDFunct;
	}

	public void setUserDefinedDynamicType(String inputLine, int maxEpoch) {
		this.userDefinedDynamicType = true;
		this.dynamicType = IntentionalElementDynamicType.UD;
		this.cspUDFunct = new UDFunctionCSP(inputLine);
	}
	
	public void setDynamicType(IntentionalElementDynamicType dynamicType) {
		this.dynamicType = dynamicType;
	}
	
	public void setDynamicFunctionMarkedValue(boolean[] dynamicFunctionMarkedValue) {
		if (!userDefinedDynamicType)
			this.dynamicFunctionMarkedValue = dynamicFunctionMarkedValue;
		else
			System.out.println("Error Assigning User-Defined: unknown epoch boundary value.");
	}
	
	public boolean[] getDynamicFunctionMarkedValue() {
		if (userDefinedDynamicType)
			return null;
		else
			return dynamicFunctionMarkedValue;
	}
	
	public IntentionalElement(String nodeID, String nodeName, Actor nodeActor, String nodeType){
		super(nodeID, nodeName);
		this.actor = nodeActor;
		this.type = IntentionalElementType.getByName(nodeType); 
	}

}