console.log('hiya');
var margin = { 
  //top: 20,
  top: 0,
  bottom: 20,
  left: 0,
  right: 20
};


//var width = 655 - margin.left - margin.right,
  //height = 437 - margin.top - margin.bottom;
var width = 1000 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var svg = d3.select('.vis').append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .call(responsivefy);

var p = document.querySelector('.vis');
var selectElem = document.createElement('select')
selectElem.setAttribute('id', 'school')
p.appendChild(selectElem)

var path = d3.geo.path()
  .projection(null);

var radius = d3.scale.sqrt()
  .domain([0, 50])
  .range([0, 25])

//d3.json('data/us-schools-with-abbrevs.json', function(error, us) {
d3.json('data/us-schools.json', function(error, us) { if (error) {
    return console.error(error);
  }


  console.log(getSchoolsList(us));

  svg
    .append('path')
    .datum(topojson.feature(us, us.objects.nation))
    .classed('land', true)
    .attr('d', path);

  svg
    .append('path')
    .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
    .attr('class', 'border border--state')
    .attr('d', path)

  svg
    .append('g')
    .attr('class', 'bubble')
    .selectAll('circle')
    .data(topojson.feature(us, us.objects.counties).features)
      .sort(function(a, b) { return b.properties.schools['WesternU/COMP'] - a.properties.schools['WesternU/COMP'] })
    .enter()
    .append('circle')
    .attr('transform', function(d) {
      return 'translate(' + path.centroid(d) + ')';
    })
    .attr('r', function(d) {
      //return 2;
      //return radius(d.properties.schools['WesternU/COMP']);
      if (!isNaN(d.properties.schools['WesternU/COMP']))
        return radius(d.properties.schools['WesternU/COMP']);
      else
        return 0;
      //return radius(d.properties.population);
    })

  svg
    .selectAll('circle')
    .append('title')
    .text(function(d) {
      return d.properties.name + ': ' + d.properties.schools['WesternU/COMP'] + ' DOs from WesternU/COMP practicing.';
    })

    


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
