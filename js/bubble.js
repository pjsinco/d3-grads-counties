var margin = { 
  //top: 20,
  top: 0,
  bottom: 20,
  left: 0,
  right: 20
};


//var width = 655 - margin.left - margin.right,
  //height = 437 - margin.top - margin.bottom;
var width = 992 - margin.left - margin.right,
  height = 661 - margin.top - margin.bottom,
  centered;

var svg = d3.select('.vis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .call(responsivefy);

var p = document.querySelector('.vis');
var selectElem = document.createElement('select')
selectElem.setAttribute('id', 'school')
p.appendChild(selectElem)

var projection = d3.geo.albersUsa()
  .scale(1070)
  .translate([width / 2, height / 2])

var path = d3.geo.path()
  .projection(projection);

var radius = d3.scale.sqrt()
  .domain([0, 150])
  .range([0, 25])

var quantize = d3.scale.quantize()
  .domain([0, 10])
  .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; }))

svg
  .append('rect')
  .classed('background', true)
  .attr('width', width)
  .attr('height', height)
  .on('click', clicked)


d3.json("data/us-schools-zoom-ready.json", function(error, us) {
  if (error) {
    return console.error(error);
  }

  console.log(getSchoolsList(us));

  var counties = svg.append('g')
    .classed('counties', true)
    .selectAll('path')
    .data(topojson.feature(us, us.objects.counties).features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#d0d0d0')


  var land = svg
    .append('path')
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr('class', 'border border--state')
    .attr('d', path)
  
  drawBubbles();

  function drawBubbles() {
    var bubbles = svg
      .selectAll('circle')
      .data(topojson.feature(us, us.objects.counties).features
        .sort(function(a, b) { return b.properties.schools['NSU-COM'] - a.properties.schools['NSU-COM'] }))
      .enter()
      .append('circle')
      .attr('class', 'bubble')
      .attr('transform', function(d) {
        return 'translate(' + path.centroid(d) + ')';
      })
      .attr('r', function(d) {
        //return 2;
        //return radius(d.properties.schools['NSU-COM']);
        if (!isNaN(d.properties.schools['NSU-COM']))
          return radius(d.properties.schools['NSU-COM']);
        else
          return 0;
        //return radius(d.properties.population);
      })

    bubbles
      .append('title')
      .text(function(d) {
        return d.properties.county + ': ' + d.properties.schools['NSU-COM'] + ' DOs from NSU-COM practicing.';
      })
  } // end drawBubbles


}); // d3.json


/**
 * Make the vis responsive
 *
 * http://www.brendansudol.com/posts/responsive-d3/
 *
 */
function responsivefy(svg) {
  /* get container + svg aspect ratio */
  var container = d3.select(svg.node().parentNode),
    width  = parseInt(svg.style('width')),
    height = parseInt(svg.style('height')),
    aspect = width / height;

  // add viewBox and preserveAspectRatio props,
  // and call resize so that svg resizes on initial page load
  svg
    .attr('viewBox', '0 0 ' + width + ' ' + height)
    .attr('preserveAspectRatio', 'xMinYMid')
    .call(resize)

  // to register multiple listeners for the same event type,
  // we need to namespace them, which we will using the id
  // of our svg's container
  d3.select(window)
    .on('resize.' + container.attr('id'), resize);

  function resize() {
    var targetWidth = parseInt(container.style('width'));
    svg
      .attr('width', targetWidth)
      .attr('height', Math.round(targetWidth / aspect));
  }
} // responsivefy


/**
 * Generate an array of all the schools
 */
function getSchoolsList(topojson) {
  schools = [];
  topojson.objects.counties.geometries.forEach(function(d) {
    var keys = [];
    for (var k in d.properties.schools) {
      keys.push(k)
    }

    keys.forEach(function(d) {
      if (schools.indexOf(d) < 0) {
        schools.push(d);
      }
    })
  });
  return schools;
}

function clicked(d) {
  console.log('clicked');
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  g.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  g.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
