/*
 * @Author: wakouboy
 * @Date:   2017-06-13 20:33:17
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-13 23:33:23
 */

'use strict';

var Subgraph = function(svg, index, graph, w, h, width, height, rowNum) {

    var transform_x = 100,
        transform_y = 100
    console.log(graph)
    var start = [- w * 2, height / 2 - h / 2]
    var points = []
    var end = calPosition(width, height, rowNum, index, w, h)
    points.push(start)
    points.push([ width / 3, height/2 - h/2])
    points.push(end)

    var path = svg.append("path")
        .data([points])
        .attr("d", d3.svg.line())
        .style('fill', 'none')
        .style('stroke','none')
        .attr('class','movepath')


    var g = svg.append('g')
        .attr('transform', 'translate(' + points[0] + ')')
        .attr('visibility','hidden')


    var simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function(d) {
            return d.id
        }))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(w / 2, h / 2))

    simulation
        .nodes(graph.nodes)
        .on("tick", function() {
            if (simulation.alpha() < 0.5) {
                drawLayout()
                transition()
            }
        })

    simulation.force("link")
        .links(graph.links)


    function transition() {

        g.transition()
            .duration(10000)
            .attr('visibility','visible')
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

    function calPosition(width, height, rowNum, index, w, h) {
        index += 1
        var r = index % rowNum
        var c = Math.floor(index / rowNum)


        if (c * rowNum != index) c += 1
        else {
            r = rowNum // 整除
        }
        var left = width - c * w
        var top = (r-1) * h
        // console.log(index, r, c, left, top)
        return [left, top]

    }

    function drawLayout() {

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
            .style("stroke-width", 1);

        g.selectAll(".mainCircle")
            .data(graph.nodes)
            .enter()
            .append("circle")
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
                    return "#fda26b";
                } else {
                    return "#b3d465";
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
                document.getElementById("shootGroup").innerHTML += "<div class=classGroup id=shootGroup" + d.tx_id + ">ID:" + d.tx_id + "</div>"
                var small = new drawTx(alltx[d.tx_id], "shootGroup" + d.tx_id)
            })

    }
}