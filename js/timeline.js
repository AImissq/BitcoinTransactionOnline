/*
 * @Author: wakouboy
 * @Date:   2017-06-16 15:33:27
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2018-05-31 14:14:30
 */

'use strict';

var Timeline = function() {
    // body...
    var self = this
    self.divId = 'timeBar'
    self.width = $('#' + self.divId).width()
    self.height = $('#' + self.divId).height()
    self.svg = d3.select('#' + self.divId).append('svg').attr('width', self.width).attr('height', self.height).attr('id', 'tsvg')
    self.padding = { left: 30, right: 30, top: 20, bottom: 25 }
    self.maxNum = 100
    self.timeUnit = 5000 // 时间粒度
    self.timeExpand = 10 * 60 * 1000 // 时间跨度
    self.slotNum = self.timeExpand / self.timeUnit
    self.numArr = []
    self.rectWidth = 6
    self.interval = 10
    self.out = 6 * 1000 // 时间轴显示的是当前时间超前
    self.isFull = false

}
Timeline.prototype.init = function(startTime) {

    var self = this


    self.timeSlots = []
    var startT = parseInt(startTime.getTime() / self.timeUnit) * self.timeUnit // 最临近开始时间的正5s数

    // for (var i = self.slotNum - 1; i >= 0; i--) {

    //     self.timeSlots.push(new Date(startT - i * self.timeUnit))
    //     self.numArr.push(0)
    // }

    for (var i = 0; i < self.slotNum; i++) {
        self.timeSlots.push(new Date(startT - (self.slotNum - 1 - i) * self.timeUnit))
        self.numArr.push(0)
    }
    self.numArr[0] = 0
    self.slotsLen = self.timeSlots.length


    self.xScale = d3.scaleTime().range([0, self.width - self.padding.left - self.padding.right]);
    self.yScale = d3.scaleLinear().range([self.height - self.padding.top - self.padding.bottom, 0]);


    self.xScale.domain([new Date(self.timeSlots[0].getTime() - self.timeUnit), self.timeSlots[self.slotsLen - 1]])
    self.yScale.domain([0, self.maxNum])


    var svg = self.svg

    self.xAxis = d3.axisBottom(self.xScale)
        .ticks(10)
        .tickFormat(d3.timeFormat("%H:%M"))


    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + self.padding.left + "," + (self.height - self.padding.bottom) + ")")
        .call(self.xAxis)



    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + self.padding.left + "," + self.padding.top + ")")
        .call(d3.axisLeft(self.yScale).ticks(5).tickSize(3))
        .append("text")
        .attr("y", 0)
        .attr("dy", "0.71em")
        .attr('dx', "1em")
        .attr("text-anchor", "begin")
        .text("N")
        .style('fill', 'black')
         .style('font-family', 'sans-serif')
        // .attr('transform', 'translate(' + 50 + ', 0)');

    for (var i = 0; i < self.slotsLen; i++) {
        svg.append('rect')
            .attr('x', self.padding.left + self.xScale(self.timeSlots[i]) - self.rectWidth / 2)
            .attr('y', self.yScale(self.numArr[i]) + self.padding.top)
            .attr('width', self.rectWidth)
            .attr('height', self.height - self.padding.bottom - self.padding.top - self.yScale(self.numArr[i]))
            .style('fill', 'grey')
            .attr('id', 'rect' + i)
            .attr('class', 'timeRect')
    }

    self.$rect = svg.selectAll('.timeRect')
    var t = d3.transition()
        .duration(1000)

    setInterval(translate, self.interval)

    function translate() {
        // console.log(self.isFull)
        if (self.isFull) {
            var now = new Date(new Date().getTime() + self.out)
            self.xScale.domain([new Date(now.getTime() - self.timeExpand - self.timeUnit), now])
            self.svg.select('.x').call(self.xAxis)
        }


        self.$rect.attr('height', function(d, i) {
                return self.height - self.padding.bottom - self.padding.top - self.yScale(self.numArr[i])
            })
            .attr('y', function(d, i) {
                return self.yScale(self.numArr[i]) + self.padding.top
            })
            .attr('x', function(d, i) {
                return self.padding.left + self.xScale(self.timeSlots[i]) - self.rectWidth / 2
            })
    }


}
Timeline.prototype.update = function(date) {
    var self = this
    var len = self.timeSlots.length
    var tag = true
    var endT = self.timeSlots[len - 1]
        // console.log(date, endT)
    if (date > endT) { // while 循环
        self.timeSlots.push(new Date(endT.getTime() + self.timeUnit))
        self.timeSlots.shift()
        self.numArr.push(1)
        self.numArr.shift()
        self.isFull = true
            // self.xScale.domain([self.timeSlots[0], self.timeSlots[self.slotsLen - 1]])
            // self.svg.select('.x.axis').transition().duration(300).call(self.xAxis)
            // self.svg.select('#rect' + (self.slotsLen - 1)).transition(t)
            // .attr('height', self.height - self.padding.bottom - self.padding.top - self.yScale(self.numArr[self.slotsLen - 1]))
    } else {
        var index = -1
        for (var j = len - 1; j >= 0; j--) {
            if (date > self.timeSlots[j]) {
                self.numArr[j + 1] += 1
                break
            }
        }

        // self.svg.select('#rect' + index).transition(t)
        // .attr('y', self.yScale(self.numArr[index]) + self.padding.top)
        // .attr('height', self.height - self.padding.bottom - self.padding.top - self.yScale(self.numArr[index]))
    }
}




