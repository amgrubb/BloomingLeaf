/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum DecompositionType {
	AND (0, "AND", "And"), OR (1, "OR", "Or"); //, XOR (2, "XOR", "Xor");
	
	private int value;
	private String code;
	private String name;

	private static final DecompositionType[] VALUES_ARRAY = new DecompositionType[] {
		AND,
		OR,
		//XOR,
	};

	public static DecompositionType getByCode(String code) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			DecompositionType result = VALUES_ARRAY[i];
			if (result.getCode().equals(code)) {
				return result;
			}
		}
		return null;
	}


	public static DecompositionType getByName(String name) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			DecompositionType result = VALUES_ARRAY[i];
			if (result.getName().equals(name)) {
				return result;
			}
		}
		return null;
	}

	public int getValue() {
		return value;
	}
	public String getName() {
		return name;
	}
	public String getCode() {
		return code;
	}


	public static DecompositionType get(int value) {
		switch (value) {
		case 0: return AND;
		case 1: return OR;
		//case 2: return XOR;
		}
		return null;
	}


	private DecompositionType(int value, String code, String name) {
		this.value = value;
		this.code = code;
		this.name = name;
	}

}
