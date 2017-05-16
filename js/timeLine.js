var drawTimeBar=function(mindate,maxdate){
	console.log(mindate)
	console.log(maxdate)
	var self=this;
	self.width=document.getElementById("timeBar").clientWidth
	self.height=document.getElementById("timeBar").clientHeight
	self.svg = d3.select("#timeBar")
		.append("svg")
		.attr("class","timeBarClass")
		.attr("width", self.width)
		.attr("height", self.height);
	//画布周边的空白
	self.padding = {left:30, right:30, top:20, bottom:25};
	self.width=self.width - self.padding.left - self.padding.right
	self.height=self.height - self.padding.top - self.padding.bottom
	//定义一个数组
	//var dataset = [10, 20, 30, 40, 33, 24, 12, 5,10, 20, 30, 40,40, 33, 24, 12, 5, 33, 24, 12, 5];
		
	//var mindate = new Date(2016,3,11,18,20),
    //    maxdate = new Date(2016,3,11,18,25);
            	
	//x轴的比例尺
	self.xScale = d3.time.scale()
	    .domain([mindate, maxdate])    // values between for month of january
	    .range([0, self.width]);
		
		//.domain(d3.range(80))
		//.rangeRoundBands([0, self.width - self.padding.left - self.padding.right]);

	//y轴的比例尺
	self.yScale = d3.scale.linear()
		.domain([0,60])
		.range([self.height, 0]);

	//定义x轴
	self.xAxis = d3.svg.axis()
		.scale(self.xScale)
		.orient("bottom")
		.ticks(5)
		.tickFormat(d3.time.format("%H:%M"));
		
	//定义y轴
	self.yAxis = d3.svg.axis()
		.scale(self.yScale)
		.orient("left")
		.ticks(10)

		//.tickFormat(function(d) { return d3.time.format("%HH:%MM")(new Date(d)) });

	//矩形之间的空白
	self.rectPadding = 1;
	//添加x轴
	self.svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + self.padding.left + "," + (self.height + self.padding.top) + ")")
		.call(self.xAxis)
		.append("text")
		.text("time")
		.attr('transform', 'translate(' + self.width + ', -5)');
	//添加y轴
	self.svg.append("g")
		.attr("class","axis")
		.attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")")
		.call(self.yAxis)
		.append("text")
		.text("num")
		.attr('transform', 'translate(' + 5 + ', 0)');
		//.attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")");	

	/*var dataset=[]
	for(var i=0;i<80;i++){
	  dataset[i]=0
	}

	var rects = self.svg.selectAll(".MyRect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("class","MyRect")
		.attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")")
		.attr("x", function(d,i){
			//console.log(i)
			return self.xScale(i) + self.rectPadding/2;
		})
		.attr("y",function(d){
			return self.yScale(d);
		})
		.attr("width", self.xScale.rangeBand() - self.rectPadding )
		.attr("height", function(d){
			return self.height - self.padding.top - self.padding.bottom - self.yScale(d);
		})
		.attr("fill","grey")
		.on("click",function(){
			d3.selectAll(".MyRect")
			  .attr("fill","grey")
			d3.select(this)
			  .attr("fill","black");
		});
*/
	/*self.texts = self.svg.selectAll(".MyText")
		.data("BTC")
		.enter()
		.append("text")
		.attr("class","MyText")
		.attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")")
		.attr("x", 20*self.rectPadding)
		.attr("y",self.rectPadding)
		.text("BTC")*/
}
drawTimeBar.prototype.update=function(dataset){
	/*for(var i=0;i<dataset.length;i++){
		console.log(dataset[i].time)
		dataset[i].time=new Date(dataset[i].time*1000)
		console.log(dataset[i].time)
	}*/
	//console.log(dataset)
	var self=this;
	//console.log(self.xScale(2))
	//添加矩形元素

	//d3.selectAll(".MyRect").remove()
	
	//console.log(dataset)
	
	//console.log(dataset[0].time)
	/*d3.selectAll(".lineG").remove()*/

	/*var line = d3.svg.line()
	    .x(function(d) { return self.xScale(d.time); })
	    .y(function(d) { 
	    	//console.log(d.amount)
	    	return self.yScale(d.amount); })
	    .interpolate('monotone');*/

	//console.log(line)

/*	var path = self.svg.append('path')
	  .attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")")
	  .attr('class', 'lineG')
	  .style("stroke","black")
	  .style("fill","none")
	  .attr('d', line(dataset));*/

	/*var g = self.svg.selectAll('circle')
	  .data(dataset)
	  .enter()
	  .append('g')
	  .append('circle')
	  .attr('class', 'linecircle')
	  .attr('cx', line.x())
	  .attr('cy', line.y())
	  .attr('r', 3.5)
	  .on('mouseover', function() {
	    d3.select(this).transition().duration(500).attr('r', 5);
	  })
	  .on('mouseout', function() {
	    d3.select(this).transition().duration(500).attr('r', 3.5);
	  });*/

	/*self.svg.selectAll("path")
	      .data(dataset)
	      .enter()
	      .append("path")
	      .attr("class", "line")
	      .attr("d", line);*/


	var rects = self.svg.selectAll(".MyRect")
		.data(dataset)
		.enter()
		.append("rect")
		.attr("class",".MyRect")
		.attr("transform","translate(" + self.padding.left + "," + self.padding.top + ")")
		.attr("x", function(d,i){
			//console.log(i)
			//console.log(self.xScale(d.time) + self.rectPadding/2)
			return self.xScale(d.time);
		})
		.attr("y",function(d){
			return self.yScale(d.amount);
		})
		.style("stroke","none")
		.style("fill","grey")
		.attr("width",(self.width/120)*7/10)
		//self.xScale.rangeBand() - self.rectPadding
		.attr("height", function(d){
			return self.height-self.yScale(d.amount);
		})
		.on("mouseover",function(d){
			d3.select(this)
			  .style("fill","black")
			  //.attr("width",2);
		})
		.on("mouseout",function(d){
			d3.select(this)
			  .style("fill","grey")
			  //.attr("width",0.5);
		});
	
	rects.append("title")
	          .text(function(d){
	            return d.amount
	          });	

	/*//添加文字元素
	var texts = svg.selectAll(".MyText")
		.data(dataset)
		.enter()
		.append("text")
		.attr("class","MyText")
		.attr("transform","translate(" + padding.left + "," + padding.top + ")")
		.attr("x", function(d,i){
			return xScale(i) + rectPadding/2;
		} )
		.attr("y",function(d){
			return yScale(d);
		})
		.attr("dx",function(){
			return (xScale.rangeBand() - rectPadding)/2;
		})
		.attr("dy",function(d){
			return 20;
		})
		.text(function(d){
			return d;
		});*/
}