package simulation;

import interface_objects.EvolvingFunction;
import interface_objects.FuncSegment;
import interface_objects.InputIntention;
import interface_objects.RepFuncSegment;

import java.util.ArrayList;

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
		 * @param intention	the InputIntention containing UD function information
		 * 			Sample inputLine Format
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'N'
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats
		 *  D	ElemID	UD 	#parts | (begin | End | FuncType | SatValue)* | 'R' | repeatBegin | repeatEnd | numRepeats | lengthOfSegment*
		 *  		Sample inputLine Examples
		 */
		public UDFunctionCSP(InputIntention intention) {

			EvolvingFunction dynamic = intention.getDynamicFunction();

			int numSegment = dynamic.getNumOfSegments();

			if(numSegment < 2) {
				throw new RuntimeException("Error: UD Function for IntentionID " + intention.getNodeID() + " must have at least two segments.");
			}

			String[] functions = new String[numSegment];
			boolean[][] dynamicValues = new boolean[numSegment][4];
			char[] elementEBs = new char[numSegment];

			ArrayList<FuncSegment> segList = dynamic.getUnwrappedSegList();

			for (int i = 0; i < segList.size(); i++) {
				FuncSegment seg = segList.get(i);
				functions[i] = seg.getFuncType();
				elementEBs[i] = seg.getFuncStart().charAt(0);

				for (int j = 0; j < 4; j++) {
					String value = seg.getFuncX();
					dynamicValues[i] = ModelSpecBuilder.getEvaluationArray(value);
				}

			}

			if (dynamic.containsRepeat()) {
				RepFuncSegment repSeg = dynamic.getRepFuncSegment();
				int lengthRepeat = repSeg.getFunctionSegList().size();
				int absNumRepeats = repSeg.getRepNum();
				char repStart = repSeg.getRepStart();
				char repEnd = repSeg.getRepEnd();
				int totalNumSegment = numSegment + ((absNumRepeats - 1) * lengthRepeat);

				mapStart = arrayIndexOf(elementEBs, repStart);
				mapEnd = arrayIndexOf(elementEBs, repEnd);

				if (mapEnd == -1) {	// The end of the array.
					mapEnd = totalNumSegment;
				}
				else {
					mapEnd += (totalNumSegment - numSegment);
				}

				int absLength = repSeg.getAbsTime();
				if (absLength > 0) {
					this.absoluteEpochLengths = new int[lengthRepeat];
					for (int i = 0; i < this.absoluteEpochLengths.length; i++){
						// Originally we had different repeat lengths for each segment. Now we have a single repeating length for all segments.
						//this.absoluteEpochLengths[i] = Integer.parseInt(values[count + 4 + i]);
						this.absoluteEpochLengths[i] = absLength;
					}
				}

				this.functions =  new String[totalNumSegment];
				this.dynamicValues = new boolean[totalNumSegment][4];
				this.elementEBs =  new char[totalNumSegment];
				char newEB = 'a';
				for (int i = 0; i < totalNumSegment; i++){
					if (i <  mapStart){
						this.functions[i] = functions[i];
						this.dynamicValues[i] = dynamicValues[i];
						this.elementEBs[i] = elementEBs[i];
					}else if (i >= mapEnd){
						this.functions[i] = functions[i - (totalNumSegment - numSegment)];
						this.dynamicValues[i] = dynamicValues[i - (totalNumSegment - numSegment)];
						this.elementEBs[i] = elementEBs[i - (totalNumSegment - numSegment)];
					}else {
						int step = ((i - mapStart) % lengthRepeat) + mapStart;
						this.functions[i] = functions[step];
						this.dynamicValues[i] = dynamicValues[step];
						this.elementEBs[i] = newEB;
						newEB++;
					}
				}
			} else {
				this.functions = functions;
				this.dynamicValues = dynamicValues;
				this.elementEBs = elementEBs;
			}

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
	}
