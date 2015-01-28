var VTMPointTracker = {
	XPSpinnerListener: function(active_selection) {
	// Monitor XP spinner - retrieve value entered
		var xp_base = $(active_selection).val();
		var old_spent = ($("#spent_xp").html()).split(' ')[2];
		var new_available = xp_base - Number(old_spent);
		$("#available_xp").empty();
		$("#available_xp").append("Available XP: " + new_available);
	},

	monitorPoints: function(key, changed_point) {
	// Takes key (statistic) and changed_point (name of pressed input)
	// and updates point usage (base points, freebies and XP)
	
	// Identify home category of statistic
		var main_section = $("#"+key).parents("div.section").attr("id");

		if ((main_section == "Attributes" || main_section == "Abilities" || main_section == "Advantages")) {
			// Only these three sections will incur freebie point costs
			// Calculate sum of points in the section the statistic belongs to
			var section = $("#"+key).parents("div")[0];

			// Check Point Dict for current values of this section
			var current_vals = point_dict[main_section];

			if ($("#"+changed_point).is(':checked')){
				var delta = 1;
			}
			else {
				var delta = -1;
			}

			// Differentiates between priority and non-preiority stats
			if (typeof(current_vals) == "object") {
				// Scores with priorities
				var base_value = current_vals[0]["Base"];
				var priority = $(section).children("div.subheading").find(":selected").text();

				if (priority == "Primary") {
					if ( ((base_value[0] > 0) && (global_freebies > 0)) || ((delta == -1) && (base_value[0] == 0) && (current_vals[0]["Freebies"].length == 0)) ){
						var index = 0;
						VTMPointTracker.updateBasePoints(key, base_value, index, delta, main_section, section);
					}
					else {
						if ( ((global_freebies > 0) && (base_value[0] == 0)) || ((global_freebies == 0) && (delta == -1) && (base_value[0] == 0)) ){
							VTMPointTracker.updateFreebiePoints(key, changed_point, base_value, delta, main_section, section);
						}
						else {
							//console.log(current_vals[0]["XP"]);
						}
					}
				}
				else if (priority == "Secondary") {
					if ( ((base_value[1] > 0) && (global_freebies > 0)) || ((delta == -1) && (base_value[1] == 0) && (current_vals[0]["Freebies"].length == 0)) ){
						var index = 1;
						VTMPointTracker.updateBasePoints(key, base_value, index, delta, main_section, section);
					}
					else {
						if ( ((global_freebies > 0) && (base_value[1] == 0)) || ((global_freebies == 0) && (delta == -1) && (base_value[1] == 0)) ){
							VTMPointTracker.updateFreebiePoints(key, changed_point, base_value, delta, main_section, section);
						}
						else {
							//console.log(current_vals[0]["XP"]);
						}
					}
				}
				else if (priority == "Tertiary") {
					if ( ((base_value[2] > 0) && (global_freebies > 0)) || ((delta == -1) && (base_value[2] == 0) && (current_vals[0]["Freebies"].length == 0)) ){
						var index = 2;
						VTMPointTracker.updateBasePoints(key, base_value, index, delta, main_section, section);
					}
					else {
						if ( ((global_freebies > 0) && (base_value[2] == 0)) || ((global_freebies == 0) && (delta == -1) && (base_value[2] == 0)) ){
							VTMPointTracker.updateFreebiePoints(key, changed_point, base_value, delta, main_section, section);
						}
						else {
							//console.log(current_vals[0]["XP"]);
						}
					}
				}
			}

			else {
				current_vals = point_dict[section.id][0];
				if ((base_value > 0) || ((delta == -1) && base_value == 0)) {
					var index = "null";
					var base_value = current_vals["Base"];
					VTMPointTracker.updateBasePoints(key, base_value, index, delta, main_section, section);					
				}
				else {
					if ((global_freebies > 0) || (global_freebies == 0 && delta == -1)){
						VTMPointTracker.updateFreebiePoints(key, changed_point, base_value, delta, main_section, section);
					}
					else {
						//console.log(current_vals["XP"]);
					}
				}
			}
		}
	},

	valueLookup: function(point_type, dict_level) {
	// Look up and retrieve values from costs_dict
		var freebie_value = costs_dict[point_type][0][dict_level];
		return freebie_value;
	},

	updateBasePoints: function(key, base_value, index, delta, main_section, section) {
		// Really simple call and update of main point dictionary
		if (typeof(index) != 'string') {
			var ref_dict = loadedJSON[3][main_section][0];

			// New values and update
			var updated_val = base_value[index] - delta;
			base_value[index] = updated_val;
			
			// Old values
			var priority = $(section).children("div.subheading").find(":selected").text();
			var ref_basepoint = ref_dict[priority];
		}
		else {
			// New values
			var ref_dict = loadedJSON[3];
			var updated_val = base_value - delta;

			var ref_basepoint = ref_dict[section.id];		
			var update_path = point_dict[section.id][0];
			update_path["Base"] = updated_val;
		}

		// For updating the displays
		var spent_points = ref_basepoint - updated_val;		
					
		// Update point tracker itself
		// Update home base tracker

		$("#"+key).siblings("div.assign_points").children("div.basepoints_spent").empty();
		$("#"+key).siblings("div.assign_points").children("div.basepoints_remaining").empty();

		$("#"+key).siblings("div.assign_points").children("div.basepoints_spent").append("Points Spent: "+spent_points);
		$("#"+key).siblings("div.assign_points").children("div.basepoints_remaining").append("Points Remaining: "+updated_val);

		var track_string = "div.%s_track";

		// Update main point tracker
		if (main_section == "Attributes" | main_section == "Abilities") {
			var string1 = utilities.parse(track_string, main_section);
			var string2 = utilities.parse(track_string, priority.toLowerCase()); 
			var current_div = $("#"+string1).children(string2);	
		}
				
		else {
			var current_subcategory = $(section).attr("id").toLowerCase();
			var string1 = utilities.parse(track_string, main_section);
			var string2 = utilities.parse(track_string, current_subcategory);
			var current_div = $("#"+string1).children("#"+string2);
		}

		var current_string = (current_div.text()).split("|");
		var new_string = current_string[0] + ' | ' + updated_val;
				
		$(current_div).empty();
		$(current_div).append(new_string);
	},

	updateFreebiePoints: function(key, changed_point, base_value, delta, main_section, section){
	// Retrieve data from dictionaries
		if (main_section == "Advantages") {
			var dict_path = point_dict[section.id][0];
		 	var spent_freebies = dict_path["Freebies"];
		 	var freebie_value = costs_dict["Freebies"][0][section.id];
		}

		else {
			var dict_path = point_dict[main_section][0];
			var spent_freebies = dict_path["Freebies"];
		 	var freebie_value = costs_dict["Freebies"][0][main_section];
		}
		
		// Add or subtract from lists
		if (delta == 1) {
			// Use points
			if(global_freebies - freebie_value >= 0){
				spent_freebies.push(Array(changed_point, freebie_value));
				previous_global_freebies = global_freebies;
				global_freebies = global_freebies - freebie_value;
			}
			else{
				alert("Not enough freebie points. Please try again.")
			}
			
		}
		else {
			// Return points to the pool
			var point_str = changed_point.replace(/\d+/g, '');
			var regex_str = "\^%s\\d";
			var query_str = utilities.parse(regex_str, point_str);
			var query_patt = new RegExp(query_str);
			var candidate_array = [];
			var number_array = [];

			$.each(spent_freebies, function(index, tuple){
				var stat_name = tuple[0];
				var stat_val = tuple[1];
				
				if (query_patt.test(stat_name) == true){
					candidate_array.push(stat_name); 
					number_array.push(stat_name.replace(/\D/g,''));
				}
			});

			var delete_stat = new String();

			if (candidate_array.length > 1){
				var max_value = Math.max.apply(null, number_array);
			
				$.each(candidate_array, function(index){
					var stat_name = candidate_array[index];

					if(stat_name.indexOf(stat_name, stat_name.length - max_value.length) !== -1){
						delete_stat = stat_name;
					} 
				});
			}
			else {
				delete_stat = changed_point;
			}
			
			$.each(spent_freebies, function(index){
				if (spent_freebies[index][0] == delete_stat){
					spent_freebies.splice(index);
					dict_path["Freebies"] = spent_freebies;
					global_freebies = global_freebies + freebie_value;
				}
			});
		}

		// Update Global Variables and Fields
		dict_path["Freebies"] = spent_freebies;
	
		var spent_freebie_total = 0;
		$.each(spent_freebies, function(index){
			spent_freebie_total = spent_freebie_total + spent_freebies[index][1]
		});

		// Update sidebar tracker
		$("#spent_freebies").empty();
		$("#available_freebies").empty();
		$("#spent_freebies").append("Points Remaining: "+spent_freebie_total);
		$("#available_freebies").append("Points Remaining: "+global_freebies);
	},

	updateXPPoints: function(key, changed_point, main_section, section, current_xp_pool, current_spent_xp_pool) {
	//As freebies is equal to zero and xp is available, use this pool.
		
		// Retrieve XP costs and values
		// First check if there are points already invested in the current stat
		// Will determine XP cost for some sections
		
		if ($("#"+changed_point).prop("checked")) {
			var current_stat = ($("#"+key).find("input:checked").length) - 1;
		}

		else {
			var current_stat = ($("#"+key).find("input:checked").length);
		}
		

		if (main_section == "Advantages") {
			var spent_xp = point_dict[section.id][0]["XP"];

			if ((section.id == "Disciplines") && (current_stat == 0)) {
				var xp_value = costs_dict["XP"][0]["New "+section.id];
			}
			else {
				var xp_value = costs_dict["XP"][0][section.id];
				//Most costs will be dependant on current value
				xp_value = xp_value * current_stat;
			}
		
		}

		else {
			var spent_xp = (point_dict[main_section][0])["XP"];

			if ((main_section == "Abilities") && (current_stat == 0)) {
				var xp_value = costs_dict["XP"][0]["New " + main_section];
			}

			else {
				var xp_value = costs_dict["XP"][0][main_section];
				//Most costs will be dependant on current value
				xp_value = xp_value * current_stat;
			}
		}



		// Determine if a click on or click off.
		if ($("#"+changed_point).prop("checked")) {
			// Adding to xp point / Subtracting from xp pool
			var new_xp_dict_total = spent_xp + xp_value;
			var new_xp_monitor_total = current_xp_pool - xp_value;
			var new_xp_monitor_spent = current_spent_xp_pool + xp_value;
		}

		else {
			// Subtracting xp point / Adding to xp pool
			var new_xp_dict_total = spent_xp - xp_value;
			var new_xp_monitor_total = current_xp_pool + xp_value;
			var new_xp_monitor_spent = current_spent_xp_pool - xp_value;
		}
		
		// Update point_dict with XP spending
		if (new_xp_monitor_total >= 0) {
			if (main_section == "Advantages") {
				point_dict[section.id][0]["XP"] = new_xp_dict_total;
			}

			else {
				point_dict[main_section][0]["XP"] = new_xp_dict_total;
			}

			// Update website fields

			$("#available_xp").empty();
			$("#spent_xp").empty();
			$("#available_xp").append("Available XP: "+new_xp_monitor_total);
			$("#spent_xp").append("XP Spent: "+new_xp_monitor_spent);	
		}

		else {
			alert("Not enough points. Try again.")
		}
		
	}


}