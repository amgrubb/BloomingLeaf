package simulation_objects;

import java.util.Random;

public class UDFunction {
	private static Random rand = new Random();
	boolean hasRepeat = false;
	boolean repeatFull = false;
	int repeatStart = -2;	//End of the first repeating interval.
	int repeatEnd = -2;		//End of the last repeating interval.
	int numRepeat = 1;
	int[] repeatEpochBoundaries;
	String[] epochBasicFunction;
	int[] epochMarkedValues;
	int[] epochBoundaries;	//Marks the end of the boundary.
	int numSegment;
	
	
	//	D	0010	UD	4	0	A	C	1	A	B	C	2	B	C	I	3	C	1	C	5	N
	//	D	0011	UD	5	0	A	I	3	A	B	C	5	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
	//	D	0025	UD	5	0	A	C	5	A	B	I	3	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
	//	D	0029	UD	5	0	A	C	0	A	B	C	5	B	C	C	1	C	D	R	5	D	1	C	5	N
	//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'N'
	//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd
	public UDFunction(String inputLine, int maxEpoch) {
		String[] values = inputLine.split("\\t");
		// values[0-2] are "D", intentionID, and "UD".
		numSegment = Integer.parseInt(values[3]);
		epochBasicFunction = new String[numSegment];
		epochMarkedValues = new int[numSegment];
		epochBoundaries = new int[numSegment];	//What about repeat???
		int count = 6;
		for (int i = 0; i < numSegment; i++){
			epochBasicFunction[i] = values[count];
			epochMarkedValues[i] = Integer.parseInt(values[count + 1]);
			count += 4;
		}
		count -=2;
		if (values[count].equals("R"))
			hasRepeat = true;
		else if (values[count].equals("N"))
			hasRepeat = false;
		else
			System.err.println("UD Reading Erorr");
		if (hasRepeat){
			repeatStart = convertEBtoUDEB(values[count + 1]) - 1;
			repeatEnd = convertEBtoUDEB(values[count + 2]) - 1;
		}
		if ((repeatStart == -1) && (repeatEnd == numSegment - 1))
			repeatFull = true;
		
		int totalEB = numSegment;
		// Assign EB values.
		if (!hasRepeat){
			int remainder = maxEpoch;
			int counter = 0;
			for (int i = 0; i < numSegment; i++){
				int incrementfloor = remainder / (numSegment - i);
				epochBoundaries[i] = incrementfloor + counter;
				counter += incrementfloor; 
				remainder -= incrementfloor;
			}
			totalEB = numSegment;
		}else{	//Create EB with repeat.
			int lengthRepeat = repeatEnd - repeatStart;
			int nonRepeat = numSegment - lengthRepeat;
			int maxRepeat = (maxEpoch - nonRepeat) / lengthRepeat; 
			
			this.numRepeat = rand.nextInt(maxRepeat -1) + 1;
			this.repeatEpochBoundaries = new int[this.numRepeat * lengthRepeat];
			//System.out.println("Length: " + repeatEpochBoundaries.length);
			
			totalEB = repeatEpochBoundaries.length + epochBoundaries.length;		//This changes depending on if start and end of 0 and 1.
			int remainder = maxEpoch;
			int curPointer = 0;
			int countEBOut = 0;
			int countEBRep = 0;
			
			//For Testing
			for (int i = 0; i < epochBoundaries.length; i++)
				epochBoundaries[i] = -2;
			for (int i = 0; i < repeatEpochBoundaries.length; i++)
				repeatEpochBoundaries[i] = -2;
			
			
			for (int i = repeatStart + 1; i < repeatEnd; i++)
				epochBoundaries[i] = -1;
			
			boolean done = false;
			while (!done){
//				if ((totalEB - (countEBOut + countEBRep)) < 1){
//					System.out.println("Divide by zero error.");
//					break;
//				}
				int incrementfloor = remainder / (totalEB - (countEBOut + countEBRep));
				if ((countEBOut > repeatStart) && (countEBOut < repeatEnd)){
					//Repeated Section
					repeatEpochBoundaries[countEBRep] = incrementfloor + curPointer;
					curPointer += incrementfloor; 
					remainder -= incrementfloor;	
					countEBRep ++;
					if (countEBRep == repeatEpochBoundaries.length - 1)
						countEBOut = repeatEnd;
				}else if (countEBOut == repeatEnd){
					epochBoundaries[countEBOut] = incrementfloor + curPointer;
					repeatEpochBoundaries[countEBRep] = incrementfloor + curPointer;
					curPointer += incrementfloor; 
					remainder -= incrementfloor;
					countEBOut ++;
					countEBRep ++;
				}else {
//					if (countEBOut == epochBoundaries.length){
//						System.out.println("ArrayIndexOutOfBoundsException.");
//						break;
//					}
					epochBoundaries[countEBOut] = incrementfloor + curPointer;
					curPointer += incrementfloor; 
					remainder -= incrementfloor;
					countEBOut ++;
				}
				if (countEBOut == epochBoundaries.length)
					done = true;
			}	
			epochBoundaries[epochBoundaries.length-1] = maxEpoch;
			
		}
	}
	
