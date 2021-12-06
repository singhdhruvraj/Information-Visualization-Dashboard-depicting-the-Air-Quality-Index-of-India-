function updateTable(data, year, id) {
	var found = false;
	data.forEach((d) => {
		if (
			d.Year.localeCompare(year) == 0 &&
			d.State.localeCompare(id) == 0
		) {
			document.getElementById("t-table").style.display = "block";
			document.getElementById("t-state").innerHTML = d.State;
			document.getElementById("t-aqi").innerHTML = d.AQI;
			document.getElementById("t-so2").innerHTML = d.SO2;
			document.getElementById("t-no2").innerHTML = d.NO2;
			document.getElementById("t-pm2_5").innerHTML = d.PM2_5;
			document.getElementById("t-year").innerHTML = d.Year;
			found = true;
		}
	});

	if (found == false) {
		document.getElementById("t-table").style.display = "block";
		document.getElementById("t-state").innerHTML = id;
		document.getElementById("t-aqi").innerHTML = "N/A";
		document.getElementById("t-so2").innerHTML = "N/A";
		document.getElementById("t-no2").innerHTML = "N/A";
		document.getElementById("t-pm2_5").innerHTML = "N/A";
		document.getElementById("t-year").innerHTML = "N/A";
	}
}

function drawMap() {
	var option = [];
	var uniqueoptions = [];
	var option1 = "";

	d3.csv("data/clean_data.csv", function (data) {
		data.forEach((d) => {
			// option +=
			// 	'<option value="' + d.Year + '">' + d.Year + "</option>";
			option.push(d.Year);
		});
		$.each(option, function (i, el) {
			if ($.inArray(el, uniqueoptions) === -1) uniqueoptions.push(el);
		});
		//console.log("uniqueoptions", uniqueoptions);
		uniqueoptions.forEach((d) => {
			option1 += '<option value="' + d + '">' + d + "</option>";
		});
		//console.log("option1", option1);
		$("#mapyears").append(option1);
	});

	mapChart("1987");

	$("#mapyears").on("change", function () {
		var value = $(this).val();
		document.getElementById("t-table").style.display = "none";
        document.getElementById("maptooltip").style.display="none";
		mapChart(value);
	});
}

