var sheetMonitor = {
	monitorPoints: function(key, changed_point) {
		// Takes key (statistic) and changed_point (name of pressed input)
		// and updates point usage (base points, freebies and XP)

		// Identify home category of statistic
		var main_section = $("#"+key).parents("div.section").attr("id");

		if ((main_section == "Attributes" || main_section == "Abilities" || $("#"+key).parents("div").attr("id") == "Backgrounds" || $("#"+key).parents("div").attr("id") == "Virtues" 
		|| $("#"+key).parents("div").attr("id") == "Disciplines")) {

			// Calculate sum of points in the section the statistic belongs to
			var section = $("#"+key).parents("div")[0];
			var current_total = 0;

			$(section).children("div").each(function () {
				current_total += $(this).find("input:checked").length;	
			}

			// Adjust "current_total" if required, to remove default points
			if (($("#"+key).parents("div.section").attr("id") == "Attributes" || $("#"+key).parents("div").attr("id") == "Virtues" )) {
				if (current_total != 0) {
			 		current_total = current_total - 3;
				}
			}

			// "current_total" now only consists of base_points, freebies and xp
			// Next step - differentiate between which pools have been spent

			// BASE POINTS ------------------------------
			// Identify base points invested into section

			var base_reference_div = $("#"+key).siblings("div.assign_points").children("div.basepoints");
			var base_reference = Number($("#"+key).siblings("div.assign_points").children("div.basepoints").text());

			// "remaining" : used to determine how many points are left over after addition of points to "key"
			// remaining indicates how many points may have been purchased with freebies and xp

			var remaining = current_total - base_reference;

			// Therefore if remaining is equal to 0, or above 0 - all base points
			// have been used up. Therefore just update base point tracker.

			if (remaining > 0) {
				// Update point tracker dictionary
				var active_key = point_dict[main_section][0]; // Select the dictionary within the list
				var active_value = active_key["Base"]; // Select the key "Base" within the dictionary "active_key"

				// Abilities and Attributes have arrays, while rest only have an int
				// For arrays, find index of section title, then update basic dictionaries
				if (typeof active_value == Array) {
					var index = $("#"+main_section).indexOf($(section).attr("id"));
					var active_value[index] = current_total; // Updates value in right column, corresponding to section index
				}
			
				//Updates original dictionary
				active_key["Base"] = active_value;
				point_dict[main_section] = active_key;

				// Update point tracker itself
				// Update home base tracker
				$("#"+key).siblings("div.assign_points").children("div.basepoints_spent").empty();
				$("#"+key).siblings("div.assign_points").children("div.basepoints_remaining").empty();

				$("#"+key).siblings("div.assign_points").children("div.basepoints_spent").append("Points Spent: "+current_total);
				$("#"+key).siblings("div.assign_points").children("div.basepoints_remaining").append("Points Remaining: "+remaining);

				// Update main point tracker
				if (main_section == "Attributes" | main_section == "Abilities") {
					var current_priority = (($(section).find("select.dropdown").attr("selected", "selected")).val()).toLowerCase();
					var current_div = $("#"+main_section+"_track").children("div."+current_priority+"_track");	
				}
				
				else {
					var current_subcategory = $(section).attr("id").toLowerCase();
					var current_div = $("#"+main_section+"_track").children("#"+current_subcategory+"_track");
				}

				var current_string = (current_div.text()).split("|");
				var new_string = current_string[0] + ' | ' + remaining;
				
				current_div.empty();
				current_div.append(new_string);
			}

			else if (remaining < 0) {
				console.log(remaining);
			}

			else {
				console.log(remaining);
			}



		}
}