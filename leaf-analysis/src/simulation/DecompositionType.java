/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum DecompositionType {
	AND ("AND"), OR ("OR");
	private String code;

	private static final DecompositionType[] VALUES_ARRAY = new DecompositionType[] {AND,OR};
	public static DecompositionType getByCode(String code) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			DecompositionType result = VALUES_ARRAY[i];
			if (result.getCode().equals(code)) {
				return result;
			}
		}
		return null;
	}
	public String getCode() {
		return code;
	}
	private DecompositionType(String code) {
		this.code = code;
	}

}
