package merge;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import gson_classes.*;
import simulation.*;

/*
 * Converts from ModelSpec back to IMain for output
 * (Backend format -> frontend format)
 * Reverse of BIModelSpecBuilder
 */

public class IMainBuilder {

	/** Main function that generates the IMain
	 * @param outSpec - a ModelSpec
	 * @return
	 */
	public static IMain buildIMain(ModelSpec outSpec) {

		List<ICell> cells = new ArrayList<ICell>();
		Integer z = 0; // unique counter for cells

		// actors
		List<Actor> actors = outSpec.getActors();

		// add actors to cells list
		if (!actors.isEmpty()) {
			for (Actor specActor: actors) {
				// inputs for ICell
				String id = specActor.getUniqueID();
				String type = "basic.Actor";
				BISize size = specActor.getSize();
				BIPosition position = specActor.getPosition();
				String[] embeds = specActor.getEmbeds();

				BIActor newActor = new BIActor(specActor.getName(), specActor.getActorType());
				String name = newActor.getActorName();

				// add actor as ICell
				ICell newCell = new ICell(newActor, type, id, z, size, position, embeds, name);
				cells.add(newCell);

				// increment cell counter
				z++;
			}
		}

		// intentions
		List<Intention> intentions = outSpec.getIntentions();

		// add intentions to cells list
		if (!intentions.isEmpty()) {
			for (Intention specIntention: intentions) {
				// inputs for ICell
				String id = specIntention.getUniqueID();
				String type = specIntention.getType();
				String parent = specIntention.getParentID();
				BISize size = specIntention.getSize();
				BIPosition position = specIntention.getPosition();

				BIIntention newIntention = buildBIIntention(specIntention);
				String name = newIntention.getNodeName();

				// add intention as ICell
				ICell newCell = new ICell(newIntention, type, id, z, size, position, parent, name);
				cells.add(newCell);

				z++;
			}
		}

		// links
		List<ContributionLink> contributionLinks = outSpec.getContributionLinks();
		List<DecompositionLink> decompositionLinks = outSpec.getDecompositionLinks();
		List<NotBothLink> notBothLinks = outSpec.getNotBothLinks();

		if (!contributionLinks.isEmpty()) {
			for (ContributionLink specLink: contributionLinks) {
				// inputs for ICell
				String id = specLink.getUniqueID();
				String type = "basic.CellLink";
				String source = specLink.getZeroSrcID();
				String target = specLink.getDest().getUniqueID();

				// inputs for building BILink
				Integer absTime = specLink.getAbsTime();
				Boolean evolving = specLink.isEvolving();
				String linkType = specLink.getPreContribution().getCode();

				BILink newLink; // build link w/ or w/o postType depending on evolving
				if (evolving) {
					String postType = specLink.getPostContribution().getCode();
					newLink = new BILink(absTime, evolving, linkType, postType);
				} else {
					newLink = new BILink(absTime, evolving, linkType);
				}

				// add Link as ICell
				ICell newCell = new ICell(newLink, type, id, z, source, target);
				cells.add(newCell);

				z++;
			}
		}
		// add decomposition links
		if (!decompositionLinks.isEmpty()) {
			for (DecompositionLink specLink: decompositionLinks) {
				// inputs for ICell
				String id;
				String type = "basic.CellLink";
				String source;
				String target = specLink.getDest().getUniqueID();

				// inputs for building BILink
				Integer absTime = specLink.getAbsTime();
				Boolean evolving = specLink.isEvolving();
				String linkType = specLink.getPreDecomposition().getCode().toLowerCase();  // lowercase: upper is invalid in frontend

				BILink newLink; // build link w/ or w/o postType depending on evolving
				if (evolving) {
					String postType = specLink.getPostDecomposition().getCode().toLowerCase();
					newLink = new BILink(absTime, evolving, linkType, postType);
				} else {
					newLink = new BILink(absTime, evolving, linkType);
				}

				// create separate ICell/link for each source
				List<String> sources = specLink.getSrcIDs();
				List<String> ids = specLink.getSubLinkUniqueIDList();

				// different ICell/link for each source
				for (int i = 0; i < sources.size(); i++) {
					source = sources.get(i);
					id = ids.get(i);

					// add Link as ICell
					ICell newCell = new ICell(newLink, type, id, z, source, target);
					cells.add(newCell);

					z++;
				}
			}
		}
		// add not both links
		if (!notBothLinks.isEmpty()) {
			for (NotBothLink specLink: notBothLinks) {
				// inputs for ICell
				String id = specLink.getUniqueID();
				String type = "basic.CellLink";
				String source = specLink.getElement1().getUniqueID();
				String target = specLink.getElement2().getUniqueID();

				// inputs for building BILink
				Integer absTime = specLink.getAbsTime();
				Boolean evolving = false;  // always false for NB links
				String linkType = specLink.getLinkType();

				BILink newLink = new BILink(absTime, evolving, linkType);

				// add Link as ICell
				ICell newCell = new ICell(newLink, type, id, z, source, target);
				cells.add(newCell);

				z++;
			}
		}

		List<ActorLink> actorLinks = outSpec.getActorLinks();
		if (!actorLinks.isEmpty()) {
			for (ActorLink specLink: actorLinks) {
				// inputs for ICell
				String id = specLink.getUniqueID();
				String type = "basic.CellLink";
				String source = specLink.getZeroSrcID();
				String target = specLink.getDest().getUniqueID();

				// inputs for building BILink
				Integer absTime = specLink.getAbsTime();
				Boolean evolving = false; //Not evolving
				String linkType = specLink.getType().getCode();

				BILink newLink = new BILink(absTime, evolving, linkType);

				// add Link as ICell
				ICell newCell = new ICell(newLink, type, id, z, source, target);
				cells.add(newCell);

				z++;
			}
		}

		// overall model variables
		Integer maxAbsTime = outSpec.getMaxTime();
		int[] absTimePtsArr = convertAbsTimePtsArr(outSpec.getAbsTP());

		// create model to return
		IGraph graph = new IGraph(maxAbsTime, absTimePtsArr, cells);

		IMain model = new IMain(graph);

		return model;

	}

