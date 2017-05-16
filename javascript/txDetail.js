var drawTx=function(data,partDiv){
	var nodes=[]
	var edges=[]
	//console.log(data)

	if(data.input.length>1){
		nodes.push({
			size: data.size,
			state: "tx"
		})
	}

	for(var i=0;i<data.input.length;i++){
		nodes.push({
			value: data.input[i].value,
			addr: data.input[i].addr,
			size: data.input[i].size,
			state: "input"
		})
	}

	for(var i=0;i<data.output.length;i++){
		nodes.push({
			value: data.output[i].value,
			addr: data.output[i].addr,
			size: data.output[i].size,
			state: "output"
		})
	}

	for(var i=1;i<nodes.length;i++){
		edges.push({
          source: 0,
          target: i
        })
	}

	//console.log(edges)

	this.width=document.getElementById(partDiv).clientWidth;
	this.height=document.getElementById(partDiv).clientHeight;

	var visPoint = d3.select("#"+partDiv)
					 .append("svg")
	    			 .attr("width", this.width)
	    			 .attr("height", this.height)

	/*visPoint.select(".tip")
		.data("BTC")
		.enter()
		.append("text")
		.attr("class","tip")
		.attr("transform","translate(" + 0 + "," + 0 + ")")
		.attr("x", 0)
		.attr("y",0)
		.text("BTC")*/


	var forcePoint = d3.layout.force()
	    .nodes(nodes)
	    .links(edges)
	    .size([this.width, this.height])
	   	.charge(-50)
	    .gravity(1)
	    .alpha(1);

		forcePoint.on("tick", function(e) {
			visPoint.selectAll(".circleDe")
		  		   .attr("cx",function(d){ return d.x; })
				   .attr("cy",function(d){ return d.y; });
			visPoint.selectAll(".lineDe")
					.attr("x1",function(d){ return d.source.x; })
					.attr("y1",function(d){ return d.source.y; })
					.attr("x2",function(d){ return d.target.x; })
					.attr("y2",function(d){ return d.target.y; });
		});

	forcePoint.start();

	visPoint.selectAll(".lineDe")
	          .data(edges)
	          .enter()
	          .append("line")
	          .attr("class","lineDe")
	          .style("stroke","grey")
	          .style("stroke-width",1);

	console.log(data)
	var point=visPoint.selectAll(".circleDe")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class","circleDe")
                .attr("r",function(d){
                	return d.size
                })
                .style("opacity","0.8")
                .style("fill",function(d){
                	if(d.state=="tx"){
                		return "#aaaaaa"
                	}
                	else if(d.state=="input"){
                		return "#fda26b"
                	}
                	else{
                		return "#b3d465"
                	}
                })
                .style("stroke-width","1")
                .style("stroke",'black')
                .call(forcePoint.drag);

    point.append("title")
              .text(function(d){
                if(d.state!="tx"){
                  return d.addr;
                }
                else{
                  return d.value*1e-8
                }
              });

}