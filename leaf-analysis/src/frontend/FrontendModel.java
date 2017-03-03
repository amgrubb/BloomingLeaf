package frontend;

import java.util.List;

public class FrontendModel {
	String maxTime;
	String maxEpoch;
	String relativePoints;
	String[] absolutePoinsts;
	List<DataActor> actors;
	List<DataIntention> intentions;
	List<DataLink> links;
	List<DataDynamic> dynamics;
	List<DataConstraint> constraints;
	List<DataQuery> queries;
	List<DataHistory> histories;
}
