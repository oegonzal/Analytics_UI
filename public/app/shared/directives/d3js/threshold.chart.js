(function() {
	'use strict';

	angular
    .module('networkRisk')
    .directive('thresholdChart',['$timeout', 'cassandra', riskChart]);

//https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=d3js%20how%20to%20make%20certain%20area%20color
//http://stackoverflow.com/questions/25901271/using-d3-to-shade-area-between-two-lines
//http://www.d3noob.org/2015/07/clipped-paths-in-d3js-aka-clippath.html
//Or learn how to draw rectangles first, and position them first than graph last
  function riskChart ($timeout, cassandra) {
    return {
      restrict: 'E',
      replace: false,
      require: '^^basicPage',
      scope: {
      	data: '=chartData',
        point: '='
      },
      link: function(scope, element, attrs, basicPageCtrl) {
        

        var margin = {top: 70, right: 30, bottom: 70, left: 90}
          , width = 500 - margin.left - margin.right
          , height = 500 - margin.top - margin.bottom
          , patting = 0
          , xAxisMin = 0
          , yAxisMin = 0
          , xAxisMax = 5
          , yAxisMax = 5
          , criticalityThreshold = 3
          , riskThreshold = 2.5
          , criticalityThresholdCritical = 4
          , riskThresholdCritical = 4;

        var risk_indicator = [ 
                        "",
                        "Very low",
                        "Low",
                        "Medium",
                        "High",
                        "Very high"
                      ];

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

        //var spinner = new Spinner(opts).spin(element[0]);

        var xDomain = [xAxisMin, xAxisMax]; //d3.extent(data, function(d) { return d[0]; });
        var yDomain = [yAxisMin, yAxisMax]; //d3.extent(data, function(d) { return d[1]; });

        var xScale  = d3.scale.linear().range([0 , width]).domain(xDomain);
        var yScale  = d3.scale.linear().range([height, 0]).domain(yDomain);

        var x = d3.scale.linear()
                  .domain([0, xAxisMax]) //.domain([0, d3.max(data, function(d) { return d[0]; })])
                  .range([ 0, width ]);
        
        var y = d3.scale.linear()
                  .domain([0, yAxisMax]) //.domain([0, d3.max(data, function(d) { return d[1]; })])
                  .range([ height, 0 ]);
     
        var chart = d3.select(element[0])
        .append('svg:svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('class', 'chart');

        var main = chart.append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'main');  

        main.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#FF9EAF");

        var yValPosCrit = yScale(criticalityThresholdCritical);
        var yValPos = yScale(criticalityThreshold);

        main.append("rect")
            .attr("x", 0)
            .attr("width", xScale(riskThresholdCritical))
            .attr("y", yScale(criticalityThresholdCritical))
            .attr("height", height - yValPosCrit)
            .attr("fill", "#FCFFA8");

        main.append("rect")
            .attr("x", 0)
            .attr("width", xScale(riskThreshold))
            .attr("y", yScale(criticalityThreshold))
            .attr("height", height - yValPos)
            .attr("fill", "#BFFFC7");
        
        // draw the x axis
        var xAxis = d3.svg.axis()
        .scale(x)
        .tickFormat(function(d) { return risk_indicator[d]; })
        .orient('bottom')
        .innerTickSize(-height)
        .outerTickSize(0)
        .tickPadding(10)
        .ticks(5);

        main.append('g')
        .attr('transform', 'translate(0,' + height + ')')
        .attr('class', 'main axis')
        .call(xAxis);

        main.append("text")      // text label for the x axis
        .attr("x", width / 2 )
        .attr("y", height + margin.bottom - 5 )
        .style({
            "text-anchor": "middle",
            "font-size": "12px",
            "font-weight": "600",
            "font-family": "sans-serif"
        })
        .text("Network Volatility");

        // draw the y axis
        var yAxis = d3.svg.axis()
        .scale(y)
        .tickFormat(function(d) { return risk_indicator[d]; })
        .orient('left')
        .innerTickSize(-width)
        .outerTickSize(0)
        .tickPadding(10)
        .ticks(5);

        main.append('g')
        .attr('transform', 'translate(0,0)')
        .attr('class', 'main axis')
        .call(yAxis);
        
        main.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left )
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style({
            "text-anchor": "middle",
            "font-size": "12px",
            "font-weight": "600",
            "font-family": "sans-serif"
        })
        .text("Network Criticality");

        //Thresholds
        main.append('line')
                    .attr('x1', xScale(xDomain[0]))
                    .attr('y1', yScale(criticalityThreshold))
                    .attr('x2', xScale(riskThreshold))
                    .attr('y2', yScale(criticalityThreshold))
                    .attr('class', 'low_risk');

        main.append('line')
                    .attr('x1', xScale(riskThreshold))
                    .attr('y1', yScale(yDomain[0]))
                    .attr('x2', xScale(riskThreshold))
                    .attr('y2', yScale(criticalityThreshold))
                    .attr('class', 'low_risk');

        main.append('line')
                    .attr('x1', xScale(xDomain[0]))
                    .attr('y1', yScale(criticalityThresholdCritical))
                    .attr('x2', xScale(riskThresholdCritical))
                    .attr('y2', yScale(criticalityThresholdCritical))
                    .attr('class', 'high_risk');

        main.append('line')
                    .attr('x1', xScale(riskThresholdCritical))
                    .attr('y1', yScale(yDomain[0]))
                    .attr('x2', xScale(riskThresholdCritical))
                    .attr('y2', yScale(criticalityThresholdCritical))
                    .attr('class', 'high_risk');

        //Threshold Labels
        main.append("text")      // text label for the x axis
        .attr("x", xScale(xDomain[1]) - 35)
        .attr("y", yScale(yDomain[1]) + 20)
        .style({
            "text-anchor": "middle",
            "font-size": "11px",
            "font-weight": "700",
            "font-family": "sans-serif"
        })
        .text("High Risk");

        main.append("text")      // text label for the x axis
        .attr("x", xScale(riskThresholdCritical) - 50 )
        .attr("y", yScale(criticalityThresholdCritical) + 25 )
        .style({
            "text-anchor": "middle",
            "font-size": "11px",
            "font-weight": "700",
            "font-family": "sans-serif"
        })
        .text("Medium Risk");

        main.append("text")      // text label for the x axis
        .attr("x", xScale(riskThreshold) - 35 )
        .attr("y", yScale(criticalityThreshold) + 20 )
        .style({
            "text-anchor": "middle",
            "font-size": "11px",
            "font-weight": "700",
            "font-family": "sans-serif"
        })
        .text("Low Risk");

        main.append("text")      // text label for the x axis
            .attr("x", width / 2 )
            .attr("y", 0 - 30 )
            .style({
                "text-anchor": "middle",
                "font-size": "20px",
                "font-weight": "700",
                "font-family": "sans-serif"
            })
            .text("Risk Zones");

        //Plot point after it has been received from request
        $timeout( function(){
            if(typeof basicPageCtrl.id != "undefined"){
                console.log("Id is not null, here the id: " + basicPageCtrl.id);
                getData(basicPageCtrl.id);
            }
            else{
                console.log("Inside thresholdChart directive and id is not ready");
            }
        }, 50);

        function getData(id){
            cassandra.secondPageData(id).then(function(data){
               try {
                    if(typeof data == "undefined") throw "No data retrieved";
                    var criticality = data.data[0]['NC'],
                        volatility  = data.data[1]['NV'];

                    basicPageCtrl.volatility = risk_indicator[volatility];
                    basicPageCtrl.criticality = risk_indicator[criticality];
                    var dataPoints = [ [volatility, criticality] ];
                    console.log("The data point is: " + JSON.stringify(dataPoints));
                    
                    var g = main.append("svg:g"); 
        
                    g.selectAll("scatter-dots")
                      .data(dataPoints)
                      .enter().append("svg:circle")
                          .attr("cx", function (d,i) { return x(d[0]); } )
                          .attr("cy", function (d) { return y(d[1]); } )
                          .attr("r", 6.5);

                    //spinner.stop();
                }
                catch(err){
                    console.log(err);
                }
               
            });
        };
	    

      }
    };
  };

}());


//For rotating labels on units in the axis
//http://www.d3noob.org/2013/01/how-to-rotate-text-labels-for-x-axis-of.html