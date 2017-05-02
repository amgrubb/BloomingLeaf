/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum IntentionalElementDynamicType {
	NT ("NT", "No Time") {
	}, RND ("R", "Stochastic") {
	}, CONST ("C", "Constant") {
	}, INC ("I", "Increasing") {  
	}, DEC ("D", "Decreasing") {  
	}, DS ("DS", "Denied-Satisfied") {
	}, SD ("SD", "Satisfied-Denied") {
	}, RC ("RC", "Random-Constant") {
	}, CR ("CR", "Constant-Random") {
	}, MONP ("MP", "Monotonic Positive") {
	}, MONN ("MN", "Monotonic Negative") {
	}, UD ("UD", "User-Defined") {
	}, NB ("NB", "Not-Both") {	
	};
	private String code;
	private String name;
	private static final IntentionalElementDynamicType[] VALUES_ARRAY = new IntentionalElementDynamicType[] {NT, RND, CONST, INC, DEC, SD, DS, RC, CR, MONP, MONN, UD, NB};
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

	private IntentionalElementDynamicType(String code, String name){
		this.code = code;
		this.name = name;
	}
	
}