	/**
	 * Create BIIntention in (frontend) IMain-compatible format
	 * from the backend Intention object
	 * Creates BIEvolvingFunction from the evolvingFunctions, and creates user assignments list from the userEvals
	 * @param specIntention
	 * @return
	 */
	private static BIIntention buildBIIntention(Intention specIntention) {
		// create evolving functions
		BIFunctionSegment[] functionSegs;
		if (specIntention.getMEvolvingFunctions() != null) {
			functionSegs = getFunctionSegsMerged(specIntention.getMEvolvingFunctions());
		} else {
			functionSegs = getFunctionSegs(specIntention.getEvolvingFunctions());
			if (functionSegs.length != 0) {
				// initialize previous
				String prev = "";
				// In functionSegs, replace all instances of "Initial", "A-MaxTime" and "B-MaxTime" with correct startTPS (0, A, B, C...)
				for (int i = 0; i < functionSegs.length; i ++) {
					String tp = functionSegs[i].getStartTP();
					if (tp.equals("Initial")) {
						tp = "0";
	        		}
	        		else if (tp.length() > 1) {
	        			if (prev.equals("0")) {
	        				tp = "A";
	        			}
	        			else {
	        				if (prev.length() > 0) {
		        				int ascii = (int)prev.charAt(0) + 1;
		        				char c=(char)ascii;
		        				tp = c + "";
	        				}
	        			}
	        		}
					functionSegs[i].setStartTP(tp);
	        		prev = tp;
				}
			}
		}
		
		BIEvolvingFunction evolvingFunction = getEvolvingFunction(functionSegs);


		// create user assignments list
		List<BIUserEvaluation> userEvaluationList = new ArrayList<BIUserEvaluation>();
		// make each user evaluation and add to list
		for (Map.Entry<Integer, String> userEval : specIntention.getUserEvals().entrySet()) {
			// add assignedEvidencePair, absTime to BIUserEvalutation
			BIUserEvaluation newEval = new BIUserEvaluation(userEval.getValue(), userEval.getKey());
			userEvaluationList.add(newEval);
		}

		BIIntention newIntention = new BIIntention(evolvingFunction, specIntention.getName(), userEvaluationList);

		return newIntention;
	}
	
	/* 
	 * for converting FunctionSegments into a (frontend) format compatible with IMain objects
	 * input: list of evolving function segments - FunctionSegment[]
	 * output: list of BIFunctionSegments - BIFunctionSegment[]
	 * we use these BIFunctionSegments to put one BIEvolvingFunction on the BIIntention
	 */
	private static BIFunctionSegment[] getFunctionSegs(FunctionSegment[] evolvingFunctions){
		// for intentions w/o extra info on evolving functions (MFunctionSegment list)
		
		// convert FunctionSegment[] into List<BIFunctionSegment>
		ArrayList<BIFunctionSegment> funcSegList = new ArrayList<BIFunctionSegment>();
		for (FunctionSegment func : evolvingFunctions) {
			BIFunctionSegment funcSeg;
			//if it's the last function segment, set current to true so it can be changed
			if (func == evolvingFunctions[evolvingFunctions.length - 1]) {
				funcSeg = new BIFunctionSegment(func.getRefEvidencePair(), func.getStartAT(),
						  func.getStartTP(), func.getType(), true);
			}
			else {
				funcSeg = new BIFunctionSegment(func.getRefEvidencePair(), func.getStartAT(),
						  func.getStartTP(), func.getType(), false);
			}
			
			funcSegList.add(funcSeg);
		}
		
		// convert to array BIFunctionSegment[]
		BIFunctionSegment[] functionSegList = new BIFunctionSegment[funcSegList.size()];
		functionSegList = funcSegList.toArray(functionSegList);
		
		return functionSegList;
	}
	
