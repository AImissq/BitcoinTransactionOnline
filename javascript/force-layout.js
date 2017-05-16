var force = d3.layout.force()
    .nodes(nodes)
    .links(edges)
    .size([width, height]);
force.on("tick", function(e) {
  vis.selectAll("circle")
         .attr("cx",function(d){ return d.x; })
       .attr("cy",function(d){ return d.y; });
  vis.selectAll("line")
      .attr("x1",function(d){ return d.source.x; })
      .attr("y1",function(d){ return d.source.y; })
      .attr("x2",function(d){ return d.target.x; })
      .attr("y2",function(d){ return d.target.y; });
  /*console.log(force.alpha())
  if (force.alpha()<1){
      
  }*/
	
});
