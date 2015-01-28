var JSON2PHP = {
	load_exportJSON: function(export_JSON) {
		var start_HTML = "<!DOCTYPE html><html><head><title>"+export_JSON["Metadata"][1]["Name"]+"</title></head><body><div class='sheet' style='width:75%;display:block' >"
		var end_HTML = "</div></body></html>"
		var source_HTML = start_HTML

		for (var n = 0; n < (Object.keys(export_JSON).length); n++) {
		// Gather main section names and pipe to functions
			var keyword = (Object.keys(export_JSON))[n];
			var section = JSON2PHP.write_SectionRow(keyword);
			source_HTML  = source_HTML + $(section).html();
		}

		 source_HTML = source_HTML + end_HTML;

		console.log(source_HTML); 
	},

	write_SectionRow: function(section_name) {
	// Creates <div> container for each section, populate with subsection columns stored in section_dict
		var section_start = $("<div>").attr("id", section_name).css("display", "block");
		var section_header = $("<div>").attr("class", "section_header").css("display", "block").css("text-align", "center");
		$(section_header).append(section_name);
		$(section_start).append(section_header);
		var section_dict = export_JSON[section_name];
		var subsection_names = Object.keys(section_dict);

		for (var i = 0; i < subsection_names.length; i++) {
		//  Iterate through subsections if present
			var column_name = subsection_names[i];
			var column = $("<div>").attr("id", column_name).css("width", "33%").css("display", "inline-block").css("text-align", "left").css("vertical-align", "top");
			if (section_name != "Metadata") {
				var column_header = $("<div>").attr("class", "header").css("display", "block");
				$(column_header).append(column_name);
				$(column).append(column_header);
			}

			var column_content = JSON2PHP.write_ColumnRows(column_name, section_dict);

			if (section_name != "Misc" || column_name == "Merits" || column_name == "Flaws") {
				for (var n = 0; n < column_content.length; n++) {
					$(column).append(column_content[n]);
				}
			}

			else {
				for (var n = 0; n < column_content.length; n++) {
					var points_only = ($(column_content[n]).text()).split(' ')[1];
					$(column_content[n]).empty();
					$(column).append($(column_content[n]).append(points_only))
					$(column).css("text-align", "center");
				}
			}

			$(section_start).append(column);
		}

		return section_start;
	},

	write_ColumnRows: function(column_name, section_dict) {
		var column_dict = section_dict[column_name]; // Contents of column
		var list_out = [];

		if (typeof column_dict[0] == "number") {
			// Statistic name is therefore column name
		 	var row = JSON2PHP.write_dataField(column_name, column_dict);
		 	list_out.push(row);
		}

		else {
			var column_keys = Object.keys(column_dict);
			for (j = 0; j < column_keys.length; j++) {
		 		var statistic_name = column_keys[j];
		 		var statistic_value = column_dict[statistic_name];
		 		var row = JSON2PHP.write_dataField(statistic_name, statistic_value);
		 		list_out.push(row);
		 	}
		}
		// Output jQuery row to pass into column set by previous function.
		return list_out;
	},

	write_dataField: function(statistic_name, statistic_value) {
		
		var stat_row = $("<div>").attr("class", "statistic").css("display", "block"); // Output to page
		var output_string = '';

		if (typeof statistic_value == "object" && typeof statistic_value[0] == "number") {
			var full = "&#9679;";
			var empty = "&#9675;";
			
			var fullstring = '';
			var emptystring = '';

			if (statistic_value[0] != 0) {
				for (var n = 0; n < statistic_value[0]; n++) {
					fullstring += full;
				}
				
				for (var n = 0; n < (statistic_value[1] - statistic_value[0]); n++) {
					emptystring += empty;
				}	
			}

			else {
				for (var n = 0; n < statistic_value[1]; n++) {
					emptystring += empty;
				}
			}

			output_string = statistic_name+': '+fullstring + emptystring;
		}

		else {
			output_string = statistic_name+': '+statistic_value;
		}

		$(stat_row).append(output_string);
		return stat_row;
	}
}