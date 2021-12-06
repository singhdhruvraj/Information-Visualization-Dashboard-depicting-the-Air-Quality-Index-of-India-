function drawpolarchart(){
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
		$("#polaryears").append(option1);
	});
    polarchart("1987");

    $("#polaryears").on("change", function () {
		var value = $(this).val();
		document.getElementById("barchartheading").style.display="none";
        document.getElementById("polarcharttooltip").style.display="none";
        d3.select("#barchart svg").remove();
		polarchart(value);
	});
}


function barchart(value)
{
    document.getElementById("barchartheading").style.display="block";
    d3.select("#barchart svg").remove();
    var margin = {top: 30, right: 30, bottom: 70, left: 60};
    var box = document.querySelector("#chart1"); //selecting the div with id #chart2
	var width = box.offsetWidth * 0.91; // taking width equal to 90% of #chart2 widthwidth = 460 - margin.left - margin.right,
    var height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
        var svg = d3.select("#barchart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        // Parse the Data
        d3.csv("data/clean_data.csv", function(data1) {

        var data=[];

        data1.forEach(d=>{
            if(d.Year.localeCompare(value.year)==0)
            {
                d[value.name]=parseFloat(d[value.name]);
                data.push(d);
            }
        })    

        // sort data
        data.sort(function(b, a) {
            return a[value.name] - b[value.name];
        });

        data = data.slice(0, 10);

        console.log("bar data",data);

        // X axis
        var x = d3.scaleBand()
            .range([ 0, width ])
            .domain(data.map(function(d) { return d.City; }))
            .padding(0.2);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "translate(-10,0)rotate(-45)")
            .style("text-anchor", "end");

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(data, function(d) { return d[value.name]}), d3.max(data, function(d) { return d[value.name]})])
            .range([ height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // Bars
        svg.selectAll("mybar")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", function(d) { return x(d.City); })
            .attr("y", function(d) { return y(d[value.name]); })
            .attr("width", x.bandwidth())
            .attr("height", function(d) { return height - y(d[value.name]); })
            .attr("fill", "steelblue")

        })

}

function polarchart(year) {
    d3.selectAll("#chart1 svg").remove();
	d3.csv("data/clean_data.csv", (data) => {
        //var year="1987";
		var ndata = [];
		var nexthalf = [];
		var c = [];

		var so2 = 0;
		var no2 = 0;
		var pm2_5 = 0;


		var total = 0;

		data.forEach((d) => {
			if (d.Year.localeCompare(year) == 0) {
				so2 = so2 + parseFloat(d.SO2);
				no2 = no2 + parseFloat(d.NO2);
				pm2_5 = pm2_5 + parseFloat(d.PM2_5);
				total = total + 1;
			}
		});

		var newdata = [];

		newdata.push({ name: "SO2", value: so2 / total, year:year });
		newdata.push({ name: "NO2", value: no2 / total, year:year });
		newdata.push({ name: "PM2_5", value: pm2_5 / total, year:year });

		
		var c = ["SO2", "NO2", "PM2_5"];
		radialChart(newdata, c);
	});
}

