/*
 * @Author: wakouboy
 * @Date:   2017-06-13 19:15:36
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-16 14:03:53
 */

'use strict';

var GraphView = function() {
    var self = this
    self.subgraphData = [] // 保存原始的subgraph data，nodes， links
    self.subgraphViews = []
    self.width = $('#content').width()
    self.height = $('#content').height()
    self.rowNum = 6

    // self.sgWidth = 100
    // self.sgHeight = 100 // 子图的大小
    self.svg = d3.select('#content').append('svg').attr('width', self.width).attr('height', self.height).append('g')
        .attr('id', 'canvas')
    self.init()

}
GraphView.prototype.init = function() {
    var self = this
        // var rowNum = self.rowNum = Math.floor(self.height / self.sgHeight)
    var rowNum = self.rowNum
    self.sgHeight = self.height / rowNum
    self.sgWidth = self.sgHeight

    // var colNum = self.colNum = Math.floor(self.width / self.sgWidth) //
    self.colNum = self.rowNum
    var colNum = self.colNum
    var left = self.width - colNum * self.sgWidth
    self.grid = []

    // for(var i = 0; i<rowNum; i++) {
    //     self.grid.push([])
    //     for(var j=0 ;j<colNum; j++) {
    //         self.grid[i].push(0)

    //         var g = self.svg.append('g').attr('transform', 'translate(' + (left + j*self.sgWidth) + ',' + i * self.sgHeight + ')')
    //                 .attr('id', 'r' + i + 'c' + j)
    //         // g.append('rect')
    //         //  .attr('width', self.sgWidth)
    //         //  .attr('height', self.sgHeight)
    //         //  .style('fill', 'red')
    //         //  .style('stroke','black')
    //     }

    // }

}

GraphView.prototype.getMessage = function(message) {
    var self = this
    if (message['message'] == Config['newTrans']) {
        // console.log(message.data)
        self.config = message.config
        self.parseData(message.data)
    }
}

GraphView.prototype.parseData = function(data) { // 从单一的流数据中提取出graph的结构
    var self = this
    var hash = data.x.hash
        //如果输入的次数大于1则加上表示交易的那个点
    var nodes = []
    var edges = []
    var amount = data.amount
    var nodeNum = 0
    var sNum = self.subgraphData.length // 子图数量
    if (data.x.inputs.length > 1) {
        nodes.push({
            hash: hash,
            relayed_by: data.x.relayed_by,
            time: data.x.time,
            tx_index: data.x.tx_index,
            size: self.calSize(amount * (1e+8)),
            name: 'nodes' + nodeNum + 's' + sNum, // 命名方式 0s1
            id: 0,
            state: "tx"
        });
        nodeNum += 1

    }
    for (var i = 0; i < data.x.inputs.length; i++) {
        nodes.push({
            addr: data.x.inputs[i].prev_out.addr,
            value: data.x.inputs[i].prev_out.value,
            name: 'nodes' + nodeNum + 's' + sNum,
            size: self.calSize(data.x.inputs[i].prev_out.value),
            id: nodeNum,
            state: "input_addr"
        });
        nodeNum += 1
    }

    for (var i = 0; i < data.x.out.length; i++) {
        nodes.push({
            addr: data.x.out[i].addr,
            value: data.x.out[i].value,
            name: 'nodes' + nodeNum + 's' + sNum,
            size: self.calSize(data.x.out[i].value),
            id: nodeNum,
            state: "output_addr"
        });
        nodeNum += 1
    }
    var edgeNum = 0
    for (var i = 1; i < nodeNum; i++) {
        edges.push({
            source: +i,
            target: 0,
            name: 'links' + edgeNum + 's' + sNum,
        })
        edgeNum += 1
    }
    var graph = { 'nodes': nodes, 'links': edges }
    self.subgraphViews.push(new Subgraph(self.svg, self.subgraphData.length, graph, self.sgWidth, self.sgHeight, self.width, self.height,
        self.rowNum, self.config))
    self.subgraphData.push(graph)



}
GraphView.prototype.svgMove = function() {
    var self = this
    self.svg.transition()
        .duration(30000)
        .attr('transform', 'translate(100000,0)')
}
GraphView.prototype.calSize = function(bitAmount) {
    return (2.5 - (1e+8) / ((1e+8) + bitAmount)) * 2
}

window.GraphView = new GraphView()
