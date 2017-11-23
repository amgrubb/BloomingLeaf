package simulation;

public class UDFunctionCSP {
		String[] functions;
		boolean[][] dynamicValues;
		char[] elementEBs;
		public int[] absoluteEpochLengths = null;
		int mapStart;
		int mapEnd;
		

		/**
		 * Constructs the UD function by:
		 * 	- Reading the function data.
		 *  - Unrolling any loops.
		 *  - Creating epochs for repeating parts.
		 *  - 25/04/17 Note: The current implementation takes absolute values for each part of the repeating segment. The formalism says that it only takes
		 *  			a single value for lengthOfSegment.
		 * @param inputLine	the line containing the UD function information
		 * 			Sample inputLine Format
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'N'
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats | lengthOfSegment*
		 *  		Sample inputLine Examples
		 */
		public UDFunctionCSP(String inputLine) {
			String[] values = inputLine.split("\\t");

			// values[0-2] are "D", intentionID, and "UD".
			int numSegment = Integer.parseInt(values[3]);
			
			String[] readFunctions = new String[numSegment];
			boolean[][] readValues = new boolean[numSegment][4];
			char[]	readEB = new char[numSegment]; // EB indicates the beginning of the interval.
			
			int count = 4;
			for (int i = 0; i < numSegment; i++){
				readEB[i] = values[count].charAt(0);
				readFunctions[i] = values[count + 2];
				for (int z = 0; z < 4; z++)
					readValues[i][z] = (values[count + 3].charAt(z) == '1');
				count += 4;
			}
			
			if (values[count].equals("N")) {
				this.functions = readFunctions;
				this.dynamicValues = readValues;
				this.elementEBs = readEB;
			} else if (values[count].equals("R")) {
				char repeatStart = values[count + 1].charAt(0);
				char repeatEnd = values[count + 2].charAt(0);

				int lengthRepeat = calculateRepeatLength(repeatStart, repeatEnd, numSegment);
				int absoluteNumRepeats = 2;
				// Get extra information if available.
				if (values.length > count + 3)
					absoluteNumRepeats = Integer.parseInt(values[count + 3]);

				int totalNumSegment = numSegment + ((absoluteNumRepeats - 1) * lengthRepeat);
				mapStart = arrayIndexOf(readEB, repeatStart);
				mapEnd = arrayIndexOf(readEB, repeatEnd);
				if (mapEnd == -1)	// The end of the array.
					mapEnd = totalNumSegment;
				else 
					mapEnd += (totalNumSegment - numSegment);
								
				if (values.length > count + 4){
					int newLength = Integer.parseInt(values[count + 4]);
					if (newLength > 0){
						this.absoluteEpochLengths = new int[lengthRepeat];
						for (int i = 0; i < this.absoluteEpochLengths.length; i++){
							// Originally we had different repeat lengths for each segment. Now we have a single repeating length for all segments.
							//this.absoluteEpochLengths[i] = Integer.parseInt(values[count + 4 + i]);
							this.absoluteEpochLengths[i] = newLength;
						}
					}
				}
				
				this.functions =  new String[totalNumSegment];
				this.dynamicValues = new boolean[totalNumSegment][4];
				this.elementEBs =  new char[totalNumSegment - 1];
				char newEB = 'a';
				for (int i = 0; i < totalNumSegment; i++){
					if (i <  mapStart){
						this.functions[i] = readFunctions[i];
						this.dynamicValues[i] = readValues[i];
						if (i != 0)
							this.elementEBs[i-1] = readEB[i];
					}else if (i >= mapEnd){
						this.functions[i] = readFunctions[i - (totalNumSegment - numSegment)];
						this.dynamicValues[i] = readValues[i - (totalNumSegment - numSegment)];
						if (i != 0)
							this.elementEBs[i-1] = readEB[i - (totalNumSegment - numSegment)];						
					}else {
						int step = ((i - mapStart) % lengthRepeat) + mapStart;
						this.functions[i] = readFunctions[step];
						this.dynamicValues[i] = readValues[step];
						if (i != 0){
							if (i == mapStart)
								this.elementEBs[i-1] = readEB[i];
							else {
								this.elementEBs[i-1] = newEB;
								newEB++;
							}
						}
					}	
				}
			} else
				System.err.println("UD Reading Erorr");
		}
				
		// Getter Methods
		public String[] getFunctions() {
			return functions;
		}
		public boolean[][] getDynamicValues() {
			return dynamicValues;
		}
		public char[] getElementEBs() {
			return elementEBs;
		}
		public int[] getAbsoluteEpochLengths() {
			return absoluteEpochLengths;
		}
		public int getMapStart() {
			return mapStart;
		}
		public int getMapEnd() {
			return mapEnd;
		}
		
		// Helper Methods
		private int arrayIndexOf(char[] array, char value){
			for (int i = 0; i < array.length; i++){
				if (array[i] == value)
					return i;
			}
			return -1;
		}
		private int calculateRepeatLength(char repeatStart, char repeatEnd, int numSegment){
			if (repeatStart == 48){	// Zero
				if (repeatEnd == 49) // One
					return numSegment;
				else
					return repeatEnd - 64;
			}else if (repeatEnd == 49) // One
					return numSegment - (repeatStart - 64);
			return repeatEnd - repeatStart;
		}
		
		
		// Testing Methods
		public void printUDFunction(){
			System.out.println("Function: " + functions.length + "\nDynamic Values: " + dynamicValues.length + "\nEBs: " + elementEBs.length);
			System.out.println(functions[0] + "\t" + dynamicValues[0][0] + "|" + dynamicValues[0][1] + "|" + dynamicValues[0][2] + "|" + dynamicValues[0][3]);
			for (int i = 1; i < functions.length; i++)
				System.out.println(functions[i] + "\t" + dynamicValues[i][0] + "|" + dynamicValues[i][1] + "|" + dynamicValues[i][2] + "|" + dynamicValues[i][3] + "\t" + elementEBs[i-1]);
			System.out.print("absoluteEpochLengths:\t");
			for (int j = 0; j < absoluteEpochLengths.length; j++)
				System.out.print(absoluteEpochLengths[j] + "\t");
			System.out.println();			
		}
		public static void main(String[] args) {
			///// OLD VERSION
			//String test = "D	0010	UD	4	0	A	C	1	A	B	C	2	B	C	I	3	C	1	C	5	N";
			//	D	0011	UD	5	0	A	I	3	A	B	C	5	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
			//	D	0025	UD	5	0	A	C	5	A	B	I	3	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
			//	D	0029	UD	5	0	A	C	0	A	B	C	5	B	C	C	1	C	D	R	5	D	1	C	5	N
			//D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C";
			// 	D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C	2
			String test = "D	0000	UD	4	0	A	C	0010	A	B	C	0011	B	C	C	0000	C	1	C	0100	R	0	B	4	7";	
			UDFunctionCSP func = new UDFunctionCSP(test);
			func.printUDFunction();
		}
	}
