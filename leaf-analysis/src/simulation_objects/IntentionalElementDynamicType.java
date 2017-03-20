/**
 * 
 */
package simulation_objects;

/**
 * @author A.M.Grubb
 *
 */
public enum IntentionalElementDynamicType {
	NT (0, "NT", "No Time") {
	}, RND (3, "R", "Stochastic") {
	}, CONST (0, "C", "Constant") {
	}, INC (0, "I", "Increasing") {  
	}, DEC (0, "D", "Decreasing") {  
	}, DS (0, "DS", "Denied-Satisfied") {
	}, SD (0, "SD", "Satisfied-Denied") {
	}, RC (0, "RC", "Random-Constant") {
	}, CR (0, "CR", "Constant-Random") {
	}, MONP (2, "MP", "Monotonic Positive") {
	}, MONN (2, "MN", "Monotonic Negative") {
	}, UD (2, "UD", "User-Defined") {
	};
	@SuppressWarnings("unused")
	private int value;
	private String code;
	private String name;
	private static final IntentionalElementDynamicType[] VALUES_ARRAY = new IntentionalElementDynamicType[] {NT, RND, CONST, INC, DEC, SD, DS, RC, CR, MONP, MONN, UD};
	public String toString() {
		return name;
	}
		
	public static IntentionalElementDynamicType getByCode(String code) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			IntentionalElementDynamicType result = VALUES_ARRAY[i];
			if (result.getCode().equals(code)) {
				return result;
			}
		}
		System.err.println("Dynamic not defined: " + code);
		return null;
	}

	public String getCode() {
		return code;
	}
	public String getName() {
		return name;
	}

	private IntentionalElementDynamicType(int value, String code, String name){
		this.value = value;
		this.code = code;
		this.name = name;
	}
	
}