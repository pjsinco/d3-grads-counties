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

var g = svg.append('g')


d3.json("data/us-schools-zoom-ready.json", function(error, us) {

  var schoolSelect = document.querySelector('#schools');
  schoolSelect.addEventListener('change', changeSchool, false)
  
  if (error) {
    return console.error(error);
  }

  g
    .classed('states', true)
    .selectAll('path')
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append('path')
    .attr('d', path)
    .style('stroke', '#fff')
    .attr('class', 'state')
    //.style('fill', '#ddd')
    .on('click', clicked)
  
  drawBubbles('UP-KYCOM');

  function drawBubbles(school) {
    var bubbles = g
      .selectAll('circle')
      .data(topojson.feature(us, us.objects.counties).features
        .sort(function(a, b) { return b.properties.schools[school] - a.properties.schools[school] }))


    bubbles
      .enter()
      .append('circle')

    bubbles
      .transition()
      .duration(3000)
      .attr('class', 'bubble')
      .attr('transform', function(d) {
        return 'translate(' + path.centroid(d) + ')';
      })
      .attr('r', function(d) {
        if (!isNaN(d.properties.schools[school])) {
          return radius(d.properties.schools[school]);
        } else {
          return 0;
        }
      })

    bubbles
      .exit()
      .remove()

//    bubbles
//      .append('title')
//      .text(function(d) {
//        return d.properties.county + ': ' + d.properties.schools[school] + 
//          ' DOs from ' + school + ' practicing.';
//      })
  } // end drawBubbles

  function changeSchool(evt) {
    school = evt.target.value;
    drawBubbles(school);
    //gradCount();
    //highlightSchool(school);
  }
  
  function gradCount() {
    // sanity check: count grads
    var gradCount = 0;
    us.objects.counties.geometries.forEach(function(d) {
      if (!isNaN(d.properties.schools[school])) {
        gradCount += Number.parseInt(d.properties.schools[school]);
      }
    })
    console.log(gradCount);
  }

  function drawSchools() {
    d3.csv('data/schools-lat-lon.csv', function(error, csv) {
      var schools = g
        .selectAll('schools')
        .data(csv)
      schools
        .enter()
        .append('circle')
        .classed('schools', true)
        .attr('r', 5)
        .attr('cx', function(d) {
          return projection([
            Number.parseFloat(d.lon), 
            Number.parseFloat(d.lat)
          ])[0];
        })
        .attr('cy', function(d) {
          return projection([
            Number.parseFloat(d.lon), 
            Number.parseFloat(d.lat)
          ])[1];
        })
        //.style('fill', 'rgba(163, 64, 64, 0.45098)')
        .style('fill', '#fff')
    });
  }

  //drawSchools();
  function highlightSchool(school) {
    d3.csv('data/schools-lat-lon.csv', function(error, csv) {
      //csv = csv.filter(function(d) {
        //return d.abbrev == school
      //})

      var highlightedSchool = g
        .selectAll('selected-school')
        .data(csv)

      highlightedSchool
        .enter()
        .append('circle')
        .filter(function(d) { 
          return d.abbrev == school
        })
        .style('fill', 'rgba(255, 0, 0, 0)')
        .classed('selected-school', true)
        .attr('r', function(d) {
          console.log(d);
          return 25;
        })
        .attr('cx', function(d) {
          return projection([
            Number.parseFloat(d.lon), 
            Number.parseFloat(d.lat)
          ])[0];
        })
        .attr('cy', function(d) {
          return projection([
            Number.parseFloat(d.lon), 
            Number.parseFloat(d.lat)
          ])[1];
        })
        .transition()
        .duration(3000)
        .style('fill', 'rgba(255, 0, 0, 0.4)')

        highlightedSchool
          .exit()
          .transition()
          .duration(3000)
          .style('fill', 'rgba(255, 0, 0, 0)')
          .remove()
    });
  }
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
