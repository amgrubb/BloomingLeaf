/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum ContributionType {
	// iStar
	//MAKE (0, "MAKES", "Make"), HELP (1, "HELPS", "Help"), UNKNOWN (3, "UNKNOWN", "Unknown"), HURT (5, "HURTS", "Hurt"), BREAK (6, "BREAKS", "Break");
	// iStar + Tropos
	MAKE (0, "MAKES", "Make"), HELP (1, "HELPS", "Help"), HURT (5, "HURTS", "Hurt"), BREAK (6, "BREAKS", "Break"),
	MAKESAT (0, "SMAKES", "Make_SAT"), HELPSAT (1, "SHELPS", "Help_SAT"), HURTSAT (5, "SHURTS", "Hurt_SAT"), BREAKSAT (6, "SBREAKS", "Break_SAT"),
	MAKEDEN (0, "DMAKES", "Make_DEN"), HELPDEN (1, "DHELPS", "Help_DEN"), HURTDEN (5, "DHURTS", "Hurt_DEN"), BREAKDEN (6, "DBREAKS", "Break_DEN"),
	NOTBOTH (6, "NOTBOTH", "Not(XandY)");
	private int value;
	private String code;
	private String name;
	private static final ContributionType[] VALUES_ARRAY =
			new ContributionType[] {
		MAKE, HELP, HURT, BREAK,
		MAKESAT, HELPSAT, HURTSAT, BREAKSAT,
		MAKEDEN, HELPDEN, HURTDEN, BREAKDEN,
		NOTBOTH
	};
	
	public static ContributionType getByCode(String code) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			ContributionType result = VALUES_ARRAY[i];
			if (result.getCode().equals(code)) {
				return result;
			}
		}
		return null;
	}
	public String getCode() {
		return code;
	}
	public String getName() {
		return name;
	}
	public int getValue() {
		return value;
	}

	private ContributionType(int value, String code, String name) {
		this.value = value;
		this.code = code;
		this.name = name;
	}

}
