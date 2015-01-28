var buildElements = {
	defineFields : function (key, value, data) {
		// Rewrite this section so that only value region is processed and piped back to  buildSheetData 
		// Key will be reattached at buildSheetData so it's easier to call them for reinput
		
		// If value is null, define text entry field
		if (value == null) {
			var textbox = "<form class='textfield'>%s<input type='text' name='%s'></form>";
			textbox = utilities.parse(textbox, key+':', key)
			return textbox;
		}
		
		// If value is a list of strings, define drop down menu
		else if (typeof value == "string" && value.length>1) {
			referral_dict = loadedJSON[2][value]

			// Catches Arrays, salvages keys
			if (typeof(referral_dict) == "object"){
				if (typeof(referral_dict)[0] == "object") {
					dropdown = buildElements.defineDropdown(key, Object.keys(referral_dict[0]));
				}
				else {
					dropdown = buildElements.defineDropdown(key, referral_dict);
				}
			}
			return dropdown;
		}
	
		else if (typeof value[0] == "number") {
			// If value is a list of single-digit numbers, define dot array
			if (value[0] < 10) {
				dots = buildElements.defineDotArray(key, value);
				return dots;	
			}

			else {
				squares = buildElements.defineSquareArray(key, value);
				return squares;
			}		
		}

		// If value is a dictionary, create drop down menu from keys
		else if (typeof value[0] == "object") {
			var statkey_list = Object.keys(value[0]);
		
			// Differentiates between stats that require input of points, and those that don't
			// If list is populated, create dropdown menu

			if (statkey_list.length != 0) {
				//if ((value[0][(statkey_list[item])].length) == 3) { Don't know why I had item, only caused problems
				if ((value[0][(statkey_list[0])].length) == 3) {
					console.log(key);
					dropdown = buildElements.defineCompositeArray(key, statkey_list, value[0][(statkey_list[0])]);
					return dropdown;
				} 
				else {
					dropdown = buildElements.defineDropdown(key, statkey_list);
					return dropdown;
				}	
			}

			// Catches unloaded lists, just returns the name of the category
			else {
				return None;
			}
		}

		else {
			return new String()
		}
	},

	defineCompositeArray : function (key, object_list, point_tuple) {
	// Creates 'menudots' combination from defineDropdown and defineDotArray functions
		// Create "list" from key and value

		// Creates dropdown list-dot array
		dropdown = buildElements.defineDropdown(key, object_list);
		dotArray = buildElements.defineDotArray(key, point_tuple);
		compositeArray = dropdown + dotArray;
		return compositeArray
		
	},

	defineDropdown: function (key, list) {
	// Return: <select=key><option value='list[item1]'>list[item1]</option>....</select>
		var dropdown = '<select class="dropdown">';		
		
		for (item in list) {
			dropdown_str = "<option value='%s'>%s</option>"
			dropdown += utilities.parse(dropdown_str, list[item], list[item]);
		}

		dropdown += '</select>';

		return dropdown;
	},

	defineDotArray : function (key, tuple) {
	// Creates checkbox dot array
		var dotArray = new String();
		var dot_counter = 1;
		
		//Reminder: Structure is [(total), (empty), (full)]
		if (tuple[2] != 0) {
		//Load full dots (tuple[2])
		//Catches arrays that aren't empty
			for (n = 0; n < tuple[2]; n++) {
				dotFull = buildElements.defineDot("full", key, dot_counter);
				dot_counter += 1;	
				dotArray = dotArray + dotFull;
			}
		}

		for (x = 0; x < tuple[1]; x++) {
			//Load empty dots (tuple[1])
			//Includes fully empty arrays
			dotEmpty = buildElements.defineDot("empty", key, dot_counter);
			dotArray = dotArray + dotEmpty;
			dot_counter += 1;	
		}
		
		outArray = "<div class='checkboxes'>"+dotArray+"</div>"
		
		return outArray; 
	},

	defineDot : function(status, key, number) {
	// Define individual dot that makes up Dot Array
		dot = "<div class='dots'>";

		if (key.indexOf('/') != -1) {
			key = key.replace('/', '');
		}

		var base_code = "<input type='checkbox' id='"

		if (status == "full") {
			dot = dot + base_code + key + number +"' name='"+ key + number + "' checked><label for='" + key + number + "'></label>";
		}
		
		else if (status == "empty") {
			dot = dot + base_code + key + number +"' name='" + key + number + "'><label for='" + key + number + "'></label>";
		}
		
		dot += "</div>";
		return dot;
	},

	defineSquareArray : function (key, tuple) {
	// Define squares that make up Square Point arrays
		var squareArray = "<div id='squareFull'>";

		// Insert Full Boxes - need to check if array is full or empty
		if (tuple[2] != 0) {
			for (n = 0; n < tuple[2]; n++) {
				squareArray = squareArray + '&#9608; '
			}
		}

		squareArray = squareArray + "</div><div id='squareEmpty'>"

		// Inserts empty boxes
		for (n = 0; n < tuple[1]; n++) {
			squareArray = squareArray + '&#9608; '
		}

		outArray = squareArray + "</div>";

		return outArray;
	},

	definePointMenu: function(section, point_dictionary) {
	// Defines priorities dropdown list menus
		if (typeof point_dictionary[section] == "object") {
			var point_categories = Object.keys(point_dictionary[section][0]);
			point_menu = buildElements.defineDropdown(section+"Priority", point_categories);
			$(point_menu).css("display", "inline");
			return point_menu;
		}
	},

	defineSubmitButton: function() {
		// Add submit button
		var button = '<input type="submit" value="Export Character Sheet" name = "submit_character">';
		var button_container = $("<div>").attr("id", "button_container").append(button);
		$("#stat_summary").append(button_container);
	}
}