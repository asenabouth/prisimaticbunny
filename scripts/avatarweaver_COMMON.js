// Avatar Weaver: Common Functions
// Stores functions that are common to ALL displays
// Create backbone of form elements
// Derived from and loaded from avatarweaver_CORE.js

var commonFunctions = {
	build_PriorityMenus: function(priority) {
		$("h2").each(function() {
			// Iterates through each section heading (h2)
			var heading = $(this).text(); //Subsection heading
			var main_heading = $(this).parents().parents("div").parents("div").attr("id"); //Main section heading
			
			// Loop to determine if the section requires a priority menu for point assignment
			if ($.inArray(main_heading, Object.keys(priority)) != -1) {
				index_label = ($("h2").index($(this)));
			 	new_menu = buildElements.definePointMenu(main_heading, priority);
			 	$(this).parent("div").append("<div id='Priority"+index_label+"'>"+new_menu+"</div>");

			 	var priority_html = "<div class='assign_points'><div class='basepoints'>Base Points:</div><div class='basepoints_spent'>Points Spent: 0</div><div class='basepoints_remaining'>Points Remaining:</div></div>" 
			 	$(this).parent("div").parent("div").append(priority_html);
			 	
			 	// Sets Position of Dropdown Lists to descending order
			 	if (index_label > 2) {
			 		var temp_index = index_label - 3;
			 		$(this).siblings("#Priority"+index_label).children("select.dropdown").get(0).selectedIndex = temp_index; 
			 	}
			 	else {
			 		$(this).siblings("#Priority"+index_label).children("select.dropdown").get(0).selectedIndex = index_label;	
			 	}
			}

			else if ($.inArray(heading, Object.keys(priority)) != -1) {
				var point = priority[heading];
				$(this).parent("div.subheading").parent("div").append("<div class='assign_points'><div class='basepoints'>Base Points: "+point+"</div><div class='basepoints_spent'>Points Spent: 0</div><div class='basepoints_remaining'>Points Remaining: "+point+"</div></div>");
			}
		});
	}
}