	public int getNumSegment() {
		return numSegment;
	}

	public void updateEpochBoundaries(String charUD, int EBValue, int maxEpoch) {
		//TODO: Update epoch boundaries.
		//System.out.println("Updating Values");
		int definedEB = convertEBtoUDEB(charUD) - 1;
		
		//For Testing
		for (int i = 0; i < epochBoundaries.length; i++)
			epochBoundaries[i] = -2;
		
		// Assign Constraint Value
		epochBoundaries[definedEB] = EBValue;		
		// Assign EB values.
		if (!hasRepeat){
			int remainder = EBValue - 1;
			int counter = 0;
			for (int i = 0; i < definedEB; i++){
				int incrementfloor = remainder / (definedEB - i);
				epochBoundaries[i] = incrementfloor + counter;
				counter += incrementfloor; 
				remainder -= incrementfloor;
			}
			remainder = maxEpoch - EBValue;
			counter = EBValue;
			for (int i = definedEB + 1; i < epochBoundaries.length; i++){
				int incrementfloor = remainder / (epochBoundaries.length - i);
				epochBoundaries[i] = incrementfloor + counter;
				counter += incrementfloor; 
				remainder -= incrementfloor;		
			}
		} else {
			for (int i = repeatStart + 1; i < repeatEnd; i++)
				epochBoundaries[i] = -1;

			if(definedEB <= repeatStart){
				// Part before defined constraint.
				int remainder = EBValue - 1;
				int counter = 0;
				for (int i = 0; i < definedEB; i++){
					int incrementfloor = remainder / (definedEB - i);
					epochBoundaries[i] = incrementfloor + counter;
					counter += incrementfloor; 
					remainder -= incrementfloor;
				}
				
				//Part after defined constraint. (Includes repeating portion.)
				// EBValue;	// Current point on the epoch scale.
				
				int lengthRepeat = repeatEnd - repeatStart;
				int nonRepeatRemaining = epochBoundaries.length - definedEB;
				int maxRepeat = (maxEpoch - nonRepeatRemaining) / lengthRepeat; 
				this.numRepeat = rand.nextInt(maxRepeat -1) + 1;
				
				this.repeatEpochBoundaries = new int[this.numRepeat * lengthRepeat];
				//System.out.println("New Repeating Length: " + repeatEpochBoundaries.length);
				for (int i = 0; i < repeatEpochBoundaries.length; i++)
					repeatEpochBoundaries[i] = -2;
				
				int totalEB = repeatEpochBoundaries.length + epochBoundaries.length;		//This changes depending on if start and end of 0 and 1.
				remainder = maxEpoch - EBValue;
				int curPointer = EBValue;
				int countEBOut = definedEB + 1;
				int countEBRep = 0;
				
				boolean done = false;
				while (!done){
					int incrementfloor = remainder / (totalEB - (countEBOut + countEBRep));
					if (incrementfloor == 0)
						incrementfloor = 1;
					if ((countEBOut > repeatStart) && (countEBOut < repeatEnd)){
						//Repeated Section
						repeatEpochBoundaries[countEBRep] = incrementfloor + curPointer;
						curPointer += incrementfloor; 
						remainder -= incrementfloor;	
						countEBRep ++;
						if (countEBRep == repeatEpochBoundaries.length - 1)
							countEBOut = repeatEnd;
					}else if (countEBOut == repeatEnd){
						epochBoundaries[countEBOut] = incrementfloor + curPointer;
						repeatEpochBoundaries[countEBRep] = incrementfloor + curPointer;
						curPointer += incrementfloor; 
						remainder -= incrementfloor;
						countEBOut ++;
						countEBRep ++;
					}else {
						epochBoundaries[countEBOut] = incrementfloor + curPointer;
						curPointer += incrementfloor; 
						remainder -= incrementfloor;
						countEBOut ++;
					}
					if (countEBOut == epochBoundaries.length)
						done = true;
				}	
				epochBoundaries[epochBoundaries.length-1] = maxEpoch;

			} else if(definedEB >= repeatEnd){
				//Part after defined constraint.
				int remainder = maxEpoch - EBValue;
				int counter = EBValue;
				for (int i = definedEB + 1; i < epochBoundaries.length; i++){
					int incrementfloor = remainder / (epochBoundaries.length - i);
					epochBoundaries[i] = incrementfloor + counter;
					counter += incrementfloor; 
					remainder -= incrementfloor;		
				}
				epochBoundaries[epochBoundaries.length -1] = maxEpoch;

				// Part before defined constraint. (Includes repeating portion.)
				// Setup
				int lengthRepeat = repeatEnd - repeatStart;
				int nonRepeatRemaining = definedEB - lengthRepeat;
				int maxRepeat = (EBValue - nonRepeatRemaining) / lengthRepeat; 
				this.numRepeat = rand.nextInt(maxRepeat -1) + 1;
				
				this.repeatEpochBoundaries = new int[this.numRepeat * lengthRepeat];
				//System.out.println("New Repeating Length Post: " + repeatEpochBoundaries.length);
				for (int i = 0; i < repeatEpochBoundaries.length; i++)
					repeatEpochBoundaries[i] = -2;

				// Working backwards.
				remainder = EBValue;		//Because going backwards.		
				int countEBOut = definedEB - 1; // Start at definedEB - 1
				int countEBRep = repeatEpochBoundaries.length -1;			
				
				boolean done = false;
				while (!done){
					int deccrementfloor = remainder / (countEBOut + countEBRep);
					if ((countEBOut > repeatStart) && (countEBOut < repeatEnd)){
						//Repeated Section
						repeatEpochBoundaries[countEBRep] = remainder - deccrementfloor; 
						remainder -= deccrementfloor;	
						countEBRep --;
						if (countEBRep == - 1)
							countEBOut = repeatStart;
					}else if (countEBOut == repeatEnd){
						epochBoundaries[countEBOut] = remainder - deccrementfloor;
						repeatEpochBoundaries[countEBRep] = remainder - deccrementfloor;
						remainder -= deccrementfloor;
						countEBOut --;
						countEBRep --;
					}else {
						epochBoundaries[countEBOut] = remainder - deccrementfloor;
						remainder -= deccrementfloor;
						countEBOut --;
					}
					if (countEBOut == -1)
						done = true;
				}
			} else {
				System.err.println("Error: EB Constraint in repeated portion.");
			}
//			for (int i = 0; i < repeatEpochBoundaries.length; i++)
//				System.out.println("NR\t" + repeatEpochBoundaries[i]);
		}
//		for (int i = 0; i < epochBoundaries.length; i++)
//			System.out.println("ReWrite: " + epochBoundaries[i]);		
	}
	
	
	public int getMinEBValue (String eBCharacter, int maxEB){
		int val = convertEBtoUDEB(eBCharacter) - 1;
		if(hasRepeat)
			if (val <= repeatStart)
				return val;
			else if (val >= repeatEnd)		
				return maxEB - (epochBoundaries.length);
			else
				return val;
		else
			return val;
	}
	public int getMaxEBValue (String eBCharacter, int maxEB){
		int val = convertEBtoUDEB(eBCharacter) - 1;
		if(hasRepeat)
			if (val <= repeatStart)
				return maxEB - (epochBoundaries.length - val) - 1;
			else if (val >= repeatEnd)		
				return maxEB - (epochBoundaries.length - val);
			else
				return maxEB - (epochBoundaries.length - val);
		else
			return maxEB - (epochBoundaries.length - val);		
	}
	//Returns the values 0-length+1. subtract 1 to get the epoch.
	public int convertEBtoUDEB(String eBCharacter){
		//TODO: Finish functions.
		int val = (int)eBCharacter.charAt(0);
		if (val == 48)
			return 0;
		else if (val == 49)
			return this.epochBasicFunction.length;
		else
			return val - 64;
	}
	
	

	public boolean isHasRepeat() {
		return hasRepeat;
	}
	public int getRepeatStart() {
		return repeatStart;
	}
	public int getRepeatEnd() {
		return repeatEnd;
	}
	public String[] getEpochBasicFunction() {
		return epochBasicFunction;
	}
	public int[] getEpochMarkedValues() {
		return epochMarkedValues;
	}
	
}
