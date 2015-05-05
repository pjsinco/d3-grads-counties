var contextDim = { 
  margin: {
    top: 0,
    bottom: 20,
    left: 0,
    right: 10
  }
};

var focusDim = {
  margin: {
    top: 500,
    bottom: 20,
    left: 0,
    right: 20
  }
};

var visWidth = 655, visHeight = 437;
var active = d3.select(null);
var windowScale = 1;

var contextWidth = visWidth - contextDim.margin.left - contextDim.margin.right,
  contextHeight = visHeight - contextDim.margin.top - contextDim.margin.bottom,
  focusWidth = visWidth - focusDim.margin.left - focusDim.margin.right,
  focusHeight = visHeight - focusDim.margin.top - focusDim.margin.bottom;

var centered;

var resetButton = d3.select('#reset')
  .style('display', 'none')

var xScale = d3.time.scale()
  .domain([new Date, new Date])
  .nice(d3.time.year, 1950)
  .range([30, visWidth])

var zoom = d3.behavior.zoom()
  .translate([0, 0])
  .center([contextWidth / 2, contextHeight / 2])
  .scale(1)
  .scaleExtent([1, 8])
  .on('zoom', zoom)

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('e')

var svg = d3.select('.vis').append('svg')
  .attr('width', visWidth)
  .attr('height', visHeight)
  .call(responsivefy)
  .call(tip)
  .call(zoom)
  .on('click', stopped, true)
  
var context = svg.append('g')
  .classed('context', true)
  .attr('transform', 'translate(' + 
    contextDim.margin.left + ',' + contextDim.margin.top + ')')

var directions = svg
  .append('text')
  .text('Click on a state to zoom')
  .attr('x', 0)
  .attr('y', function() {
    return contextHeight;
  })
  .style('fill', '#b3b3b3')
  .style('font-size', '12px')

var focus = svg.append('g')
  .classed('focus', true)
  .attr('width', focusWidth + focusDim.margin.left + focusDim.margin.right)
  .attr('height', focusHeight + focusDim.margin.top + focusDim.margin.bottom)
  .attr('transform', 'translate(' +
    focusDim.margin.left + ',' + focusDim.margin.top + ')')

var defaultMapScale = 850;

var projection = d3.geo.albersUsa()
  .translate([contextWidth / 2, contextHeight / 2])
  .scale([defaultMapScale])


var path = d3.geo.path()
  .projection(projection);

var radius = d3.scale.sqrt()
  .domain([0, 150])
  .range([0, 25])

var quantize = d3.scale.quantize()
  .domain([0, 10])
  .range(d3.range(9).map(function(i) { return 'q' + i + '-9'; }))

