/*
* @Author: wakouboy
* @Date:   2017-06-15 14:51:51
* @Last Modified by:   wakouboy
* @Last Modified time: 2017-06-15 14:51:53
*/

'use strict';
onmessage = function (event) {
    //从1加到num
    var num = event.data;
    var result = 0;
    for (var i = 1; i <= num; i++) {
        result += i;
    }
    postMessage(result);
}