	/* 
	 * for converting our Merge brand of FunctionSegments (MFunctionSegment) into a (frontend) format compatible with IMain objects
	 * input: list of evolving function segments in MFunctionSegment format - List<MFunctionSegment>
	 * output: list of BIFunctionSegments - BIFunctionSegment[]
	 * we use these BIFunctionSegments to put one BIEvolvingFunction on the BIIntention
	 */
	private static BIFunctionSegment[] getFunctionSegsMerged(List<MFunctionSegment> evolvingFunctions){
		// for intentions w/o extra info on evolving functions (MFunctionSegment list)
		
		// convert List<MFunctionSegment> into List<BIFunctionSegment>
		ArrayList<BIFunctionSegment> funcSegList = new ArrayList<BIFunctionSegment>();
		for (MFunctionSegment func : evolvingFunctions) {
			// if it's the last function segment, set it to be current
			BIFunctionSegment funcSeg;
			if (func == evolvingFunctions.get(evolvingFunctions.size()-1)) {
				funcSeg = new BIFunctionSegment(func.getRefEvidencePair(), func.getStartAT(),
						  func.getStartTP(), func.getType(), true);
			}
			else {
				funcSeg = new BIFunctionSegment(func.getRefEvidencePair(), func.getStartAT(),
						  func.getStartTP(), func.getType(), false);
			}
			
			funcSegList.add(funcSeg);
		}
		
		// convert to array BIFunctionSegment[]
		BIFunctionSegment[] functionSegList = new BIFunctionSegment[funcSegList.size()];
		functionSegList = funcSegList.toArray(functionSegList);
		
		return functionSegList;
	}
	
	/*
	 * for putting one BIEvolvingFunction on the BIIntention
	 * based on BIFunctionSegment[] as returned from getFunctionSegs() or getFunctionSegsMerged()
	 * detects evolving function type for the frontend
	 * 
	 * input: BIFunctionSegment[] as returned from getFunctionSegs() or getFunctionSegsMerged()
	 * output: BIEvolvingFunction
	 */

	private static BIEvolvingFunction getEvolvingFunction(BIFunctionSegment[] functionSegList) {
		// find type of evolving function

		// type if none of the named cases below
		String type = "UD";

		// detect type in named cases
		if (functionSegList.length == 0) {
			// no type w/ no segments
			type = "NT";
		} else if (functionSegList.length == 1) {
			// segment is C, I, D, or R (stochastic)
			type = functionSegList[0].getType();
		} else if (functionSegList.length == 2) {
			// potentially a 2-segment type
			String type0 = functionSegList[0].getType();
			String type1 = functionSegList[1].getType();
			if (type0.equals("R") && type1.equals("C")) {
				// stochastic-constant
				type = "RC";
			} else if (type0.equals("C") && type1.equals("R")) {
				// constant-stochastic
				type = "CR";
			} else if (type0.equals("I") && type1.equals("C")) {
				// monotonic positive
				type = "MP";
			} else if (type0.equals("D") && type1.equals("C")) {
				// monotonic negative
				type = "MN";
			} else if (type0.equals("C") && type1.equals("C")) {
				// SD or DS
				String satValue0 = functionSegList[0].getRefEvidencePair();
				String satValue1 = functionSegList[1].getRefEvidencePair();
				if (satValue0.equals("0011") && satValue1.equals("1100")) {
					// satisfied denied
					type = "SD";
				} else if (satValue0.equals("1100") && satValue1.equals("0011")) {
					// denied satisfied
					type = "DS";
				}
			}
		}

		BIEvolvingFunction evolvingFunction = new BIEvolvingFunction(functionSegList, type);

		return evolvingFunction;
	}

	/**
	 * extracts integer time points from the absTP HashMap
	 * @param absTP
	 * @return absTimePtsArr
	 */
	private static int[] convertAbsTimePtsArr(HashMap<String, Integer> absTP) {
		// only keep integer timepoints
		ArrayList<Integer> absTimePtsList = new ArrayList<>(absTP.values());
		if(absTimePtsList.size() == 0) {
			return new int[0];
		}

		// convert to int[]
		int[] absTimePtsArrW0 = absTimePtsList.stream().mapToInt(i -> i).toArray();

		// remove the 0 we added in when loading from frontend

		Arrays.sort(absTimePtsArrW0);
		int[] absTimePtsArr = Arrays.copyOfRange(absTimePtsArrW0, 1, absTimePtsArrW0.length);


		return absTimePtsArr;

	}

}
