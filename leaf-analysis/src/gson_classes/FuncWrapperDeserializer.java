package gson_classes;

import com.google.gson.*;

import java.lang.reflect.Type;

/**
 * Created by davidkwon on 2018-07-24.
 */
public class FuncWrapperDeserializer implements JsonDeserializer<FuncWrapper> {

    public FuncWrapper deserialize(JsonElement json, Type typeOfT,
                                   JsonDeserializationContext context) throws JsonParseException {
        JsonObject jObject = (JsonObject) json;
        JsonElement typeObj = jObject.get("funcType");
//
//        if (typeObj == null) {
//            return context.deserialize(json, RepFuncSegment.class);
//        } else {
//            return context.deserialize(json, FuncSegment.class);
//        }
        return context.deserialize(json, typeOfT);
        //TODO: What does this code do??
    }
}