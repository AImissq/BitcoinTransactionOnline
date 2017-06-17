/*
 * @Author: wakouboy
 * @Date:   2017-06-15 14:59:18
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-17 20:15:44
 */

importScripts('../lib/d3v4.js')
onmessage = function(event) {

    var graph = event.data.graph
    var w = event.data.w,
        h = event.data.h
    // var force = d3.layout.force()

    // force.nodes(graph.nodes)
    //      .links(graph.links)
    //      .size()
    
    var simulation = d3.forceSimulation(graph.nodes)
        .force("link", d3.forceLink(graph.links).id(function(d) {
            return d.id
        }))
        .force("charge", d3.forceManyBody().strength(-10))
        .force("center", d3.forceCenter(w / 2, h / 2))

    // for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
    //     simulation.tick();
    // }
    var n = 2
    for (var i = 0 ; i < n; ++i) {
        simulation.tick();
    }

    postMessage({nodes: graph.nodes, links: graph.links });

    // simulation
    //     .nodes(graph.nodes)
    //     .on("tick", function() {
    //         if (simulation.alpha() < 0.3) {
    //             postMessage(graph);
    //             return
    //         }
    //     })

    // simulation.force("link")
    //     .links(graph.links)


}
