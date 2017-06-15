/*
 * @Author: wakouboy
 * @Date:   2017-06-13 18:51:00
 * @Last Modified by:   wakouboy
 * @Last Modified time: 2017-06-16 02:26:20
 */

'use strict';
var DataCenter = function() {
    var self = this
    self.alltx = []
    self.tx_num = 0 //统计从开始时间累积的交易次数
    self.total_amount = 0 //统计从开始时间累积的交易额
}

DataCenter.prototype.init = function() {
    var self = this
    self.wsUri = "ws://ws.blockchain.info/inv"
    self.config()
    self.startSocket()
}

DataCenter.prototype.sendMessage = function(data) {
    GraphView.getMessage(data)
}

DataCenter.prototype.config = function() {
    $(function() {
        var slider = $("#slider-range-min").slider({
            range: "min",
            value: 50,
            min: 1,
            max: 200,
            start: function(event, ui) {
                //console.log(ui);
                $(ui.handle).find('.ui-slider-tooltip').show();
            },
            stop: function(event, ui) {
                $(ui.handle).find('.ui-slider-tooltip').hide();
            },
            slide: function(event, ui) {
                $(ui.handle).find('.ui-slider-tooltip').text(ui.value);
                //console.log(ui.value)
            },
            create: function(event, ui) {
                var tooltip = $('<div class="ui-slider-tooltip" />');
                $(event.target).find('.ui-slider-handle').append(tooltip);
            },
            change: function(event, ui) {}
        });

    });


}

DataCenter.prototype.startSocket = function() {
    var self = this
    var websocket = new WebSocket(self.wsUri)
    self.websocket = websocket
    try {
        websocket.onopen = function(evt) { onOpen(evt) };
        websocket.onerror = function(evt) { onError(evt) };
        websocket.onmessage = function(evt) { onMessage(evt) };
        websocket.onclose = function(evt) { onClose(evt) };
    } catch (e) {
        console.log("error")
    }


    function onOpen(evt) {
        doSend('{"op":"unconfirmed_sub"}');
    }

    function onMessage(evt) {
        if (self.tx_num == 0) {
            self.startTime = new Date()
        }
        self.parseData(evt.data)
    }

    function onError(evt) {
        console.log("ERROR")
            //writeToScreen('<span style="color: red;">ERROR:</span> ' + evt.data); 
    }

    function doSend(message) {
        websocket.send(message);
    }


    function hex_dec(hex) {
        return parseInt(hex, 16);
    }

    function onClose(evt) {
        console.log("DISCONNECT")
            //writeToScreen('<span style="color: red;">DISCONNECT:</span> ' + evt.data); 
    }
}

DataCenter.prototype.parseData = function(message) {
    var self = this
    var data = JSON.parse(message);
    var hash = data.x.hash;
    var amount = 0;
    var amount_data = data.x.out;
    for (var i = 0; i < data.x.out.length; i++) {
        amount += data.x.out[i].value
    }
    amount *= 1e-8;

    var amount_in = 0;
    for (var i = 0; i < data.x.inputs.length; i++) {
        amount_in += data.x.inputs[i].prev_out.value;
    }
    amount_in *= 1e-8;
    var fee = amount_in - amount
    var myip = data.x.relayed_by
    var info = "Amount: " + (Math.round(amount * 1e8) / 1e8) + "BTC<br>Fee: " + fee + "BTC<br>Time: " + self.timeConverter(data.x.time) + "<br>Relayed by: " + myip + "<br><br>Click to view on blockchain.info";
    var detailInfo = "Amount: " + (Math.round(amount * 1e8) / 1e8) + "BTC<br>Fee: " + fee + "BTC<br>Time: " + self.timeConverter(data.x.time) + "<br>Relayed by: " + myip;
    document.getElementById("bitSpan").innerHTML = Math.round(amount * 1e8) / 1e8;
    var time = self.timeConverter(data.x.time)
    document.getElementById("timeSpan").innerHTML = time

    if (self.tx_num == 0) {
        self.startTime = data.x.time;
    }
    self.tx_num += 1
    self.total_amount += amount

    var date = new Date((data.x.time - self.startTime) * 1000);
    var hour = date.getHours();
    var minute = date.getMinutes();
    var sec = date.getSeconds();

    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (sec >= 0 && sec <= 9) {
        sec = "0" + sec;
    }
    data.amount = amount

    document.getElementById("idSpan").innerHTML = minute + ":" + sec
    document.getElementById("amountSpan").innerHTML = parseInt(10000 * self.total_amount) / 10000;
    // try {
    //     DataCenter.sendMessage({ 'message': Config['newTrans'], 'data': data})
    // } catch (e) {
    //     console.log("error")
    // }
    
    var t = dist / speed
    DataCenter.sendMessage({ 'message': Config['newTrans'], 'data': data })
    
    if (self.tx_num > 20) {
        if (flag == 0) {
            console.log('canvas move')
            $('#canvas').velocity({ translateX: dist + 'px' }, t * 1000, 'linear')
        }
        flag = 1
            // GraphView.svgMove()
            // self.websocket.close()
    }


    if (self.tx_num > 10000) {
        self.websocket.close()
    }


}

DataCenter.prototype.timeConverter = function(UNIX_timestamp) {
    var time = [];
    var date = new Date(UNIX_timestamp * 1000);
    var seperator1 = "-";
    var seperator2 = ":";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var sec = date.getSeconds();

    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    if (hour >= 0 && hour <= 9) {
        hour = "0" + hour;
    }
    if (minute >= 0 && minute <= 9) {
        minute = "0" + minute;
    }
    if (sec >= 0 && sec <= 9) {
        sec = "0" + sec;
    }

    var currentdate = year + seperator1 + month + seperator1 + strDate + " " + hour + seperator2 + minute + seperator2 + sec;
    return currentdate;
}

window.DataCenter = new DataCenter()
