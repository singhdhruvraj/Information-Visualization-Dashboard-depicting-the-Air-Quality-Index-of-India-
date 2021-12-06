function toJson(key, country, value) {
	return {
		key: key,
		country: country,
		value: value,
	};
}

function drawheatmap() {
	heatmapChart("SO2");
	$("#pollutants").on("change", function () {
		var value = $(this).val();
		heatmapChart(value);
		document.getElementById("heatmapheadings").innerHTML =
			value + " Level in Different States of India Through Out Years";
			document.getElementById("heatmaptooltip").style.display="none";
	});
}

function heatmapChart(value) {
	//console.log("call", value);
	d3.csv("data/clean_data.csv", function (data1) {
		//loading csv file data1 is data of csv file
		////console.log("data", data1);

		d3.selectAll("#chart2 svg").remove();

		// var margin = { left: 40, right: 40, top: 40, bottom: 40 };
		var box = document.querySelector("#chart2row"); //selecting the div with id #chart2

		var margin = {
			left: box.offsetWidth * 0.125,
			right: box.offsetWidth * 0.125,
			top: 40,
			bottom: 40,
		};

		var width = box.offsetWidth * 0.75 - margin.left; // taking width equal to 90% of #chart2 width
		var height = screen.height / 5;
		height = height * 3 - margin.top - margin.bottom; //taking height equal to 3/5 of height of screen

		var svg = d3
			.select("#chart2")
			.append("svg") //adding responsive svg element for drawing chart (svg is container for drawing any shape or any chart)
			//.attr("viewBox", [0, 0, width, height])
			.attr(
				"width",
				margin.left + width + margin.right + box.offsetWidth * 0.125
			)
			.attr("height", margin.top + height + margin.bottom)
			.append("g")
			.attr(
				"transform",
				`translate(${margin.left * 1.5},${margin.top})`
			)
			.attr("fill", "none");

		let data = [],
			date = [];

		data1.forEach((d) => {
			date.push({ state: d.Year });

			data.push(toJson(d.Year, d.State, d[value]));
		});

		var Country = d3
			.map(data1, function (d) {
				return d.State;
			})
			.keys(); //Selecting all column names like other, households, manufacturing

		var Keys = d3
			.map(date, function (d) {
				return d.state;
			})
			.keys(); // getting all countries code names

		////console.log("Country", Country);

		var x = d3
			.scaleBand() //creating x axis
			.range([0, width])
			.domain(Keys)
			.padding(0.05);

		svg.append("g") //adding x axis in svg container
			.style("font-size", 11)
			.attr(
				"transform",
				"translate(" + width * 0.05 + "," + height * 0.9 + ")"
			)
			.call(d3.axisBottom(x).tickSize(0))
			.select(".domain")
			.remove();

		var y = d3
			.scaleBand() //creating y axis
			.range([height * 0.9, 0])
			.domain(Country)
			.padding(0.05);

		svg.append("g") //adding x axis in svg container
			.style("font-size", 9)
			.attr("transform", "translate(" + width * 0.02 + ",0)")
			.call(d3.axisLeft(y).tickSize(0))
			.select(".domain")
			.remove();

		//var myColor = d3.scaleOrdinal(d3.schemeBlues[7]); //selecting blue color scheme for colouring

		var myColor = d3.scaleOrdinal(d3.schemeGnBu[7]); //selecting blue color scheme for colouring

		var tooltip = d3
			.select("#chart2") //adding tooltip
			.append("div")
			.attr("id","heatmaptooltip")
			.attr("width", 100)
			.attr("height", 100)
			.attr("class", "tooltips")
			.style("display", "none");

		tooltip.append("div").attr("class", "label");

		tooltip.append("br");

		tooltip.append("div").attr("class", "count");

		var svg1 = svg
			.append("g")
			.attr("width", width * 0.85)
			.attr("height", height * 0.5)
			.attr("transform", "translate(50,0)"); //creating new element g (a new sub container for creating heatmap)

		svg1.selectAll() //adding squares in heatmap(this whole code block is loop runs till all elements of data)
			.data(data) //using formated data
			.enter()
			.append("rect")
			.attr("x", function (d) {
				return x(d.key);
			}) //defining x axis value
			.attr("y", function (d) {
				return y(d.country);
			}) //defining y axis value
			// .attr("rx", 4) //making edges round
			// .attr("ry", 4) //making edges round
			.attr("width", x.bandwidth()) // for automatic calculating width of each square according to width of chart
			.attr("height", y.bandwidth()) // for automatic calculating height of each square according to width of chart
			.style("fill", function (d) {
				return myColor(d.value);
			}) // adding color
			.style("stroke-width", 4)
			.style("stroke", "none")
			.style("opacity", 0.81)
			.on("mouseover", function (d) {
				//for hovering

				d3.select(this)
					.style("stroke", "black") //add black border of element on which hover
					.style("opacity", 1);
				////console.log("d", d.country);
				tooltip.html(
					`<span style="font-size:15px;">State &emsp; : ${
						d.country == "" ? "EU" : d.country
					}</span><br><span style="font-size:15px;">Year &emsp; : ${
						d.key
					}</span><br><span style="font-size:15px;">Pollutant Levels &emsp; : ${
						d.value
					}</span>`
				); //adding text values in tooltip
				tooltip.style("display", "block"); //display tooltip

				tooltip
					.style("top", d3.event.pageY + 15 + "px") // x positioning of tooltip with respect to square on which we are hovering
					.style("left", d3.event.pageX + 27 + "px"); // y positioning of tooltip with respect to square on which we are hovering
			})
			.on("mouseout", function () {
				// end hovering
				d3.select(this)
					.style("stroke", "none")
					.style("opacity", 0.81); //set css normal
				tooltip.style("display", "none"); // hide tooltip
			});
	});
}
