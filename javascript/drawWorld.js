var map = L.map("map-canvas",{center:[30, 0],zoom:2});
var accessToken = 'pk.eyJ1IjoieWV0YW5nemhpIiwiYSI6ImNpajFrdmJ1aDAwYnF0b2x6cDA2bndybjgifQ.g9phAioL8kT5ik4jGg6kNQ';
var style = "light"; // emerald,light,dark
var tileLayer = L.tileLayer('https://api.mapbox.com/v4/mapbox.' +  style+ '/{z}/{x}/{y}.png?access_token=' + accessToken);
tileLayer.addTo(self.map);
var color=["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];

var data = new Array()

function drawPoint(lat,lon){
  var cities = [{"latLng":[lat, lon]}];
  var citiesOverlay = L.d3SvgOverlay(function(sel,proj){
    //d3.selectAll(".trajpoint").remove()
    scale=proj.scale
    var citiesUpd = sel.selectAll('circle').data(cities);
    citiesUpd.enter()
      .append('circle')
      .attr("class","trajpoint")
      //.attr('r',5/proj.scale)
      .transition().duration(1000).attr('r', 5/proj.scale)
      .attr('cx',function(d){return proj.latLngToLayerPoint(d.latLng).x;})
      .attr('cy',function(d){return proj.latLngToLayerPoint(d.latLng).y;})
      .style('stroke','none')
      .attr('stroke-width',1)
      .style("opacity", 0.8)
      .attr('fill','grey')
     /* .on("click",function(d){
        console.log(d.lat+":"+d.lon)
      })
      .append("title")
      .text(function(d){
        return d.lat+":"+d.lon;
      }); */
  });
  citiesOverlay.addTo(map);
}
