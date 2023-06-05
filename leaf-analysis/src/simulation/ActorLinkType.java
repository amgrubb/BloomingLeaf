package simulation;

public enum ActorLinkType {
	PI ("participates-in"), ISA ("is-a"), NONE ("no");
	
	private String code;

	private static final ActorLinkType[] VALUES_ARRAY = new ActorLinkType[] {PI, ISA};
	public static ActorLinkType getByCode(String code) {
		for (int i = 0; i < VALUES_ARRAY.length; ++i) {
			ActorLinkType result = VALUES_ARRAY[i];
			if (result.getCode().equals(code)) {
				return result;
			}
		}
		return null;
	}
	public String getCode() {
		return code;
	}
	private ActorLinkType(String code) {
		this.code = code;
	}

}