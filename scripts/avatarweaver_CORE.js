// Avatar Weaver: Core Script
// Load first, point where all splats are loaded from
// Create backbone of form elements
// Load specific form elements and listeners from splat-specific scripts

// Chosen game taken from redirect URL
var current_url = window.location.href
var selected_game = new String();

// Global loaded JSON Variables
var loadedJSON = new String();
var loadedCSS = new String();
var script_list = [];
var export_JSON = {};

// Game reference dictionary
var JSONarrays = {
	"vampire": ["json/vtm.js", "css/vtm.css", ["scripts/vtm_listener.js", "scripts/vtm_preloader.js", "scripts/vtm_pointtracker.js"]],
	"werewolf": ["json/wta.js", "css/wta.css", ["scripts/wta_listener.js"]],
	"mage": ["json/mta.js", "css/mta.css", ["scripts/mta_listener.js"]]
};

// Stores values inputted by player
$(document).ready(function () {
	characterBuilder.chooseGame();	// Extract chosen game from redirect URL
	characterBuilder.initialiseAJAX(); 	// AJAX function to open and process JSON
});

// MAIN CLASS: LOADS JSON DICT AND BUILDS CHARACTER SHEET BASED ON BACKBONE
var characterBuilder = {
	chooseGame : function () {
		var query = new String();
		if (loadedJSON == 0) {
			if (current_url.split('?').length > 1) {
				queryString = current_url.split('?')[1].split('&');
				query = queryString[0].split("=")[1];
				selected_game = query
			}
		}
		
		if (queryString != null) {
			loadedJSON = JSONarrays[query][0];
			loadedCSS = JSONarrays[query][1];
			script_list = JSONarrays[query][2];

			//$.getScript(listener);
			$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', loadedCSS));
		}
	},

	initialiseAJAX : function() {
		$.ajax({
			type: 'GET',
			url: loadedJSON,
			async: true,
			jsonpCallback: 'jsonCallback',
			contentType: 'application/json',
			dataType: 'jsonp',
			success: function(json) {
				loadedJSON = json;
				characterBuilder.buildLayout(json);
			},
			error: function(e) {
				console.log(e.message);
			}
		});
	},

	buildLayout : function(json) {
		// Javascript function to read structural dict from json and split up main information dictionary
		// NOTE: MAIN CHARACTER SHEET DICTIONARY LOADED FROM INITIALISE AJAX 
		var mainSheet = json.slice(1);
		// Sections and sub-sections already defined in JSON dict. Just need to pull the values out...
		// Structural dict = json[0] (Will always be first in all templates)
		for (section in json[0]) {
			var indices = json[0][section]; // Indices present for each section
			characterBuilder.buildSections(section, indices, mainSheet); //Output: Page elements written right into the website
		}

		var priority_dict = loadedJSON[3]; // Dictionary to ensure they all go in order
		commonFunctions.build_PriorityMenus(priority_dict);	//Function to assign priority menus	
		$("<div id='stat_summary'></div>").appendTo("body");

		// Load Scripts
		for (script in script_list) {
			$.getScript(script_list[script])	
		}

		$.getScript(script_list[script], function() {
			sheetMonitor.startListening();
		});
	},

	buildSections : function(section, indices, mainSheet) {
		// BREAKING THIS SHIT UP INTO SMALLER FUNCTIONS YO!
		// This is allowed to stay because it is tiny
		// Creates <div> for sections and their associated subsections
		// Adds headers to each section
		$("<div></div>").attr('id', section).attr('class', 'section').css("display", "block").appendTo('.character-sheet');
		$('#'+section).append("<h1 class='heading'>"+section+"</h1>")

		// If statement grabs sections that are not subdivided
		// Loops through indicies to build the list of statistics
		if (typeof indices[0] == "number") {
			for (i = indices[0]; i < indices[1]+1; i++) {
				stat = characterBuilder.buildSheetData(i, mainSheet[0]);
			}
		}

		// Grabs sections that are with divisions but no names
		else if (typeof (indices[0][0]) == "number") {
			var count = 1;
			for (tuple in indices) {
			// Creates div under section called count
				$("<div></div>").attr('id', count).attr('class', 'subsection').css("width", "33%").css("display", "inline-block").appendTo('#'+section);

				// Loop to populate rows with stat names and values
				for (i = (indices[tuple])[0]; i < (indices[tuple])[1]+1; i++ ) {
					// Grabs stat and field with function
					stat = characterBuilder.buildSheetData(i, mainSheet[0]);
						
					// Creates individual stat div to add to main stat
					var statDiv = $("<div>"+stat+"</div>");
					var key = Object.keys(mainSheet[0])[i];

					// Adds to home div
					$("#"+count).append(statDiv);
					statDiv.attr('id', key);
				}
				
				// Increase column name
				count += 1;
			}
		}

		// Grabs sections that do have named divisions
		else if (typeof (indices[0] == "object")) {
			// Retrieve sub-section names from indices
				var subsections = (Object.keys(indices[0]));
				characterBuilder.buildSubsections(section, indices, subsections, mainSheet);
		}
		
		// Catch empty arrays
		else {
			console.log("empty");
		}
	},

	buildSubsections : function(section, indices, indices_list, mainSheet) {
		// Call up indices of sub-sections using section_key
		for (index in indices_list) {
			// Stats, tuple for points
			var subkey = indices_list[index];
			var tuple = indices[0][subkey];
			
			var section_name = utilities.parse("#%s", section);		
			var col_name = utilities.parse("#%s", subkey);
			var subheading_container = utilities.parse("<div class='subheading'><h2>%s</h2></div>", subkey)
			
			// Create column to house each section
			$("<div></div>").attr('id', subkey).attr('class', 'subsection').appendTo(section_name);
			$(col_name).append(subheading_container);
				
			// Tuple could be either a subarray or a number
			// Numbers are normal stats like attributes and abilities
			if (typeof tuple != "number") {
				for (i = tuple[0]; i < tuple[1]+1; i++){
					// Grabs stat and field with function
					stat = characterBuilder.buildSheetData(i, mainSheet[0]);
	
					// Creates individual stat div to add to main stat
					var stat_div = utilities.parse("<div>%s</div>", stat)
					var statDiv = $(stat_div).attr('class', 'statistics').css("display", "block");
					var key = Object.keys(mainSheet[0])[i];

					if (key.indexOf('/') != -1) {
						key = key.replace('/', '');
					}

					if (key.indexOf(' ') != -1) {
						key = key.replace(' ', '');
					}

					// Add to home div
					$(col_name).append(statDiv);
					statDiv.attr('id', key);
				}
			}

			if (typeof tuple == "number") {
				// Catches index-only values
				// Retrieve Associated Values from Main Data Sheet
				stat = characterBuilder.buildSheetData(tuple, mainSheet[0]);

				if ($(stat).hasClass('dropdown')) {
					var button_html = "<button type='button' class='add_menu'>+</button><button type='button' class='remove_menu'>-</button>";
					// Adds menu to div, appends add button
					var dropmenu = $("<div></div>").attr("id", subkey+"menu").attr("class", "menudots").append(stat+button_html);							 
					$(col_name).append(dropmenu);
					
					if (/^.*div>$/.test(stat) == false) {
						// Isolates pointless stats
						$(col_name).append("<div class='points_total'></div>");
						
						if (subkey == "Merits") {
							$(col_name).children("div.points_total").append("<div class='total'>Total: 0</div>");
						}
						else {
							$(col_name).children("div.points_total").append("<div class='limit'>Max: -7</div><div class='total'>Total: 0</div>");
						}
					}
				}

				else {
					// For non-interactive stats like Willpower
					$(col_name).append(stat);
				}
			}
		}
	},

	buildSheetData : function(index, data) {
		// Takes index and section information from buildLayout to retrieve individual statistics
		// Keys are ordered, call keys to populate fields
		
		// Key = Stat as it appears, Value = Element that appears on map
		var key = (Object.keys(data)[index]);
		var value = data[key];
		
		// Creates concatenated key: field for direct insertion into div
		field = buildElements.defineFields(key, value, data);

		// Finishes off code and adds stat name if necessary		
		if ($(field).hasClass('dropdown')) {
			// Captures list-only arrays
			if (typeof value[0] == "string") {
				field = key+': '+field;
			}
		}
	
		else {
			//Capture score arrays
			if (field != "</select>") {
				if ($(field).attr("class") == 'checkboxes') {
					field = "<div class='keystring'>"+key+":</div>" + field;
				}
				
			}
			else if (field == "</select>") {
				field = ($("<div></div>").attr("id", "SignatureSkills"));
			}
		}
		
		return field;
	},
}


