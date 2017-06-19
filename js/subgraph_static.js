/*
 * @Author: wakouboy
 * @Date:   2017-06-13 20:33:17
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-19 09:22:01
 */

'use strict';

var Subgraph = function(svg, index, graph, w, h, width, height, rowNum, config, end, ctText) {

    var transform_x = 100,
        transform_y = 100
        // console.log(graph)
        // console.log(d3.select)
    index += 70 // 从靠近头部处开始移动

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

    var work = new Worker("js/callayout.js");
    //发送消息
    work.postMessage({ graph, w, h });
    // 监听消息
    work.onmessage = function(event) {
        graph = event.data
            // console.log(graph)
        var start = new Date()
        drawLayout(graph)

        g.transition().duration(3000).attr('visibility', 'visible').attr('transform', 'translate(' + end[0] + ',' + (end[1] + 10) + ')')
            .on('end', function() {
                showTagInfo(config)
                if (end[1] == 0) {
                    svg.append('text')
                        .attr('x', end[0] + 15)
                        .attr('y', end[1] + 20)
                        .text(ctText)
                }

            })



    };

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
