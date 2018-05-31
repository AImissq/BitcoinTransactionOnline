/*
 * @Author: wakouboy
 * @Date:   2017-06-13 18:52:58
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2018-05-31 20:10:43
 */

'use strict';
window.flag = 0
window.standardSpeed = 30
window.speed = 0
window.dist = 100000
window.addTag = 1
window.slowTag = 1

window.output_color = '#005a32'
window.input_color = '#cb181d'
window.tx_color = 'grey'


window.TextWidth = calculatePixelSize('00:00:00').width
window.TextHeight = calculatePixelSize('00:00:00').height * 2
window.preTime = 0 // 有的时间戳没有，需要额外加上
window.columnTimeIndex = {}
window.columnGSizeIndex = {}
window.columnGScaleIndex = {}
window.columnGTransform = {}
window.TimelineView = new Timeline()
window.GraphView = new GraphView()
window.DataCenter = new DataCenter()
window.AmountView = new Amount()
window.NumberView = new NumberVV()

window.AddressDis = [0, 0, 0, 0] // 1-1, 1->m, m->1, m->m
window.AmountDis = [0, 0, 0, 0] // <1, 1~10, 10~100, >100
