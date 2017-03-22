(function() {
	"use strict";
	
	var module = angular.module("networkRisk");
	
	module.directive('lineChart', ['$timeout', 'cassandra', lineChart]);
	
	function lineChart($timeout, cassandra) {
		return {
			restrict: 'E',
			require: '^^detailedPage',
			replace: 'false',
			//scope: { },
			link: function (scope, element, attrs, detailedPageCtrl) {
				
				// Set the dimensions of the canvas / graph
				var margin = {top: 100, right: 60, bottom: 60, left: 60},
				    width = 500 - margin.left - margin.right,
				    height = 540 - margin.top - margin.bottom;

				// loader settings
				var opts = {
				  lines: 9, // The number of lines to draw
				  length: 20, // The length of each line
				  width: 5, // The line thickness
				  radius: 40, // The radius of the inner circle
				  color: '#1E88FA', // #rgb or #rrggbb or array of colors
				  speed: 1.9, // Rounds per second
				  trail: 40, // Afterglow percentage
				  className: 'spinner', // The CSS class to assign to the spinner
				};

				var spinner = new Spinner(opts).spin(element[0]);
				
				// Parse the date / time
				var parseDate = d3.time.format("%d-%b-%y").parse;

				// Set the ranges
				var x = d3.time.scale().range([0, width]);
				var y = d3.scale.linear().range([height, 0]);

				// Define the axes
				var xAxis = d3.svg.axis()
					.scale(x)
				    .orient("bottom")
					.innerTickSize(-height)
				    .outerTickSize(0)
				    .tickPadding(10)
				    .ticks(6);

				var yAxis = d3.svg.axis()
					.scale(y)
				    .orient("left")
					.innerTickSize(-width)
				    .outerTickSize(0)
				    .tickPadding(10)
				    .ticks(5);

				// Define the line
				var valueline = d3.svg.line()
				    .x(function(d) { return x(d.date); })
				    .y(function(d) { return y(d.score); });
				    
				// Adds the svg canvas
				var svg = d3.select(element[0])
				    .append("svg")
				        .attr("width", width + margin.left + margin.right)
				        .attr("height", height + margin.top + margin.bottom)
				    .append("g")
				        .attr("transform", 
				              "translate(" + margin.left + "," + margin.top + ")");

			    svg.append("text")      // text label for the x axis
		        .attr("x", width / 2 )
		        .attr("y", height + margin.bottom -3 )
		        .style("text-anchor", "middle")
		        .text("Time (Over 6 months)");

			    svg.append("text")
		        .attr("transform", "rotate(-90)")
		        .attr("y", 0 - margin.left + 3)
		        .attr("x", 0 - (height / 2) )
		        .attr("dy", "1em")
		        .style("text-anchor", "middle")
		        .text("Risk Score");


		        //Plot point after it has been received from request
		        $timeout( function(){
		            if(typeof detailedPageCtrl.id != "undefined"){
		                console.log("Id is not null, here the id: " + detailedPageCtrl.id);

		                //label for chart
		                svg.append("text")      // text label for the x axis
					        .attr("x", width / 2 )
					        .attr("y", 0 - 40 )
					        .style({
					        	"text-anchor": "middle",
				                "font-size": "17px",
				                "font-weight": "700",
				                "font-family": "sans-serif"
					        })
					        .text("Detailed Data for " + detailedPageCtrl.id);
		                getData(detailedPageCtrl.id);
		            }
		            else{
		                console.log("Inside thresholdChart directive and id is not ready");
		            }
		        }, 50);

		        function getData(id){
		        	cassandra.detailedPageGraphData(id).then(function(response){
		        		console.log("Response from graph data  "+response.data);
		               try {
		               		var data = response.data;
		               		//var data=[{"date":"22-Aug-16","score":"4"},{"date":"25-Aug-16","score":"4"}]
		               		if(data.length == 0) throw "No data retrieved";

		                    console.log("detailedPageGraphData for chart is: " + JSON.stringify(data));
		                    //make sure data is in the right format
		                    data.forEach(function(d) {
						        d.date = parseDate(d.date);
						        d.score = +d.score;
						    });
						    console.log("updated data for line graph: " + JSON.stringify(data));

						    // Scale the range of the data
						    x.domain(d3.extent(data, function(d) { return d.date; }));
						    y.domain([0, d3.max(data, function(d) { return d.score; })]);

						    // Add the X Axis
						    svg.append("g")
						        .attr("class", "x axis")
						        .attr("transform", "translate(0," + height + ")")
						        .call(xAxis);

						    // Add the Y Axis
						    svg.append("g")
						        .attr("class", "y axis")
						        .call(yAxis);

		                	// Add the valueline path.
						    svg.append("path")
						        .attr("class", "line")
						        .attr("d", valueline(data));

						    spinner.stop();

						    
						    // Add the scatterplot (Add the points to the graph)
						    svg.selectAll("dot")
						        .data(data)
						      .enter().append("circle")
						        .attr("r", 3)
						        .attr("cx", function(d) { return x(d.date); })
						        .attr("cy", function(d) { return y(d.score); });
						    
		                }
		                catch(err){
		                    console.log(err);
		                }
		               
		            });
		        };

			}
		};
	}
}());
