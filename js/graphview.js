/*
 * @Author: wakouboy
 * @Date:   2017-06-13 19:15:36
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2018-05-31 11:11:01
 */

'use strict';

var GraphView = function() {
    var self = this
    self.subgraphData = [] // 保存原始的subgraph data，nodes， links
    self.subgraphViews = []
    self.width = $('#content').width()
    self.height = $('#content').height()
    self.rowNum = 8
    self.timeInterval = 1 // 单个列的时间跨度 s
    self.currentColumnTime = 0
    self.currentColumn = 0
    self.currentRow = 0
    self.colNumArray = {} // 记录每一列放的位置
        // self.sgWidth = 100
        // self.sgHeight = 100 // 子图的大小
    self.svg = d3.select('#content').append('svg').attr('width', self.width).attr('height', self.height).append('g')
        .attr('id', 'canvas') //.attr('transform', 'translate(0, ' + TextHeight + ')')
    self.paddingTop = TextHeight

    // self.startPosition = 0
   
    self.init()

}
GraphView.prototype.init = function() {
    var self = this
        // var rowNum = self.rowNum = Math.floor(self.height / self.sgHeight)
    var rowNum = self.rowNum
    self.sgHeight = (self.height - self.paddingTop) / rowNum
    self.sgWidth = self.sgHeight
    self.startPosition = self.width - self.sgWidth * 3
    // var colNum = self.colNum = Math.floor(self.width / self.sgWidth) //
    self.colNum = self.rowNum
    var colNum = self.colNum
    // var left = self.width - colNum * self.sgWidth
    var right = self.width - colNum * self.sgWidth


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
    var txTime = new Date(data.x.time * 1000)

    if (data.x.inputs.length > 1 && data.x.out.length > 1) {
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

    } else {
        if (data.x.out.length == 1) {
            nodes.push({
                addr: data.x.out[0].addr,
                value: data.x.out[0].value,
                name: 'nodes' + nodeNum + 's' + sNum,
                size: self.calSize(data.x.out[0].value),
                id: nodeNum,
                state: "output_addr"
            })
            nodeNum += 1
        }
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
    if (data.x.out.length > 1) {
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
    var sLen = self.subgraphData.length
    if (sLen == 0) {
        self.currentColumnTime = new Date(parseInt(txTime.getTime() / 1000) * 1000)
        self.colNumArray[0] = 0
        self.svg.append('g').attr('class', 'columng').attr('id', 'column' + self.currentColumn)
            .attr('transform', 'translate(' + (self.startPosition + self.currentColumn * self.sgWidth) + ',0)')
    } else {
        if (txTime.getSeconds() == self.currentColumnTime.getSeconds()) {
            self.currentRow += 1
            self.colNumArray[self.currentColumn] = self.currentRow
        } else {
            var time = txTime.getTime() - self.currentColumnTime.getTime()
            var newC = parseInt(time / 1000) / self.timeInterval
            self.currentColumn += newC
            if (self.colNumArray[self.currentColumn] == undefined) {
                self.colNumArray[self.currentColumn] = 0
                self.currentRow = 0
                self.svg.append('g').attr('class', 'columng').attr('id', 'column' + self.currentColumn)
                    .attr('transform', 'translate(' + (self.startPosition + self.currentColumn * self.sgWidth) + ',0)')
            } else {
                self.currentRow = self.colNumArray[self.currentColumn] + 1
                self.colNumArray[self.currentColumn] = self.currentRow
            }
            self.currentColumnTime = txTime

        }

    }
    // console.log('row', self.currentRow)
    var vertical = 0
    if (self.currentRow == 0) {
        vertical = self.height / 2 - self.sgHeight / 2 + self.paddingTop
    } else if (self.currentRow % 2 == 1) {
        vertical = self.height / 2 - self.sgHeight / 2 - (self.currentRow + 1) / 2 * self.sgHeight + self.paddingTop
    } else {
        vertical = self.height / 2 - self.sgHeight / 2 + (self.currentRow) / 2 * self.sgHeight + self.paddingTop
    }

    var position = [self.startPosition + self.currentColumn * self.sgWidth, vertical]
        // if (self.currentRow == 0) {
        //     self.svg.append('text')
        //         .attr('x', position[0])
        //         .attr('y', position[1] + 20)
        //         .text(function() {
        //             return timeConvert(self.currentColumnTime)
        //         })
        // }
        // console.log('size', nodeNum, txTime.getTime())

    self.subgraphViews.push(new Subgraph(self.svg, self.subgraphData.length, graph, self.sgWidth, self.sgHeight, self.width, self.height,
        self.rowNum, self.config, position, self.currentColumnTime, self.currentColumn, self.currentRow))
    self.subgraphData.push(graph)

}
GraphView.prototype.svgMove = function() {
    var self = this
    var mTimes = 0
    setInterval(function() {
        mTimes += 1
        $('#canvas').velocity({ translateX: self.sgWidth / 100 * mTimes + 'px' }, 0, 'linear')
            // self.svg
            //     .attr('transform', 'translate(' + (self.sgWidth / 20* mTimes ) + ',0)')
    }, 5)
}
GraphView.prototype.calSize = function(bitAmount) {
    return (2.5 - (1e+8) / ((1e+8) + bitAmount)) * 2
}
