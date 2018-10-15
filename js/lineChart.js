const margin = {top: 40, right: 20, bottom: 50, left: 75},
      width = 900 - margin.left - margin.right,
      height = 450 - margin.top - margin.bottom;

const svg = d3.select('#chart').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

const tooltip = d3.select('#chart').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);    

const wrapper = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'); 

const parseTime = d3.timeParse('%Y'),
      formatTime = d3.timeFormat('%Y');

const xScale = d3.scaleTime().range([0, width]),
      yScale = d3.scaleLinear().range([height, 0]);

// d3.line() and d3.area() build line and area generators, respectively.      

const line = d3.line()
    .x(function(d) { return xScale(d.year); })
    .y(function(d) { return yScale(d.value); }); 

const area = d3.area()
    .x(function(d) { return xScale(d.year); })
    .y0(height)
    .y1(function(d) { return yScale(d.value); });  

// A vertical linear gradient is defined inside a defs element for later use.

const areaGradient = svg.append('defs')
    .append('linearGradient')                
        .attr('id','areaGradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');

// Two colours are used in the gradient: #03a099 (top) and #ffffff (bottom).
// Opacity values at the top and at the bottom of the gradient are set 
// to 0.6 and 0, respectively.

areaGradient.append('stop')         
        .attr('offset', '0%')   
        .attr('stop-color', '#03a099')
        .attr('stop-opacity', 0.6); 
   
areaGradient.append('stop')         
        .attr('offset', '85%')   
        .attr('stop-color', '#ffffff')
        .attr('stop-opacity', 0);          

d3.csv('data/gdpPerCapita.csv').then(function(data) {

  data.forEach(function(d) {
    d.value = +d.value;
    d.year = parseTime(d.year);
  });

  xScale.domain(d3.extent(data, function(d) { return d.year; }));
  yScale.domain([0, d3.max(data, function(d) {return d.value; })]).nice();

  wrapper.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(xScale).ticks(6))
    .append('text')
      .attr('x', width / 2)
      .attr('y', 40)
      .style('fill', '#242424')
      .style('text-anchor', 'middle')
      .text('year');

  wrapper.append('g')
      .attr('class', 'axis')
      .call(d3.axisLeft(yScale).tickFormat(d3.format(".2s")))
    .append('text')
      .attr('x', 2)
      .attr('y', -20)
      .style('fill', '#242424')
      .style('text-anchor', 'middle')
      .text('GDP per capita ($)');

  // The area chart is created and filled with the gradient which
  // was previously defined inside the defs element.

  wrapper.append('path')
      .datum(data)
      .attr('class', 'area')
      .style('fill', 'url(#areaGradient)')
      .attr('d', area); 

  wrapper.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#03a099')
      .attr('stroke-width', 1.5)
      .attr('d', line);

  const circles = wrapper.selectAll('circle')
      .data(data)
    .enter().append('circle')
      .attr('r', 4)
      .attr('stroke', '#03a099')
      .attr('stroke-width', 1.5)
      .attr('fill', '#ffffff')
      .attr('cx', function(d){return xScale(d.year)})
      .attr('cy', function(d){return yScale(d.value);})
      .on('mouseover', function(d) {	
        d3.select(this).transition().duration(100)
           .style('fill', '#03a099')
        tooltip.transition()
           .duration(200)
           .style('opacity', 0.9);
        tooltip.html(
          '<p><strong>' + formatTime(d.year) + '</strong></p>' +
          '<p>$' + d3.format(",.2f")(d.value) + '</p>')
           .style('left', (d3.event.pageX + 20) + 'px')
           .style('top', (d3.event.pageY + 20) + 'px');
      })			
      .on('mouseout', function(d) {	
        d3.select(this).transition().duration(100)
           .style('fill', '#ffffff')
        tooltip.transition()
           .duration(200)
           .style('opacity', 0);		
      });    	
});