function radialChart(data, category) {
	console.log("category", category);
	var box = document.querySelector("#chart1"); //selecting the div with id #chart2
	var width = box.offsetWidth * 0.91; // taking width equal to 90% of #chart2 width

	var margin = {
		top: 81,
		right: 201,
		bottom: 41,
		left: box.offsetWidth * 0.31,
	};

	const PI = Math.PI,
		arcMinRadius = 10,
		arcPadding = 10,
		labelPadding = -5,
		numTicks = 10;

	var height = 701 - margin.top - margin.bottom;
	chartRadius = height / 2.1 - 40;

	var innerRadius = 80,
		outerRadius = Math.min(width, height) / 3;

	//const color = d3.scaleOrdinal(d3.schemeCategory10);

	var angle = 360 / data.length;
	var totalAngle = 0;

	data.forEach((d) => {
		d.angle = totalAngle.toString();
		totalAngle = totalAngle + angle;
	});

	console.log("updated data", data);

	let svg = d3
		.select("#chart1")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.append("g")
		.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    var tooltip = d3
			.select("#chart2") //adding tooltip
			.append("div")
            .attr("id","polarcharttooltip")
			.attr("width", 100)
			.attr("height", 100)
			.attr("class", "tooltips")
			.style("display", "none");


	var x = d3
		.scaleBand()
		.range([0, 2 * Math.PI]) // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
		.align(0) // This does nothing ?
		.domain(
			data.map(function (d) {
				return d.angle;
			})
		); // The domain of the X axis is the list of states.

	// Y scale
	var y = d3
		.scaleRadial()
		.range([innerRadius, outerRadius]) // Domain will be define later.
		.domain([0, d3.max(data, (d) => d.value)]); // Domain of Y is from 0 to the max seen in the data

	// Add bars

	let keys = data.map((d, i) => d.name);
	//number of arcs
	const numArcs = keys.length;
	const arcWidth =
		(chartRadius - arcMinRadius - numArcs * arcPadding) / numArcs;

	let scale = d3
		.scaleLinear()
		.domain([0, d3.max(data, (d) => d.value) * 1.1])
		.range([0, 2 * PI]);

	let ticks = scale.ticks(numTicks).slice(0, -1);
	ticks = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
	// data.forEach((d) => {
	// 	ticks.push(d.value);
	// });

	var ang = 360 / ticks.length;

	function rad2deg(angle) {
		return (angle * 180) / PI;
	}

	function getOuterRadius(index) {
		return getInnerRadius(index) + arcWidth;
	}

	function getInnerRadius(index) {
		return (
			arcMinRadius + (numArcs - (index + 1)) * (arcWidth + arcPadding)
		);
	}

	console.log("radial data", data);

	let radialAxis = svg
		.append("g")
		.attr("class", "r axis")
		.selectAll("g")
		.data(data)
		.enter()
		.append("g");

	radialAxis
		.append("circle")
		.attr("id", function (d, i) {
			return "id_" + i;
		})
		.attr("r", (d, i) => getOuterRadius(i) + arcPadding);

	let axialAxis = svg
		.append("g")
		.attr("class", "a axis")
		.selectAll("g")
		.data(ticks)
		.enter()
		.append("g")
		.attr("transform", function (d) {
			return "rotate(" + (d - 90) + ")";
		});

	axialAxis.append("line").attr("x2", chartRadius);

	axialAxis
		.append("text")
		.attr("x", chartRadius + 10)
		.style("text-anchor", (d) =>
			scale(d) >= PI && scale(d) < 2 * PI ? "end" : null
		)
		.attr(
			"transform",
			(d) =>
				"rotate(" +
				(90 - rad2deg(scale(d))) +
				"," +
				(chartRadius + 10) +
				",0)"
		)
		.text((d) => d);

	var color = d3.scaleOrdinal().domain(category).range(d3.schemeCategory10);
	svg.append("g")
		.selectAll("path")
		.data(data)
		.enter()
		.append("path")
		.attr("fill", function (d) {
			return color(d.name);
		})
		.attr(
			"d",
			d3
				.arc() // imagine your doing a part of a donut plot
				.innerRadius(innerRadius)
				.outerRadius(function (d) {
					return y(d.value);
				})
				.startAngle(function (d) {
					return x(d.angle);
				})
				.endAngle(function (d) {
					return x(d.angle) + x.bandwidth();
				})
				.padAngle(0.01)
				.padRadius(innerRadius)
		)
		.style("stroke", "black")
        .style("opacity",0.81)
        .on("click",function(d){
            console.log("clicked",d);
            barchart(d);
        }).on("mouseover", function (d) {
				//for hovering

				d3.select(this)
					.style("stroke", "black")
                    .style("stroke-width",2) //add black border of element on which hover
					.style("opacity", 1);
				////console.log("d", d.country);
				tooltip.html(
					`<span style="font-size:15px;">Year &emsp; : ${
						d.year
					}</span><br><span style="font-size:15px;">Pollutant Name &emsp; : ${
						d.name
					}</span><br><span style="font-size:15px;">Pollutant Value &emsp; : ${
						d.value
					}`
				); //adding text values in tooltip
				tooltip.style("display", "block"); //display tooltip

				tooltip
					.style("top", d3.event.pageY + 15 + "px") // x positioning of tooltip with respect to square on which we are hovering
					.style("left", d3.event.pageX + 27 + "px"); // y positioning of tooltip with respect to square on which we are hovering
			})
			.on("mouseout", function () {
				// end hovering
				d3.select(this)
					.style("stroke-width", 1)
					.style("opacity", 0.81); //set css normal
				tooltip.style("display", "none"); // hide tooltip
			});;


var width1 = 201;
	var R = 5;
			var svgLegend = d3
				.select("#chart1")
				.append("svg")
				.attr("id", "legendsvg")
				.attr("width", width1)
				.attr("height", (category.length + 3) * 21 + 91)
				.append("g")
				.attr("class", "gLegend")
				// .attr(
				// 	"transform",
				// 	"translate(" + -(width1 / 2) + "," + 21 + ")"
				// );

				console.log("legend data",data);

			var legend = svgLegend
				.selectAll(".legend")
				.data(data)
				.enter()
				.append("g")
				.attr("class", "legend")
				.attr("transform", function (d, i) {
					return (
						"translate(" +
						width1 / 2 +
						"," +
						(i * 21 + 91) +
						")"
					);
				});

			legend
				.append("rect")
				.attr("class", "legend-node")
				.attr("x", 0)
				.attr("y", 4.5)
				.attr("width", 15)
				.attr("height", 15)
				.style("fill", (d, i) => color(d.name));

			legend
				.append("text")
				.attr("class", "legend-text")
				.attr("x", (R + 5) * 2)
				.attr("y", (R + 35) / 2 - 3)
				.style("fill", "black")
				.style("font-size", 12)
				.text((d, i) => d.name);

	
}

function checkUnique(arr) {
	var hash = {},
		result = [];
	for (var i = 0, l = arr.length; i < l; ++i) {
		if (!hash.hasOwnProperty(arr[i])) {
			//it works with objects! in FF, at least
			hash[arr[i]] = true;
			result.push(arr[i]);
		}
	}
	return result;
}
