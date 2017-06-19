/*
 * @Author: wakouboy
 * @Date:   2017-06-13 18:52:58
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-19 22:31:46
 */

'use strict';
window.flag = 0
window.standardSpeed = 30
window.speed = 0
window.dist = 1000000
window.addTag = 1
window.slowTag = 1


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