function mapChart(year) {
	d3.csv("data/clean_data.csv", function (data) {
		d3.selectAll("#mapdiv svg").remove();
		

		let map_data = {};

		data.forEach((d) => {
			//adding new object with two columns Entity and total
			if (d.Year.localeCompare(year) == 0)
				map_data[d["State"]] = d["AQI"];
		});


		var transformation;
		var iszoomed = false; //flags
		var active = d3.select(null); //country clicked or not

		var zoom = d3
			.zoom() //zoom function
			.scaleExtent([1, 100])
			.on("zoom", zoomed);

		var box = document.querySelector("#mapdivcol"); //same as heatmap please refere heatmap comments

		//var cp_height = 301;

		var cp_height = screen.height / 5;
		cp_height = cp_height * 3.3;

		var margin = {
			left: box.offsetWidth * 0.125,
			right: box.offsetWidth * 0.125,
			top: 40,
			bottom: 40,
		};

		var cp_width = box.offsetWidth - margin.left;

		var choropleth = d3
			.select("#mapdiv")
			.append("svg")
			// .attr("viewBox", [0, 0, cp_width, cp_height])
			.attr("height", cp_height)
			.attr("width", cp_width + margin.left + margin.right)

			.attr("fill", "none");

		var projection = d3
			.geoMercator() //function for drawing map
			.scale(1)
			.translate([1, 0]);

		var path = d3
			.geoPath() //part of drawing map
			.projection(projection);

		var tooltip = d3
			.select("#mapdiv") //tooltip added
			.append("div")
			.attr("width", 301)
			.attr("height", 101)
			.attr("class", "tooltips")
			.attr("id", "maptooltip")
			.style("display", "none");

		tooltip.append("div").attr("class", "label");

		tooltip.append("br");

		tooltip.append("div").attr("class", "count");

		choropleth
			.append("rect") //subcontainer adding for zooming map
			.attr("class", "background")
			.attr("width", cp_width + margin.left + margin.right)
			.attr("height", cp_height);

		var g = choropleth
			.append("g")
			.attr("width", cp_width)
			.attr(
				"transform",
				`translate(${cp_width + margin.left + margin.right},${0})`
			);
		//.attr("transform", "translate(51,0)"); //subcontainer adding for drawing map

		d3.json("javascript/india_states.json", function (map) {
			//loading world map json for drawing map using coordinates
			//console.log("map", map);
			var bounds = path.bounds(map);
			var s =
				0.95 /
				Math.max(
					(bounds[1][0] - bounds[0][0]) / cp_width,
					(bounds[1][1] - bounds[0][1]) / cp_height
				); //calculating coordinates
			var t = [
				(cp_width - s * (bounds[1][0] + bounds[0][0])) / 2,
				(cp_height - s * (bounds[1][1] + bounds[0][1])) / 2,
			]; // calculating coordinates
			projection.scale(s).translate(t);
			//console.log("features", map.features);
			d3.select("#mapdiv")
				.select("g") //drawing map main function
				.attr("class", "tracts")
				.selectAll("path")
				.data(map.features) // coordinates data
				.enter()
				.append("path")
				.attr("d", path)
				//.on("click", clicked) //click function
				.on("click", function (d) {
					updateTable(data, year, d.id);
				})
				.attr("stroke", "white")
				.attr("stroke-width", 0.5)
				.attr("fill", "white")
				.attr("fill-opacity", 0.7);

			Tooltipupdate(map_data, data); //tooltip adding on map

			updateColors(map_data); //add color in each country
		});

		function clicked(d) {
			d3.selectAll(".row_data").remove();
			d3.select("#example").style("display", "block");
			d3.select("#example").selectAll("*").remove();
			if (active.node() === this) {
				//if clicked on zoomed country then go back to world map
				iszoomed = false;
				global_country = "global";

				reset();
			} else {
				//error handling
				if (iszoomed) {
					reset();
				}
				iszoomed = true; //otherwise zoom to the country
				active.classed("active", false);
				active = d3.select(this).classed("active", true);

				choropleth
					.selectAll("path") //zoom animation
					.transition()
					.duration(1000)
					.attr("opacity", 0.3);

				d3.select(this)
					.transition()
					.duration(1100)
					.attr("opacity", 1); //zoom animation

				var bounds = path.bounds(d), //new coordinates calculating for zooming
					dx = bounds[1][0] - bounds[0][0],
					dy = bounds[1][1] - bounds[0][1],
					x = (bounds[0][0] + bounds[1][0]) / 2,
					y = (bounds[0][1] + bounds[1][1]) / 2,
					scale = Math.max(
						1,
						Math.min(
							8,
							0.9 / Math.max(dx / cp_width, dy / cp_height)
						)
					),
					translate = [
						cp_width / 2 - scale * x,
						cp_height / 2 - scale * y,
					];

				//console.log("now translate", translate);

				choropleth
					.transition()
					.duration(750)
					.call(
						zoom.transform,
						d3.zoomIdentity
							.translate(translate[0], translate[1])
							.scale(scale)
					); // updated for d3 v4
			}
		}

		function reset() {
			//function for zoom out
			active.classed("active", false);
			active = d3.select(null);
			choropleth
				.selectAll("path") //main zoom out functions
				.transition()
				.delay(10)
				.attr("opacity", 1);

			choropleth
				.transition() //animation
				.duration(750)
				.call(zoom.transform, d3.zoomIdentity);
		}

		function zoomed() {
			//sub function in which above zoom function call
			transformation = d3.event.transform; //changing position of map container
			g.attr("transform", d3.event.transform); //changing position of map container
			choropleth
				.selectAll("circle")
				.attr("transform", d3.event.transform);
		}

		function Tooltipupdate(map_data, club) {
			// tooltip adding same as heatmap please refer heatmap
			choropleth
				.selectAll("path")
				.on("mouseover", function (d) {
					//console.log("d", d);
					d3.select(this).style("fill-opacity", 1);
					tooltip.html(
						`<span style="font-size:15px;">State &emsp; : ${
							d.id
						}</span><br><span style="font-size:15px;">Air Quality Index &emsp; : ${
							map_data[d.id] == undefined
								? 0
								: map_data[d.id]
						}</span>`
					);
					tooltip.style("display", "block");

					tooltip
						.style("top", d3.event.layerY + 15 + "px")
						.style("left", d3.event.layerX + 27 + "px");
				})
				.on("mouseout", function () {
					d3.select(this).style("fill-opacity", 0.7);
					tooltip.style("display", "none");
				});
		}

		function updateColors(map_data) {
			//adding colors

			var array = Object.values(map_data);

			var min = getPercentile(array, 1); //calculating min value of data (wastage)
			var q1 = getPercentile(array, 25); //calculating above min value of data (wastage)
			var mean = getPercentile(array, 50); //calculating mean value of data (wastage)
			var q3 = getPercentile(array, 75); //calculating between mean and max value of data (wastage)
			var max = getPercentile(array, 99); //calculating max value of data (wastage)

			var color_domain = [min, q1, mean, q3, max]; //setting colors according to values

			// var min = getPercentile(array, 1); //calculating min value of data (wastage)
			// var q1 = getPercentile(array, 20); //calculating above min value of data (wastage)
			// var q2 = getPercentile(array, 40); //calculating above min value of data (wastage)
			// var mean = getPercentile(array, 60); //calculating mean value of data (wastage)
			// var q5 = getPercentile(array, 80); //calculating above min value of data (wastage)
			// //var q6 = getPercentile(array, 90); //calculating above min value of data (wastage)
			// var max = getPercentile(array, 99); //calculating max value of data (wastage)

			// var color_domain = [
			// 	min,
			// 	q1,
			// 	q2,
			// 	q3,
			// 	q4,
			// 	mean,
			// 	q5,
			// 	q6,
			// 	q7,
			// 	q8,
			// 	max,
			// ]; //setting colors according to values

			//var color_domain = [max, q5, mean, q2, q1, min]; //setting colors according to values

			var cp_color = d3
				.scaleThreshold() //adding colors
				.range(d3.schemeBlues[7])
				.domain(color_domain);

			choropleth
				.selectAll("path")
				.transition()
				.duration(500)
				.attr("fill", function (d) {
					//console.log("d", d);
					//console.log("d.properties", d.properties);
					//console.log(
					// 	"map_data[d.properties.id]",
					// 	map_data[d.id]
					// );
					//console.log("d.properties.id", d.id);
					map_data[d.id];
					if (map_data[d.id]) {
						return cp_color(map_data[d.id]);
					} else {
						//return cp_color(0);
						return "#d8e8f5";
					}
				});

			var legend_labels = [];
			var ext_color_domain = [];
			ext_color_domain.push(0);

			for (var i = 0; i < color_domain.length; i++) {
				//for coloring each path
				ext_color_domain.push(color_domain[i]);
			}

			for (var i = 0; i < color_domain.length; i++) {
				//for coloring each path
				if (i == 0) legend_labels.push("< " + color_domain[i]);
				else
					legend_labels.push(
						parseInt(color_domain[i - 1]) +
							1 +
							" - " +
							color_domain[i]
					);
			}
			legend_labels.push("> " + color_domain[color_domain.length - 1]);

			choropleth
				.selectAll("g.legend")
				.select("text") //text setting
				.transition()
				.duration(500)
				.on("start", function () {
					var t = d3.active(this).style("opacity", 0);
				})
				.on("end", function () {
					choropleth
						.selectAll("g.legend")
						.select("text")
						.text(function (d, i) {
							return legend_labels[i];
						})
						.transition()
						.delay(500)
						.duration(1000)
						.style("opacity", 1);
				});
		}

		function getPercentile(data, percentile) {
			//percentile of data calculating
			data.sort(numSort);
			var index = (percentile / 100) * data.length;
			var result;
			if (Math.floor(index) == index) {
				result = (data[index - 1] + data[index]) / 2;
			} else {
				result = data[Math.floor(index)];
			}
			if (result == 0) {
				result = 1;
			}
			return result;
		}

		function numSort(a, b) {
			//sorting data
			return a - b;
		}
	});
}
