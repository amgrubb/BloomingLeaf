function backendCom(){
	var js_object = {};
	js_object.name = "My name is";
	js_object.int_array = [0, 1, 2, 3];
	js_object.string_array = ['apple', 'orange', 'grapes'];

	var pathToCGI = "./cgi-bin/backendCom.cgi";

	$.ajax({
		url: pathToCGI,
		type: "post",
		datatype: "json",
		data: JSON.stringify(js_object),
		success: function(response){
		//ADD HERE WHAT TO DO WITH THE RESPONSE OBJECT
		alert(response);
		console.log(response['data']);
		}
	})
	.fail(function(){
		msg = "Ops! Something went wrong";
		alert(msg);
	});
}
