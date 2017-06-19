/*
 * @Author: wakouboy
 * @Date:   2017-06-13 20:33:17
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-19 22:33:05
 */

'use strict';

var Subgraph = function(svg, index, graph, w, h, width, height, rowNum, config, end, currentColumnTime, currentColumn, currentRow) {

    var transform_x = 100,
        transform_y = 100
        // console.log(graph)
        // console.log(d3.select)
        // index += 70 // 从靠近头部处开始移动

    var translateX = $('#canvas').css('transform')
    var delay = 0
    if (translateX != 'none') {
        var currTrans = translateX.split(/[()]/)[1];
        delay = +currTrans.split(',')[4];
    }

    var start = [-w * 2 - delay, height / 2 - h / 2]
    var points = []

    var g = svg.append('g')
        .attr('transform', 'translate(' + start + ')')
        .attr('visibility', 'visible')
        .attr('id', 'g' + index)

    var work = new Worker("js/callayout.js")

    // console.log(textWidth, textHeight)
    //发送消息
    work.postMessage({ graph, w, h });
    // 监听消息
    work.onmessage = function(event) {
        graph = event.data
            // console.log(graph)
        var start = new Date()
        drawLayout(graph)

        g.transition().duration(3000).attr('visibility', 'visible').attr('transform', 'translate(' + end[0] + ',' + (end[1]) + ')')
            .on('end', function() {

                if (end[1] == TextHeight) {

                    var ctText = timeConvert(currentColumnTime)

                    if (preTime == 0) {
                        preTime = currentColumnTime
                    } else {
                        var tstp = parseInt((currentColumnTime.getTime() - preTime.getTime()) / 1000 / GraphView.timeInterval)

                        for (var i = tstp - 1; i > 0; i--) {
                            var ntxt = timeConvert(new Date(currentColumnTime.getTime() - i * 1000 * GraphView.timeInterval))
                            if (columnTimeIndex[ntxt] == undefined) {
                                svg.append('text')
                                    .attr('x', end[0] + (w - TextWidth) / 2 + i * w)
                                    .attr('y', TextHeight / 2)
                                    .text(ntxt)
                                columnTimeIndex[ntxt] = true
                            }
                        }
                    }
                    svg.append('text')
                        .attr('x', end[0] + (w - TextWidth) / 2)
                        .attr('y', TextHeight / 2)
                        .text(ctText)
                        .attr('id', ctText)
                    preTime = currentColumnTime
                    columnTimeIndex[ctText] = true
                    // console.log('time', ctText)
                }
                showTagInfo(config)
                var gtr = d3.select(this).attr('transform')
                var ntr = 'translate(0,' + gtr.split(',')[1].split(')')[0] + ')'
                d3.select(this).attr('transform', ntr)
                $('#column' + currentColumn).append($(this))
                if (currentRow > GraphView.rowNum - 1) {
                    // console.log('scale scale .......')
                    var x = end[0]

                    // var box
                    var scale = GraphView.rowNum / (currentRow + 1) // 相比上一次的scale
                        // if (columnGScaleIndex[currentColumn] == undefined) {
                        //     box = d3.select('#column' + currentColumn).node().getBBox()
                        //     columnGScaleIndex[currentColumn] = box
                        // } else {
                        //     box = columnGScaleIndex[currentColumn]
                        // }
                        // var cx = box.x
                        // var cy = box.y

                    var value = {}
                    if (columnGTransform[currentColumn] == undefined) {
                        var box = d3.select('#column' + currentColumn).node().getBBox() // 不随scale改变
                        //var boundBox = d3.select('#column' + currentColumn).node().getBoundingClientRect() // 视图离左边的位置, 随着scale改变
                        value['boxX'] = +box.x // 父亲元素的位置
                        // value['left'] = +boundBox.left
                        value['width'] = +box.width

                        // g 的放大缩小是子元素相对于父亲元素的坐标下缩小
                        columnGTransform[currentColumn] = value
                    } else {
                        value = columnGTransform[currentColumn]
                    }

                    var leftD = value['left'] - value['boxX'] + value['boxX'] * scale
                    var move = end[0] + w / 2 - (value['boxX'] + value['width'] / 2) * scale 
                    // 中心点位置 减去 缩小的边界距离 剩下就是gde 边界移动的距离

                    d3.select('#column' + currentColumn).transition().duration(1000).attr("transform", "translate(" + move + " " + 0 + ") scale(" + scale + ")");
                    // var gw
                    // if (columnGSizeIndex[currentColumn] == undefined) {
                    //     gw = d3.select('#column' + currentColumn).node().getBBox().width
                    //     columnGSizeIndex[currentColumn] = gw
                    // } else {
                    //     gw = columnGSizeIndex[currentColumn]
                    // }
                    // var scale = GraphView.rowNum / (currentRow + 1) // 相比上一次的scale
                    // var nx = x / scale + (w - (gw * scale)) / 2 / scale

                    // $('#column' + currentColumn).velocity({
                    //     scale: scale,
                    //     translateX: nx + 'px',
                    //     translateY: TextHeight / scale + 'px'
                    // }, 0, 'linear');
                }

            })



    }

    function timeConvert(date) {
        var h = date.getHours()
        if (h < 10) h = '0' + h
        var m = date.getMinutes()
        if (m < 10) m = '0' + m
        var s = date.getSeconds()
        if (s < 10) s = '0' + s
        return h + ':' + m + ':' + s
    }

    function transition() {

        g.transition()
            .duration(1000)
            .attr('visibility', 'visible')
            .attrTween("transform", translateAlong(path.node()))

    }
    // Returns an attrTween for translating along the specified path element.
    function translateAlong(path) {
        var l = path.getTotalLength();
        return function(d, i, a) {
            return function(t) {
                var p = path.getPointAtLength(t * l);
                return "translate(" + p.x + "," + p.y + ")";
            }
        }
    }

    function showTagInfo(config) {
        var time = config.time,
            amount = config.amount,
            total_amount = config.total_amount
        document.getElementById("timeSpan").innerHTML = time
        document.getElementById("bitSpan").innerHTML = Math.round(amount * 1e8) / 1e8;
        document.getElementById("amountSpan").innerHTML = parseInt(10000 * total_amount) / 10000;
    }



    function drawLayout(graph) {

        g.selectAll(".mainLine")
            .data(graph.links)
            .enter()
            .append("line")
            .attr("class", "mainLine")
            .attr('x1', function(d) {
                return d.source.x
            })
            .attr('y1', function(d) {
                return d.source.y
            })
            .attr('x2', function(d) {
                return d.target.x
            })
            .attr('y2', function(d) {
                return d.target.y
            })
            .style("opacity", 0.5)
            .style("stroke", "grey")
            .style("stroke-width", 1)

        var ng = g.selectAll(".mainCircle")
            .data(graph.nodes)
            .enter()
            .append('g')

        ng.append('title')
            .text(function(d) {
                return Math.floor(10000 * d.value * 1e-8) / 10000
            })



        ng.append("circle")
            .attr("class", "mainCircle")
            .attr("r", function(d, i) {
                return d.size
            })
            .attr('cx', function(d) {
                return d.x
            })
            .attr('cy', function(d) {
                return d.y
            })
            .style("fill", function(d, i) {
                if (d.state == "tx") {
                    return "#aaaaaa";
                } else if (d.state == "input_addr") {
                    return "#fda26b"; // 输入
                } else {
                    return "#b3d465"; //输出
                }
            })
            .style("opacity", 0.8)
            .style("stroke-width", "1")
            .style("stroke", 'black')
            .on("click", function(d) {
                g.selectAll(".mainCircle")
                    .style("opacity", function(q) {
                        if (q.tx_id == d.tx_id) {
                            return 1;
                        } else {
                            return 0.8;
                        }
                    })
                    // document.getElementById("shootGroup").innerHTML += "<div class=classGroup id=shootGroup" + d.tx_id + ">ID:" + d.tx_id + "</div>"
                    // var small = new drawTx(alltx[d.tx_id], "shootGroup" + d.tx_id)
            })


    }
}
