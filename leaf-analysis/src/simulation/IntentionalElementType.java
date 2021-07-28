/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum IntentionalElementType {
	SOFTGOAL (0, "S", "Softgoal"), GOAL (1, "G", "Goal"), TASK (2, "T", "Task"), RESOURCE (3, "R", "Resource");
	private int value;
	private String name;
	private String literal;
	
	
	public int getValue() {
		return value;
	}

	public String getLiteral() {
		return literal;
	}
	public String getCode() {
		return name;
	}

	private static final IntentionalElementType[] VALUES_ARRAY =
        new IntentionalElementType[] {
			SOFTGOAL,
			GOAL,
			TASK,
			RESOURCE,
		};

    public static IntentionalElementType getByLiteral(String literal) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			IntentionalElementType result = VALUES_ARRAY[i];
			if (result.toString().equals(literal)) {
				return result;
			}
		}
		return null;
	}

    /**
	 * Returns the '<em><b>Intentional Element Type</b></em>' literal with the specified name.
	 * <!-- begin-user-doc -->
	 * <!-- end-user-doc -->
	 * @param name the name.
	 * @return the matching enumerator or <code>null</code>.
	 * @generated
	 */
	public static IntentionalElementType getByName(String name) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			IntentionalElementType result = VALUES_ARRAY[i];
			if (result.getName().equals(name)) {
				return result;
			}
		}
		return null;
	}

	public static IntentionalElementType getByBBMName(String name) { 
		if (name.equals("basic.Task"))
			return TASK;
		else if (name.equals("basic.Goal"))
			return GOAL;			
		else if (name.equals("basic.Softgoal"))
			return SOFTGOAL;
		else if (name.equals("basic.Resource"))
			return RESOURCE;
		else
			return null;
		
	}
	private String getName() {
		return name;
	}

	/**
	 * Returns the '<em><b>Intentional Element Type</b></em>' literal with the specified integer value.
	 * <!-- begin-user-doc -->
     * <!-- end-user-doc -->
	 * @param value the integer value.
	 * @return the matching enumerator or <code>null</code>.
	 * @generated
	 */
    public static IntentionalElementType get(int value) {
		switch (value) {
			case 0: return SOFTGOAL;
			case 1: return GOAL;
			case 2: return TASK;
			case 3: return RESOURCE;
		}
		return null;
	}

	private IntentionalElementType(int value, String name, String literal) {
		this.value = value;
		this.name = name;
		this.literal = literal;
	}



}
