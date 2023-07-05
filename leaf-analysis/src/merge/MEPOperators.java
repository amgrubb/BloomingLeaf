package merge;

import java.util.HashMap;
import java.lang.Math;

/********
 * Merge evidence pair operators:
 * consensus, comparison, and distance operators
 ********/

public class MEPOperators {
	// initialize hashmap for comparing evidence pairs
	private static HashMap<String, Integer> compareEP;
	static {
		compareEP = new HashMap<>();
		compareEP.put("0011", 2);   // fully satisfied
		compareEP.put("0010", 1);   // partially satisfied
		compareEP.put("0000", 0);   // none
		compareEP.put("0100", -1);  // partially denied
		compareEP.put("1100", -2);  // fully denied
	}  
	
	/*********************
	 * consensus operator
	 *********************/
	public static String consensus(String evPair1, String evPair2) {
		// consensus of "(no value)" and evPair2 is evPair2
		if (evPair1.equals("(no value)")) {
			return evPair2;
		} else if (evPair2.equals("(no value)")) {
			return evPair1;
		}
		
		// consensus: for each 0/1 in evpairs (e.g. "0010"),
		// 1 if both 1, else 0
		String result = "";
		for(int i = 0; i < 4; i++) {
			// append 1 if both 1, else 0
		   if (evPair1.charAt(i) == '1' && evPair2.charAt(i) == '1') {
			   result += "1";
		   } else {
			   result += "0";  
		   }
		}
		
		if (MMain.DEBUG) System.out.println("consensus of " + evPair1 + " and " + evPair2 + " is: " + result);

		return result;
	}
	
	/**********************
	 * comparison operators
	 **********************/
	public static int compare(String a, String b) {
		/* is a > b (1 or above)
		 * a == b (0)
		 * or a < b (-1 and below)
		 * */
		
		// first, return equals for stochastic
		if (a.equals("(no value)") || b.equals("(no value)")) {
			return 0;
		}

		if ((a.equals("mid") && !b.equals("mid")) || (b.equals("mid") && !a.equals("mid"))) {
			return 0;
		}
		// find difference between evidence pairs
		return compareEP.get(a) - compareEP.get(b);
	}
	
	public static Boolean greater(String a, String b) {
		return compare(a, b) > 0;
	}
	
	public static Boolean lt(String a, String b) {
		return compare(a, b) < 0;
	}
	
	public static Boolean greatereq(String a, String b) {
		return compare(a, b) >= 0;
	}
	
	public static Boolean lteq(String a, String b) {
		return compare(a, b) <= 0;
	}
	
	public static Boolean equal(String a, String b) {
		return compare(a, b) == 0;
	}
	
	public static Boolean inbounds(String a, String lowerBound, String upperBound) {
		return greatereq(a, lowerBound) && lteq(a, upperBound);
	}
	
	/**
	 * non-signed distance between two evidence pairs
	 */
	public static int dist(String a, String b) {
		return Math.abs(compare(a, b));
	}
	
	/**
	 * isNumeric operator
	 * from https://stackoverflow.com/questions/1102891/how-to-check-if-a-string-is-numeric-in-java
	 */
	public static Boolean isNumeric(String str) {
		  return str.matches("-?\\d+(\\.\\d+)?");  //match a number with optional '-' and decimal.
	}
}
