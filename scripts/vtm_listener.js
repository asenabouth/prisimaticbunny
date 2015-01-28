var sheetMonitor = {
	startListening: function () {
	// Initiator of listeners
		sheetPreloader.completeStructuralElements();
		sheetPreloader.loadDefaultPoints();

		// Watch Scoreboxes (Stat Arrays)
		$(".character-sheet").on("change", ".dots", function() {
			sheetMonitor.scoreboxMonitor($(this));
		});

		// Watch Dropdown Menus
		// Listener for dropdown menu
		$("div.subheading select").each(function() {
		// Default values for priority lists
			sheetMonitor.dropdownMonitor1($(this));
		});


		$(".character-sheet").on("change", ".dropdown", function() {
		// Listener for other dropdown lists
			sheetMonitor.dropdownMonitor2($(this));
		});

		
		$(".character-sheet").on("click", "button", function () {
		// Add or remove dropdown menus
			sheetMonitor.addDropdownLists($(this));
		});

		$("#stat_summary").on("change", "input", function () {
		// Listener for base XP spinner	
			VTMPointTracker.XPSpinnerListener($(this));
		});
		
		// Listener for change block values (Willpower, Path ONLY)

		$(".character-sheet").on("click", "#squareEmpty", function() {
			sheetMonitor.fillSquare($(this));
		});

		$(".character-sheet").on("click", "#squareFull", function() {
			sheetMonitor.emptySquare($(this));
		});

		$("#stat_summary").on("click", "input[name='submit_character']", function() {
			sheetMonitor.exportToJSON();
			console.log("Character sheet exported to JSON dictionary export_JSON");
		});
	},

	scoreboxMonitor: function(active_selection) {
		// Get ID of selected checkbox array
		// Location of checkboxes are different for Backgrounds and Disciplines
		if ($(active_selection).parents("div.subsection").attr("id") == "Backgrounds" || $(active_selection).parents("div.subsection").attr("id") == "Disciplines") {
			var array_key = $(active_selection).parents("div.menudots").attr("id");
		}
		else {
			var array_key = $(active_selection).parents("div.statistics").attr("id");	
		}
		
		// Get current number of selected checkboxes	
		var array_val = $(active_selection).parents("div.checkboxes").find("input:checked").length;
		
		// Dictionary levels path
		var array_path = $(active_selection).parents("div");
		var key_list = new Array();

		array_path.each(function () {
			if ($(this).attr("id")) {
				key_list.push($(this).attr("id"));
			}
		});

		// Check if export dictionary already exists
		// If it already exists, update it
		if (Object.keys(export_JSON).length) {
			var base_dict = export_JSON[key_list[key_list.length-1]];
			var sub_dict = base_dict[key_list[1]];
			sub_dict[key_list[0]] = array_val;	
		}
		
		// Returns name of stat that was clicked
		var changed_point = $(active_selection).children("input").attr("id");

		// Keep track of available points
		VTMPointTracker.monitorPoints(array_key, changed_point);

		//Update associated values if Virtues
		if ($("#"+array_key).parents("div").attr("id") == "Virtues") {
			sheetMonitor.virtue_calculations();
		}

		//Reflect changes in Generation if targeting Generation
		if (array_key == "GenerationBG") {
			$("#Generation select").get(0).selectedIndex = array_val+1;
		}
	},

	dropdownMonitor1: function(active_selection) {
	// Priority listener
		var default_val = $(active_selection).val();
		var home_section = $(active_selection).parents("div.section").attr("id");
		
		var priority_dict = loadedJSON[3][home_section][0];
		
		var default_number = priority_dict[default_val];

		$(active_selection).parents("div.subheading").siblings("div.assign_points").children("div.basepoints").append(" "+ default_number);
		$(active_selection).parents("div.subheading").siblings("div.assign_points").children("div.basepoints_remaining").append(" "+ default_number);
	},

	dropdownMonitor2: function(active_selection) {
	// Dropdown list listener
		var home_category = $(active_selection).parents("div.subsection").attr("id");		
		var selected_menu = $(active_selection).parents().attr("id");
		var just_selected = $(active_selection).find(":selected").text();

		// To combat non-alphanumeric characters from dictionary
		var new_selected = just_selected.replace(/\W/g, '');

		// Identifies multiple dropdown sections on first change
		if ($("#"+selected_menu).hasClass("menudots")) {

			var ref_dict = loadedJSON[1][home_category];
			if ($("#"+new_selected).length) {
			// Detects Duplicate Selections
			 	alert("Already selected - make another choice.");
				$(active_selection).val("Blank");
			}

			else {
				// Renames dropdown list to current selection
				$("#"+selected_menu).attr("id", new_selected);

				if (typeof (ref_dict[0])[just_selected] == "number") {
					// For Merit, Flaw menus. They don't need have their checkboxes reset.
					var stat_val = (ref_dict[0])[just_selected];							// Stat lookup in ref_dict
					var points_div = $(active_selection).siblings("div.points");			// Display stat_val on the website
					
					// Record current total in case something changes...
					var current_total = Number($("#"+home_category).children("div.points_total").children("div.total").text().split(" ")[1]);

					if ($(points_div).length) {
						// If something has already been selected...
						$(points_div).empty();
						$(points_div).append(stat_val);
					}
					else {
						// Creates points class to display point value in.
						$(active_selection).parents("div.menudots").append("<div class='points'>"+stat_val+"</div>");	
					} 
					
					// Update Fields
					// New total for active category

					var new_total = 0;

					$("#"+home_category).children("div.menudots").each(function(){
						// Iterate through current selections for a new total
						new_total += Number($(this).children("div.points").text());
					});

					if (home_category == "Flaws") {
						// Need to specify if Flaws due to -7 point cap
						if (new_total <= (-7)) {
							alert("You've exceeded the Flaws limit. Please make another selection.")
							$(active_selection).get(0).selectedIndex = 0;
							$(active_selection).siblings("div.points").empty();
							return;
						}
						
						else {
							// If total is less than or equal to -7, clear total and replace it with a new one.
							$("#"+home_category).children("div.points_total").children("div.total").empty();
							$("#"+home_category).children("div.points_total").children("div.total").append("Total: "+new_total);
						} 
					}

					else {
						// Just for Merits - unlimited
						$("#"+home_category).children("div.points_total").children("div.total").empty();
						$("#"+home_category).children("div.points_total").children("div.total").append("Total: "+new_total);	
					}

					var spent_val = Number($("#spent_freebies").text().split(" ")[2]);
					var available_val = Number($("#available_freebies").text().split(" ")[2]);

					var new_spent = spent_val + stat_val;
					var new_available = available_val - stat_val;

					$("#spent_freebies").empty()
					$("#available_freebies").empty()

					$("#spent_freebies").append("Spent Points: " + new_spent);
					$("#available_freebies").append("Available Points: " + new_available);

				}
				
				else {
					// For Backgrounds and Disciplines - reset checkboxes.
					if ($(active_selection).siblings("div.checkboxes").children().length != 1) { 
						$(active_selection).siblings("div.checkboxes").children("div.dots").each(function(){
							// Check in case Generation has not been set yet. Resets checkboxes
			 				old_name = $(this).find("input").attr("id");
			 				var new_name = new_selected+old_name.slice(-1);
			 				$("#"+new_selected).children(".menudots .checkboxes").find("input[name='"+old_name+"']").attr("id", new_name).attr("name", new_name);
			 				$("#"+new_selected).children(".menudots .checkboxes").find("label[for='"+old_name+"']").attr("for", new_name);
						});
					}
				}
			}
		}

		// Identifies single dropdown statistic
		else {
			// Starts looking for associated information
			sheetMonitor.dropmenuRelationships(selected_menu, just_selected);
		}		
	},

	addDropdownLists: function(active_selection) {
		if ($(active_selection).hasClass("add_menu")){
		// Grabs original menu
			var base_menu = $(active_selection).parents("div");
			var base_name = $(active_selection).parents("div.subsection").attr("id");
			var base_dict = loadedJSON[1][base_name][0];

			var current_generation = $("#Generation").children().val();
			var generation_dict = loadedJSON[2]["Generation"][0];
			var current_points = generation_dict[current_generation];

			var buttons = "<button type='button' class='add_menu'>+</button><button type='button' class='remove_menu'>-</button>";
			new_menu = buildElements.defineDropdown(base_name, Object.keys(base_dict));

			if (base_name == "Backgrounds") {
				new_stat_tuple = [current_points[1], current_points[1], 0];
				new_dropmenu = buildElements.defineCompositeArray(base_name, Object.keys(base_dict), new_stat_tuple);
				new_menudiv = $("<div>").append(new_dropmenu+buttons).attr("id", (base_name+"menu")).attr("class", "menudots");
			 	$(new_menudiv).insertBefore($("#"+base_name).children(".assign_points"));	
			}

			//else if (base_name == "Disciplines") {

			//}
				
			else {
				new_dropmenu = $("<div>").append(new_menu+buttons).attr("id", (base_name+"menu")).attr("class", "menudots");;
			 	$(new_dropmenu).insertBefore($(active_selection).parents().children("div.points_total")); 
			}
		}

		else {
			// If a merit or flaw, add the points again to get a new total
			if ($(active_selection).parent().parent("div.subsection").attr("id") == "Merits" || $(active_selection).parent().parent("div.subsection").attr("id") == "Flaws") {
				var section = $(active_selection).parent().parent("div.subsection");
				var new_total = 0;

				// Grab deleted value so it could be deleted from the main point pool
				var change_value = Number($(active_selection).siblings("div.points").text());
				$(active_selection).parent().remove();

				// Add new total after menu is deleted
				$(section).children("div.menudots").each(function(){
					new_total += Number($(this).children("div.points").text());
				});

				// Update Local Monitors
				$(section).children("div.points_total").children("div.total").empty();
				$(section).children("div.points_total").children("div.total").append("Total: "+new_total);

				// Update Global Monitors
				// -- Spent Freebies
				var current_spent = Number(($("#spent_freebies").text()).split(' ')[2]);
				var new_spent = current_spent - change_value;
				$(spent_freebies).empty();
				$(spent_freebies).append("Spent Points: "+new_spent);
				
				// -- Available Freebies
				var current_available = Number(($("#available_freebies").text()).split(' ')[2]);
				var new_available = current_available + change_value;
				$(available_freebies).empty();
				$(available_freebies).append("Available Points: "+new_available);
			}

			else {
				// Removes the dropdown menu
				$(active_selection).parent().remove();	
			}
		}
	},



	fillSquare: function(active_selection) {
		var parent_stat = $(active_selection).parents("div:first").attr("id");
		var current_empty = $.trim($(active_selection).text()).split(" ");
		var current_full = $.trim($(active_selection).siblings("#squareFull").text()).split(" ");

		if (parent_stat == "Willpower" || parent_stat == "Path") {
			if (current_empty.length != 1 && current_full.length != 1) {
				var available_freebies = Number($.trim($("#available_freebies").text()).split(" ")[2]);
				var spent_freebies = Number($.trim($("#spent_freebies").text()).split(" ")[2]);

				var available_xp = Number($.trim($("#available_xp").text()).split(" ")[2]);
				var spent_xp = Number($.trim($("#spent_xp").text()).split(" ")[2]);

				if (available_freebies >= 0 || available_xp >= 0) {
					if (available_freebies > 0) {
						var freebie_cost = null;

						if (parent_stat == "Willpower") {
							freebie_cost = 1;
						}

						if (parent_stat == "Path") {
							freebie_cost = 2*1;
						}

						var final_cost = available_freebies - freebie_cost;
						var final_spent = spent_freebies + freebie_cost;

						$("#available_freebies").empty();
						$("#spent_freebies").empty();

						$("#available_freebies").append("Available Freebies: " + final_cost);
						$("#spent_freebies").append("Spent Freebies: " + final_spent);
					}

					if (available_freebies == 0 && available_xp > 0 || available_xp == 0 && available_freebies == 0 && ($("#"+xp_control).val() != 0)) {
						var xp_cost = null;

						if (parent_stat =="Willpower") {
							xp_cost = (current_full.length);	
						}

						else {
							xp_cost = (current_full.length) * 2;
						}

						var final_cost = available_xp - xp_cost;
						var final_spent = spent_xp + xp_cost;

						$("#available_xp").empty();
						$("#spent_xp").empty();

						$("#available_xp").append("Available XP: "+ final_cost);
						$("#spent_xp").append("Spent XP: "+final_spent);
					}

					var new_empty = current_empty.length - 1;
					var new_full = current_full.length + 1;

					var full_string = new String();
					var empty_string = new String();

					for (n = 0; n < new_full; n++) {
						full_string += '&#9608; ';
					}

					for (n = 0; n < new_empty ; n++) {
						empty_string += '&#9608; ';
					}

					$(active_selection).empty();
					$(active_selection).siblings("#squareFull").empty();

					$(active_selection).append(empty_string);
					$(active_selection).siblings("#squareFull").append(full_string); 
				}
			}
		}
	},

	emptySquare: function(active_selection) {
		var parent_stat = $(active_selection).parents("div:first").attr("id");
		var current_full = $.trim($(active_selection).text()).split(" ");
		var current_empty = $.trim($(active_selection).siblings("#squareEmpty").text()).split(" ");

		if (parent_stat == "Willpower" || parent_stat == "Path"){
			if (current_empty.length != 1 && current_full.length != 1){
				var new_empty = current_empty.length + 1;
				var new_full = current_full.length - 1;


				var available_freebies = Number($.trim($("#available_freebies").text()).split(" ")[2]);
				var spent_freebies = Number($.trim($("#spent_freebies").text()).split(" ")[2]);
					
				var available_xp = Number($.trim($("#available_xp").text()).split(" ")[2]);
				var spent_xp = Number($.trim($("#spent_xp").text()).split(" ")[2]);

			if (available_freebies > 0 || available_xp > 0) {
				if (available_freebies > 0) {
					var freebie_cost = null;

					if (parent_stat == "Willpower") {
						freebie_cost = 1;
					}

					if (parent_stat == "Path") {
						freebie_cost = 2*1;
					}

					var final_cost = Number(available_freebies) + Number(freebie_cost);
					var final_spent = spent_freebies - freebie_cost;

					$("#available_freebies").empty();
					$("#spent_freebies").empty();

					$("#available_freebies").append("Available Freebies: " + Number(final_cost));
					$("#spent_freebies").append("Spent Freebies: " + Number(final_spent));

				}

				if (available_freebies == 0 && available_xp > 0) {
					var xp_cost = null;

					if (parent_stat =="Willpower") {
						xp_cost = (current_full.length);	
					}

					else {
						xp_cost = (current_full.length) * 2;
					}

					var final_cost = Number(available_xp) +Number(xp_cost);
					var final_spent = Number(spent_xp) - Number(xp_cost);

					$("#available_xp").empty();
					$("#spent_xp").empty();

					$("#available_xp").append("Available XP: "+ final_cost);
					$("#spent_xp").append("Spent XP: "+final_spent);
				}

				var full_string = new String();
				var empty_string = new String();

				for (n = 0; n < new_full; n++) {
					full_string += '&#9608; '
				}

				for (n = 0; n < new_empty ; n++) {
					empty_string += '&#9608; '
				}

				$(active_selection).empty();
				$(active_selection).siblings("#squareEmpty").empty();

				$(active_selection).append(full_string);
				$(active_selection).siblings("#squareEmpty").append(empty_string);
						
				}
			}
		}
	},

	dropmenuRelationships: function (menu, statistic) {
		if (/^Priority\d*$/.test(menu) == true){
			dictionary = loadedJSON[3];
			section = $("#"+menu).parents(".section").attr("id");
			var limit = dictionary[section][0][statistic];

			// Retrieve other values, adjust current remaining 
			var current_spent = ($("#"+menu).parents("div.subheading").siblings("div.assign_points").children("div.basepoints_spent").text()).split(" ")[2];
			var current_remaining = limit - current_spent;

			// Update fields
			$("#"+menu).parents("div.subheading").siblings("div.assign_points").children("div.basepoints").empty();
			$("#"+menu).parents("div.subheading").siblings("div.assign_points").children("div.basepoints_remaining").empty();
			$("#"+menu).parents("div.subheading").siblings("div.assign_points").children("div.basepoints").append("Base Points: "+limit);
			$("#"+menu).parents("div.subheading").siblings("div.assign_points").children("div.basepoints_remaining").append("Points Remaining: "+current_remaining);
		}

		else {
			for (section in loadedJSON) {
				//Find if the menu is a value in another array
				// Dictionary refers to the three main dictionaries (index, mainSheet, reference)
				var dictionary = loadedJSON[section];
				var target_arr = dictionary[menu];

				if (typeof target_arr == "object") {
					if (typeof target_arr[0] == "object") {
						// What target refers to in reference dictionary
						var statistic_arr = target_arr[0][statistic];

						if (typeof statistic_arr[0] == "number") {
							// For vampire, array format: [ Bloodpool, Maximum Stat ]
							// Vampire - Need to add to Generations Background
							var resource_max = statistic_arr[0];
							var skill_max = statistic_arr[1];

							if (menu == "Generation") {
								if (statistic != "13th") {
									var generation_dict = dictionary["Generation"][0];
									var background_list = Object.keys(loadedJSON[1]["Backgrounds"][0]);
								
									var current_points = generation_dict[statistic][1];
									var add_dots = 13 - (parseInt(statistic));
									var clear_dots = current_points - add_dots; 

									var new_tuple = [current_points, clear_dots, add_dots];

									if ($("#GenerationBG").length) {
										generation_dots = buildElements.defineDotArray("GenerationBGdots", new_tuple);
										$("#GenerationBG").children(".checkboxes").replaceWith(generation_dots);
									}
								
									else {
										generation_div = buildElements.defineDropdown("GenerationBGlist", background_list);
										generation_dots = buildElements.defineDotArray("GenerationBGdots", new_tuple);
										generation_background = $("<div></div>").attr("id", "GenerationBG").attr("class", "menudots").append(generation_div+generation_dots);
										$(generation_background).insertBefore($("#Backgrounds").children(".assign_points"));

										// Pre-existing values, continuously updates
										var current_spent = ($("#Backgrounds").children("div.assign_points").children("div.basepoints_spent").text()).split(' ')[2];
										var current_remaining = ($("#Backgrounds").children("div.assign_points").children("div.basepoints_remaining").text()).split(' ')[2];
									}

									// Update values
									$("#Backgrounds").children("div.assign_points").children("div.basepoints_spent").empty();
									$("#Backgrounds").children("div.assign_points").children("div.basepoints_spent").append("Points Spent: "+(Number(current_spent)+Number(add_dots)));
									$("#Backgrounds").children("div.assign_points").children("div.basepoints_remaining").empty();
									$("#Backgrounds").children("div.assign_points").children("div.basepoints_remaining").append("Points Remaining: "+(Number(current_remaining)-Number(add_dots)));
									$("#GenerationBG select").get(0).selectedIndex = 7;
								}

								else {
									var old_value = ($("#GenerationBG").children("div.checkboxes")).find("input:checked").length;
									var point_container = $("#Backgrounds").children("div.assign_points");

									var old_spent = Number(($(point_container).children("div.basepoints_spent").text()).split(" ")[2]);
									var old_remaining = Number(($(point_container).children("div.basepoints_remaining").text()).split(" ")[2]);

									var new_spent = old_spent - old_value;
									var new_remaining = old_remaining + old_value;


									$(point_container).children("div.basepoints_spent").empty();
									$(point_container).children("div.basepoints_remaining").empty();

									$(point_container).children("div.basepoints_spent").append("Points Spent: "+new_spent);
									$(point_container).children("div.basepoints_remaining").append("Points Remaining: "+new_remaining);

									$("#GenerationBG").remove();	
								}

								//If vampire - Resources
								$("#BloodPool").empty()
								resource_empty = 20 - statistic_arr[0];
								var new_resource = [20, resource_empty, statistic_arr[0]];
								new_squares = buildElements.defineSquareArray('BloodPool', new_resource);
								$("#BloodPool").append("<h2>BloodPool</h2>"+new_squares);

								// Adjust size of score array and reload
								// Grab pre-existing size, remove tuple then replace
								$(".checkboxes").parent("div").map(function () { 
									var current_key = this.id;
									if ($(this).parent().attr("id") != "Virtues") {
										var current_full = ($(this).find("input:checked").length);
										var new_tuple = [skill_max, (skill_max-current_full), current_full];
										new_div = (buildElements.defineDotArray(current_key, new_tuple));
										$(this).children(".checkboxes").replaceWith(new_div);
									}
								});
							}
						}

						else {
							// Special skill loading - will differ from game to game so will need to incorporate
							// "Gameline" flag to process properly
						
							var skills = statistic_arr[0];
							var weakness = statistic_arr[1];

							sheetPreloader.loadWeaknesses(weakness);
							// Good news! Don't need to rewrite entire section, just insert behind current selections
							// - Update: Oops, need to find a way to change first three entries when clans are changed

							if (($("#Disciplines").children("div.menudots")).length != 1) {
							// If Clan has been set and user wants to change clans
							// Save points from those to be deleted, restore to point pool
								var clan_index = Number($("#Disciplines").find("div.keystring").length); // Measures number of disciplines that are clan-specific, exploits non-dropdown
								var entered_points = $("#Disciplines").find("div.checkboxes:lt("+clan_index+")").find(":checked").length;
								var core_points = Number($("#disciplines_track").text().split(' | ')[1]);
								var adjusted_points = core_points - entered_points;
								
								$("#Disciplines").find("div.menudots:lt("+clan_index+")").remove();
								$("#disciplines_track").replaceWith("Disciplines: 3 | "+adjusted_points);
								//$("#Disciplines").children

								sheetPreloader.loadDisciplines(dictionary, skills);
							}

							else {
							// Fresh selection of Clan and Disciplines
								sheetPreloader.loadDisciplines(dictionary, skills);
							}
						}	
					}	
				}
				
				else {
					console.log(menu, statistic)	
				}		
			}
		}		
	},

	virtue_calculations: function () {
	// Retrieve virtue values and calculate linked attributes
		var current_conscience = $("#ConscienceConviction").find("input:checked").length;
		var current_selfcontrol = $("#Self-ControlInstinct").find("input:checked").length;
		var current_courage = $("#Courage").find("input:checked").length;

		var path_value = current_conscience + current_selfcontrol;
		var willpower_value = current_courage;

		new_path = buildElements.defineSquareArray($("#Path").attr("id"), [10, 10-path_value, path_value]);
		new_willpower = buildElements.defineSquareArray($("#Willpower").attr("id"), [10, 10-willpower_value, willpower_value]);
		$("#Path").replaceWith("<div id='Path' style='display: inline, margin: 2px;'><h2>Path</h2>"+new_path+"</div>");
		$("#Willpower").replaceWith("<div id='Willpower' style='display: inline,  margin: 2px;'><h2>Willpower</h2>"+new_willpower+"</div>");
	},

	exportToJSON: function() {
		$("h1.heading").each(function() {
			var head_category = $(this).text();
			if (head_category != "Point Tracker") {
				var indexes = (loadedJSON[0])[head_category];
				if (typeof indexes[0][0] == 'number') {
					var val_dict = {};
					for (n = 0; n < indexes.length; n++){
						var tuple = indexes[n];
						var val2_dict = {};
						
						for (i = tuple[0]; i < tuple[1]+1; i++){
							var name = (Object.keys(loadedJSON[1]))[i];
							value = sheetMonitor.exportToJSONVal(name);
							val2_dict[name] = value;
						}
						val_dict[n+1] = val2_dict;
					}
				}
				else {
					var val_dict = {};
					for (category in indexes[0]) {
						var numbers = indexes[0][category];
						if (typeof numbers == "number") {
							var name = (Object.keys(loadedJSON[1]))[numbers];
							//console.log(name, category, head_category);
							value = sheetMonitor.exportToJSONVal(name);
							val_dict[category] = value;
						}
						else {
							var val2_dict = {}
							for (i = numbers[0]; i < numbers[1]+1; i++){
								var name = (Object.keys(loadedJSON[1]))[i];
								//console.log(name, category, head_category);
								value = sheetMonitor.exportToJSONVal(name);
								val2_dict[name] = value;
							}
							val_dict[category] = val2_dict;
						}
					}
				}
			}
			export_JSON[head_category] = val_dict;
		});

		JSON2PHP.load_exportJSON(export_JSON);
	},

	exportToJSONVal: function(name) {
		var div_name = name;

		if (name.indexOf('/') != -1) {
			div_name = div_name.replace('/', '');
		}

		if (name.indexOf(' ') != -1) {
			div_name = div_name.replace(' ', '');
		}

		var target_div = $("#"+div_name).children();
		var value = null;

		if (target_div.children("option").length) {
			// Get dropdown lists only
			value = target_div.attr("selected", "selected").val()
		}

		else if (target_div.is("div.checkboxes") || name == "Disciplines") {
			// Get score arrays - includes Disciplines. Excludes Backgrounds.
			if (name == "Disciplines") {
				value = {}
				target_div.each(function(){
					var discipline = $(this).attr("id");
					var level = $(this).find("input:checked").length;
					var full = $(this).find("input").length;
					if (discipline != undefined) {
						value[discipline] = [level, full];
					}
				});
			}

			else {
				// Get score arrays only
				var checked = target_div.find("input:checked").length;
				var total = target_div.find("input").length;
				value = [checked, total];	
			}
		
		}

		else if (target_div.hasClass("menudots")) {
			//Targets Backgrounds, Merits and Flaws
			var value = {};

			target_div.each(function(){
				var subname = $(this).children("select.dropdown").val();
				var numeric_value = null;

				if ($(this).find("input:checked").length) {
					var checked_value = $(this).find("input:checked").length;
					var full_value = $(this).find("input").length;
					numeric_value = [checked_value, full_value];
				}
					
				else {
					numeric_value = $(this).children("div.points").text();
				}

				if (subname != undefined){
					value[subname] = numeric_value;	
				}
			});
		}

		else if (target_div.is("#squareFull") || name == "Humanity/Path" || name == "Willpower" || name == "Blood Pool") {
			//Targets Meta Scores only
			if (name == "Humanity/Path") {
				// Renamed to Path due to complexity
				target_div = $("#Path");
			}
			else if (name == "Blood Pool") {
				target_div = $("#BloodPool");
			}
			else {
				target_div = $("#"+name);
			}
			//var raw_string = ($(target_div).text()).eq(1).replace(target_div.id, "");
			var filled_value = ($.trim($(target_div).children("#squareFull").text()).split(" ")).length;
			var full_value = filled_value + (($.trim($(target_div).children("#squareEmpty").text()).split(" ")).length);

			value = [filled_value-1, full_value-1];
		}

		else {
			// Get entered text-fields
			value =  $("[name=\"" + div_name + "\"]").val() ;
		}
		
		return value;
	}
}