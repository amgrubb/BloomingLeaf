package simulation;

public class UDFunctionCSP {
		String[] functions;
		int[] dynamicValues;
		char[] elementEBs;
		public int[] absoluteEpochLengths = null;
		int mapStart;
		int mapEnd;
		
		//	D	0010	UD	4	0	A	C	1	A	B	C	2	B	C	I	3	C	1	C	5	N
		//	D	0011	UD	5	0	A	I	3	A	B	C	5	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
		//	D	0025	UD	5	0	A	C	5	A	B	I	3	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
		//	D	0029	UD	5	0	A	C	0	A	B	C	5	B	C	C	1	C	D	R	5	D	1	C	5	N
		//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'N'
		//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd
		//  With Absolute Time and Tropos
		// 		need to add the abilities numRepeat, intervalSet
		//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats
		//	D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats | lengthOfSegment*
		// 	D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C
		// 	D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C	2
		// 	D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C	2	5	5	

		/**
		 * Constructs the UD function by:
		 * 	- Reading the function data.
		 *  - Unrolling any loops.
		 *  - Creating epochs for repeating parts.
		 * @param inputLine	the line containing the UD function information
		 */
		public UDFunctionCSP(String inputLine) {
			String[] values = inputLine.split("\\t");

			// values[0-2] are "D", intentionID, and "UD".
			int numSegment = Integer.parseInt(values[3]);
			
			String[] readFunctions = new String[numSegment];
			int[] readValues = new int[numSegment];
			char[]	readEB = new char[numSegment]; // EB indicates the beginning of the interval.
			
			int count = 4;
			for (int i = 0; i < numSegment; i++){
				readEB[i] = values[count].charAt(0);
				readFunctions[i] = values[count + 2];
				readValues[i] = Integer.parseInt(values[count + 3]);
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
					this.absoluteEpochLengths = new int[lengthRepeat];
					for (int i = 0; i < this.absoluteEpochLengths.length; i++)
						this.absoluteEpochLengths[i] = Integer.parseInt(values[count + 4 + i]);
				}
				
				this.functions =  new String[totalNumSegment];
				this.dynamicValues = new int[totalNumSegment];
				this.elementEBs =  new char[totalNumSegment];
				char newEB = 'a';
				for (int i = 0; i < totalNumSegment; i++){
					if (i <  mapStart){
						this.functions[i] = readFunctions[i];
						this.dynamicValues[i] = readValues[i];
						this.elementEBs[i] = readEB[i];
					}else if (i >= mapEnd){
						this.functions[i] = readFunctions[i - (totalNumSegment - numSegment)];
						this.dynamicValues[i] = readValues[i - (totalNumSegment - numSegment)];
						this.elementEBs[i] = readEB[i - (totalNumSegment - numSegment)];						
					}else {
						int step = ((i - mapStart) % lengthRepeat) + mapStart;
						this.functions[i] = readFunctions[step];
						this.dynamicValues[i] = readValues[step];
						if (i == mapStart)
							this.elementEBs[i] = readEB[i];
						else {
							this.elementEBs[i] = newEB;
							newEB++;
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
		public int[] getDynamicValues() {
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
			for (int i = 0; i < functions.length; i++)
				System.out.println(functions[i] + "\t" + dynamicValues[i] + "\t" + elementEBs[i]);
		}
		public static void main(String[] args) {
			//String test = "D	0010	UD	4	0	A	C	1	A	B	C	2	B	C	I	3	C	1	C	5	N";
			//	D	0011	UD	5	0	A	I	3	A	B	C	5	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
			//	D	0025	UD	5	0	A	C	5	A	B	I	3	B	C	D	0	C	D	R	5	D	1	C	5	R	A	D
			//	D	0029	UD	5	0	A	C	0	A	B	C	5	B	C	C	1	C	D	R	5	D	1	C	5	N
			//D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C";
			// 	D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	A	C	2
			String test = "D	0000	UD	4	0	A	C	2	A	B	C	3	B	C	C	0	C	1	C	1	R	B	1	2	5	5";	
			UDFunctionCSP func = new UDFunctionCSP(test);
			func.printUDFunction();
		}
	}
