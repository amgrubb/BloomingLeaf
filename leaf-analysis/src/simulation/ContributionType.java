/**
 * 
 */
package simulation;

/**
 * @author A.M.Grubb
 *
 */
public enum ContributionType {
	P ("+"), PP ("++"), M ("-"), MM ("--"),
	SP ("+S"), SPP ("++S"), SM ("-S"), SMM ("--S"),
	DP ("+D"), DPP ("++D"), DM ("-D"), DMM ("--D"), NONE ("no");
	
	private String code;
	
	private static final ContributionType[] VALUES_ARRAY = new ContributionType[] {
		P, PP, M, MM, SP, SPP, SM, SMM, DP, DPP, DM, DMM, NONE};
	
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
	private ContributionType(String code) {
		this.code = code;
	}

}
