/*
 * @Author: wakouboy
 * @Date:   2017-06-16 15:33:27
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-16 18:03:03
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
    self.maxNum = 60
    self.timeUnit = 5000 // 时间粒度
    self.timeExpand = 10 * 60 * 1000 // 时间跨度
    self.slotNum = self.timeExpand / self.timeUnit

}
Timeline.prototype.init = function (startTime) {

    var self = this
    self.timeSlots = []
    for (var i = 0; i < self.slotNum; i++) {
        self.timeSlice.push(new Date(startTime.getTime() + i * self.timeUnit))
    }
    self.xScale = d3.time.scale()
        .domain([])
        .range([0, self.width - self.padding.left - self.padding.right]);

    //.domain(d3.range(80))
    //.rangeRoundBands([0, self.width - self.padding.left - self.padding.right]);

    //y轴的比例尺
    self.yScale = d3.scale.linear()
        .domain([0, 60])
        .range([self.height, 0]);

}


// window.TimelineView = new Timeline()
