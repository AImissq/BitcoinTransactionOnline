/*
 * @Author: wakouboy
 * @Date:   2017-06-16 15:33:27
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2018-05-31 17:43:41
 */

'use strict';

var NumberVV = function() {
    var self = this
    var svg = d3.select("#txnumview").append('svg').attr('width', $('#txvalueview').width())
    .attr('height', $('#txnumview').height())
    var margin = {top: 10, right: 10, bottom: 15, left: 20}
    var width = +svg.attr("width") - margin.left - margin.right
    var height = +svg.attr("height") - margin.top - margin.bottom

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.4),
        y = d3.scaleLinear().rangeRound([height, 0])
    var viewg = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    x.domain([0,1,2,3])
    y.domain([0, 10])

    self.svg = svg
    self.viewg = viewg
    self.width = width
    self.height = height
    self.x = x
    self.y = y
    self.cmax = 10
    viewg.append("g")
      .attr("class", "saxis xaxis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x).tickSize(2))


  viewg.append("g")
      .attr("class", "saxis yaxis")
      .call(d3.axisLeft(y).ticks(2).tickSize(2))
    .append("text")
      .attr("y", 0)
      .attr("dy", "0.71em")
      .attr('dx', "1em")
      .attr("text-anchor", "begin")
      .text("N")
      // .style('stroke', 'grey')
      .style('fill', 'black')
      .style('font-family', 'sans-serif')

var txt = ['1-1', 'M-1', '1-M', 'M-M']
viewg.select('.xaxis').selectAll('text').text(function(d, i){
    return txt[i]
})
    // self.update([8,3,5,6])
}

NumberVV.prototype.update = function(data) {
    // console.log(data)
    var self = this
    var g = self.viewg,
        width = self.width,
        height = self.height,
        x = self.x,
        y = self.y

    var max = d3.max(data)
    if(max + 1 >= self.cmax) {
        self.cmax = self.cmax * 2
        self.y.domain([0, self.cmax])
        g.select('.yaxis').call(d3.axisLeft(y).ticks(2).tickSize(2))
    }


  var selection = g.selectAll(".bar")
    .data(data)
    .attr("class", "bar")
      .attr("x", function(d, i) { return x(i); })
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); })
      .style('fill', 'grey')


    selection.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i) { return x(i); })
      .attr("y", function(d) { return y(d); })
      .attr("width", x.bandwidth())
      .attr("height", function(d) { return height - y(d); })
      .style('fill', 'grey')
    
}




