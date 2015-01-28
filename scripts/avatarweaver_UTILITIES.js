var utilities = {
	parse : function (str) {
		// Insert placeholders into a string, like in Python
		// Eg. string = utilities.parse("'I am %s'," Garry")

    	var args = [].slice.call(arguments, 1), i = 0;

    	return str.replace(/%s/g, function() {
        	return args[i++];
    	});	
	},

	sort_alphanumeric: function (arr) {
		var keylist = {};
		var test_array = [];

		$.each(arr, function(point_name){
			var point_name = arr[point_name];
			var int_form = point_name[0].replace(/[^0-9]+/g, '');
			keylist[point_name[0]] = Number(int_form);
			test_array.push(Number(int_form));
		});

		var max_value = Math.max.apply(Math, test_array);
		
		$.each(keylist, function(key, value){
			if (value == max_value){
				var delete_key = String(key);
				return delete_key;
			}
		});
	}
}