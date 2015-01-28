// I should probably move this shit to the JSON dictionary...
var point_dict = {
// Array which records what values are put in. Updated by monitorPoints
	"Attributes": [{"Base": [7, 5, 3], "Freebies": [], "XP": [] }],
	"Abilities": [{"Base": [13, 9, 5], "Freebies":[], "XP": [] }],
	"Disciplines": [{"Base": 3, "Freebies":[], "XP": [] }],
	"Backgrounds": [{"Base": 5, "Freebies":[], "XP": [] }],
	"Virtues": [{"Base": 5, "Freebies":[], "XP": [] }],
	"Path": [{"Freebies":[], "XP": [] }],
	"Willpower": [{"Freebies":[], "XP": [] }]
}

var costs_dict = {
	// Freebie and XP costs
	"Freebies": [{"Attributes": 5, "Abilities": 2, "Disciplines": 7, "Backgrounds": 1, "Virtues": 2, "Path": 2, "Willpower": 1}],
	"XP": [{"New Abilities": 3, "New Disciplines": 10, "New Path": 7, "Attributes": 4, "Abilities": 2, "Disciplines": 5, "Other Disciplines": 7, "Secondary Path": 4, "Virtues": 2, "Path": 2, "Willpower": null}]
}

var global_freebies = 15;
var global_xp = 0;

var sheetPreloader = {
	completeStructuralElements: function () {
	// As for Vampire, change skill name to "Disciplines"
		$("#SignatureSkills").attr("id", "Disciplines");
		$("#Disciplines").children("div.assign_points").children("div.basepoints").replaceWith("Base Points: 3"); // Base point adjustment so to not confuse things later down the line...
		$("#Disciplines").children("div.assign_points").children("div.basepoints_remaining").replaceWith("Points Remaining: 3"); // Base point adjustment so to not confuse things later down the line...

		// Complete Stat Summary
		$("#stat_summary").append("<h1>Point Tracker</h1>");
		
		$("#stat_summary").append("<div id='Default_Points'><h3>Default Points</h3></div>");
		$("#stat_summary").append("<div id='Attributes_track'><h4>Attributes</h4></div><div id='Abilities_track'><h4>Abilities</h4></div><div id='Advantages_track'><h4>Advantages</h4></div>")
		
		$("#Attributes_track").append("<div class='primary_track'><b>Primary</b>: 7 | 0</div><div class='secondary_track'><b>Secondary</b>: 5 | 0</div><div class='tertiary_track'><b>Tertiary</b>: 3 | 0</div>");
		$("#Abilities_track").append("<div class='primary_track'><b>Primary</b>: 13 | 0</div><div class='secondary_track'><b>Secondary</b>: 9 | 0</div><div class='tertiary_track'><b>Tertiary</b>: 5 | 0</div>");
		$("#Advantages_track").append("<div id='disciplines_track'><b>Disciplines</b>: 3 | 0</div><div id='backgrounds_track'><b>Backgrounds</b>: 5 | 0</div><div id='virtues_track'><b>Virtues</b>: 5 | 0</div>");

		$("#stat_summary").append("<div id='freebies_xp'><h3>Freebie Points and XP</h3></div>");
		$("#freebies_xp").append("<div id='freebies'><h4>Freebies</h4></div><div id='xp'><h4>Experience</h4></div>");
		$("#freebies").append("<div id='base_freebies'></div><div id='spent_freebies'></div><div id='available_freebies'></div>");							
		$("#xp").append("<div id='base_xp'></div><div id='spent_xp'></div><div id='available_xp'></div>");
		buildElements.defineSubmitButton();
	},

	loadDefaultPoints: function () {
	// Base Values for Freebies
		var base_freebies = 15;
		var spent_freebies = 0;
		var available_freebies = base_freebies - spent_freebies;

		$("#base_freebies").append("Freebie Points: "+ base_freebies);
		$("#spent_freebies").append("Freebie Spent: "+ spent_freebies);
		$("#available_freebies").append("Available Freebies: "+ available_freebies);

		// Base Values for XP
		var xp_content = "<label for='xp_control'>XP Points: </label><input id='xp_control' type='number' min='0' max='1000' step='1' value ='0'/>";
		$("#base_xp").append(xp_content);

		var base_xp = $("#xp_control").val();
		var spent_xp = 0;
		var available_xp = base_xp - spent_xp;
		
		$("#spent_xp").append("Spent XP: "+ spent_xp);
		$("#available_xp").append("Available XP: "+available_xp);
	},

	loadWeaknesses: function (weakness) {
		var subheading = $("<div>").attr("class", "subheading").append("<h2>Weaknesses</h2>"); 
		if ($("#Weaknesses").length) {
			$("#Weaknesses").empty();
		}
		else {
			$("#Misc").append("<div id='Weaknesses' class='subsection'></div>");
		}

		$("#Weaknesses").append(subheading).append(weakness);
	},

	loadDisciplines: function(dictionary, disciplines) {
		// Not Generation dependent due to capping of Disciplines to 8th
		// Therefore define current points as same for all
		// Where is the discipline tracker????!!!! <== Look under "assign_points" element
 		
		var current_generation = $("#Generation").children().val();
		var generation_dict = dictionary["Generation"][0];
		var current_points = generation_dict[current_generation];			
						
		for (skill in disciplines) {
			if (disciplines[skill] == "-") {
				var discipline_list = dictionary["Disciplines"]; 
				var dots = buildElements.defineCompositeArray("Disciplines", discipline_list, [current_points[1], current_points[1], 0]);
				var out_dots = $("<div>").attr("id", "Disciplinesmenu"+(Number(skill)+1)).attr("class", "menudots").css("display", "block").append(dots);
			}
			
			else {
				dots = buildElements.defineDotArray(disciplines[skill], [current_points[1], current_points[1], 0]);
				var out_dots = "<div id='"+disciplines[skill]+"' class='menudots' style='display: block'><div class='keystring'>"+disciplines[skill]+":</div>"+dots+"</div>";
			}

			$(out_dots).insertAfter($("#Disciplines").children("div.subheading"));
		}
	}

}