d3.json("data/us-schools.json", function(error, us) {

    d3.csv('data/schools.csv', function(error, csv) {


      var schoolSelect = document.querySelector('#schools');
      schoolSelect.addEventListener('change', changeSchool, false)
      
      context
        .classed('states', true)
        .selectAll('path')
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', '#fff')
        .attr('class', 'state')
        .on('click', clicked)

      kickoffVis();

      resetButton.on('click', reset)

      function kickoffVis() {
      //drawAllBubbles();
        var kickoffSchool = 'NSU-COM';
        drawLegend();
        drawBubbles(kickoffSchool);
        drawBullseye(kickoffSchool);
        writeSchoolInfo(kickoffSchool);
      }

      function drawLegend() {
        var legend = svg.append('g')
          .classed('legend', true)
          .attr('transform', 'translate(' + (visWidth - 50) + ',' +
            (visHeight - 20) + ')')
          .selectAll('g')
          .data([25, 75, 150, 300])
          .enter().append('g')

        legend
          .append('circle')
          .attr('cy', function(d) { return -radius(d); })
          .attr('r', radius)

        legend
          .append('text')
          .attr('y', function(d) {  return -2 * radius(d) })
          .attr('dy', '1.3em')
          .text(function(d) { return d; })
      }


      function drawAllBubbles() {
        var bubbles = context
          .selectAll('.bubble')
          .data(topojson.feature(us, us.objects.counties).features
            .sort(function(a, b) { 
              return b.properties['mem_count'] - a.properties['mem_count'];
            }), function(d) {
              return d.id;
            }
          )

        bubbles
          .enter()
          .append('circle')
          .classed('bubble', true)
          .attr('transform', function(d) {
            return 'translate(' + path.centroid(d) + ')';
          })
          .attr('r', 0)
          .style('stroke-width', '0.5px')

        bubbles
          .transition()
          .duration(3000)
          .attr('r', function(d) {
            var count = 0;
            for (var prop in d.properties.schools) {
              count += +d.properties.schools[prop];
            }
            return radius(count);
          })
          .style('stroke-width', 0.5 / zoom.scale() + 'px')
          

      } // end drawAllBubbles

      function sanityCountGrads() {
        var grads = 0;
        topojson.feature(us, us.objects.counties).features.forEach(function(d) {
            var count = 0 
            for (var prop in d.properties.schools) {
              if (d.properties.schools.hasOwnProperty(prop)) {
                count += +d.properties.schools[prop];
              }
            }
            grads += count;
        })
      }

      function drawBubbles(school) {
        var c = 0;
        var bubbles = context
          .selectAll('.bubble')
          .data(topojson.feature(us, us.objects.counties).features
            .filter(function(d) {
              return d.properties.schools[school] != undefined;
            })
            .sort(function(a, b) { 
              schoolCountA = (a.properties.schools[school] == undefined ? 0 : a.properties.schools[school]);
              schoolCountB = (b.properties.schools[school] == undefined ? 0 : b.properties.schools[school]);
              return schoolCountB - schoolCountA;
            }), function(d) {
              return d.id;
            }
          )

        var countUndef = 0;

        bubbles
          .enter()
          .append('circle')
          .attr('class', 'bubble')
          .attr('transform', function(d) {
            return 'translate(' + path.centroid(d) + ')';
          })
          .attr('r', 0)
          .style('stroke-width', 0.5 / zoom.scale() + 'px')

        bubbles
          .transition()
          .duration(3000)
          .attr('r', function(d) {
            if (!isNaN(d.properties.schools[school])) {
              return radius(d.properties.schools[school]);
            } else {
              return 0;
            }
          })

        tip.html(function(d) { 
          var count = d.properties.schools[school];
          if (count != undefined) {
            return '<p class="d3-tip__title">' + d.properties.county + '</p>' + 
              '<p class="d3-tip__body">AOA members<br /> in practice<br />from ' + 
              school+ ': <span class="d3-tip__figure">' + count + '</span>' + 
              '</p>';
          }
        })
        
        bubbles
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide)

        bubbles
          .exit()
          .transition()
          .duration(3000)
          .attr('r', 0)
          .remove()
      } // end drawBubbles

      function changeSchool(evt) {
        
        var school = evt.target.value;
        drawBubbles(school);
        //gradCount();
        drawBullseye(school);
        writeSchoolInfo(school);
      }

      function writeSchoolInfo(schoolName) {
        d3.json('/wp-content/themes/elit/js/data/grad-years.json', function(json) {
          var school = json[schoolName];

          var years = []

          for (var prop in school) {
            var year = {}
            if (school.hasOwnProperty(prop)) {
              year[prop] = school[prop];
            }
            years.push(year)
          }

          d3.select('.focus').select('text').remove()

          focus
            .append('text')
            .text(schoolName)

        }) // d3.json
      } // drawSchoolInfo
      
      function gradCount() {
        // sanity check: count grads
        var gradCount = 0;
        us.objects.counties.geometries.forEach(function(d) {
          if (!isNaN(d.properties.schools[school])) {
            gradCount += Number.parseInt(d.properties.schools[school]);
          }
        })
      }

      function drawBullseye(school) {
        d3.selectAll('.selected-school')
          .transition()
          .duration(3000)
          .style('opacity', 0)
          .remove();

        var bullseye = context.append('g')
          .classed('selected-school', true)
        
        var schoolInfo = csv.filter(function(d) {
            return d.abbrev == school;
          })[0]
        document.querySelector('.school-info__name').textContent = schoolInfo.name;
        document.querySelector('.school-info__meta').textContent = 'Established: ' + schoolInfo.est;

        var target = bullseye 
          .selectAll('.bullseye')
          .data(csv.filter(function (d) {
            return d.abbrev == school;
          }))
        
        target
          .enter()
          .append('circle')
          .classed('bullseye', true)

        target
          .style('opacity', '0')
          .attr('r', 25)
          .attr('cx', function(d) {
              return projection([d.lon, d.lat])[0];
          })
          .attr('cy', function(d) {
            return projection([
              parseFloat(d.lon), 
              parseFloat(d.lat)
            ])[1];
          })
          .transition()
          .duration(3000)
          .style('opacity', '1')
          
        target
          .exit() 
          .transition()
          .duration(3000)
          .attr('r', 0)
          .remove()
      } // end drawBulleye
  }); // d3.csv
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

function zoom() {
  tip.hide();

  if (d3.event.scale > 1.05) {
    document.querySelector('.legend').style.display = 'none';
    resetButton.style('display', 'block')
    context.style('cursor', 'move')
    directions.style('display', 'none')
  } else {
    document.querySelector('.legend').style.display = 'block';
    resetButton.style('display', 'none')
    context.style('cursor', 'default')
    directions.style('display', 'block')
  }

  d3.selectAll('.bubble')
    .style('stroke-width', 0.5 / d3.event.scale + 'px')

  context
    .style('stroke-width', 1.5 / d3.event.scale + 'px')
  context
    .attr('transform', function(d) {
      return 'translate(' + d3.event.translate + ')scale(' + 
        d3.event.scale + ')'
     })
}

function zoomClicked() {
  console.log('zoomclick');
  
  svg.call(zoom.event); 

  if (d3.event.defaultPrevented) d3.event.stopPropagation();
    

  var attr = +this.getAttribute('data-zoom')
  console.log(zoom.scale(), attr);

  if ((Math.round(zoom.scale()) <= 1 && attr < 0) || (Math.round(zoom.scale() >= 5 && attr > 0))) {
    return;
  }

  // Record the coordinates (in data space) of the center (in screen space).
  var center0 = zoom.center(), translate0 = zoom.translate(), coordinates0 = coordinates(center0);
  zoom.scale(Math.round(zoom.scale()) * Math.pow(2, +this.getAttribute("data-zoom")));

  // Translate back to the center.
  var center1 = point(coordinates0);
  zoom.translate([translate0[0] + center0[0] - center1[0], translate0[1] + center0[1] - center1[1]]);

  svg.transition().duration(750).call(zoom.event);
}

function coordinates(point) {
  var scale = zoom.scale(), translate = zoom.translate();
  return [(point[0] - translate[0]) / scale, (point[1] - translate[1]) / scale];
}

function point(coordinates) {
  var scale = zoom.scale(), translate = zoom.translate();
  return [coordinates[0] * scale + translate[0], coordinates[1] * scale + translate[1]];
}

function clicked(d) {
  console.log(d);
  console.log(d3.event);
  
  context.style('cursor', 'move')

  resetButton.style('display', 'block');

  if (active.node() === this) return reset();
  active.classed("active", false);
  active = d3.select(this).classed("active", true);

  var bounds = path.bounds(d),
      dx = bounds[1][0] - bounds[0][0],
      dy = bounds[1][1] - bounds[0][1],
      x = (bounds[0][0] + bounds[1][0]) / 2,
      y = (bounds[0][1] + bounds[1][1]) / 2,
      scale = .9 / Math.max(dx / contextWidth, dy / contextHeight),
      translate = [contextWidth / 2 - scale * x, contextHeight / 2 - scale * y];

  svg.transition()
      .duration(750)
      .call(zoom.translate(translate).scale(scale).event);
}

function reset() {
  resetButton.style('display', 'none');
  context.style('cursor', 'default')

  active.classed("active", false);
  active = d3.select(null);

  svg.transition()
      .duration(750)
      .call(zoom.translate([0, 0]).scale(1).event);
}

function stopped() {
  if (d3.event.defaultPrevented) d3.event.stopPropagation();
}

function zoomed() {
  g.style("stroke-width", 1.5 / d3.event.scale + "px");
  g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

