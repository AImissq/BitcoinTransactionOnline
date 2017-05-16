var drawMainView = function() {
        var wsUri = "ws://ws.blockchain.info/inv";
        //wss://bitcoin.toshi.io
        //wss://bitcoin.toshi.io
        var self = this;
        self.alltx = []
        self.nodes = []
        self.edges = []
        self.rangeTime;
        self.mintime;
        self.nodenum = [] //存放当前每个交易所包含的点数
        self.edgenum = [] //存放每个交易所包含的边数
        self.tx_num = 0 //统计从开始时间累积的交易次数
        self.total_amount = 0 //统计从开始时间累积的交易额
        self.width = document.getElementById("content").clientWidth
        self.height = document.getElementById("content").clientHeight
        self.nodeId = 0 //对点进行编号
        self.edgeId = 0 //对边进行编号
        self.vis = d3.select("#content").append("svg")
            .attr("width", self.width)
            .attr("height", self.height);
        self.drawFigure; //定义时间轴
        self.forceLayout = d3.layout.force() //定义力学图
        self.dataset = []
        self.startTime = 0;
        /* for(var i=0;i<80;i++){
           self.dataset[i]=0
         }*/
        //var output;  
        //var width=window.innerWidth||document.documentElement.clientWidth||document.body.clientWidth||0,
        //   height=window.innerHeight||document.documentElement.clientHeight||document.body.clientHeight||0, 
        /*height-=100;
        width-=20;*/

        function init() {
            //output = document.getElementById("output"); 
            startSocket();
            d3.select('#playButton').on('click', function(d) {
                var state = $("#playSpan").attr("class");
                console.log(state)
                if (state == "glyphicon glyphicon-pause") {
                    websocket.close();
                    //console.log("dqwdq")
                    $("#playSpan").attr("class", "glyphicon glyphicon-play");
                } else {
                    startSocket();
                    $("#playSpan").attr("class", "glyphicon glyphicon-pause");
                }
            });

        }

        function startSocket() {
            websocket = new WebSocket(wsUri);
            //console.log("aaa")
            try {
                websocket.onopen = function(evt) { onOpen(evt) };
                websocket.onerror = function(evt) { onError(evt) };
                websocket.onmessage = function(evt) { onMessage(evt) };
                websocket.onclose = function(evt) { onClose(evt) };
            } catch (e) {
                console.log("error")
            }
        }

        function onOpen(evt) {
            doSend('{"op":"unconfirmed_sub"}');
        }

        function onMessage(evt) {
            writeToScreen(evt.data);
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
        //时间戳转化为日期
        function timeConverter(UNIX_timestamp) {
            var time = [];
            var date = new Date(UNIX_timestamp * 1000);
            /*//var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var year = a.getFullYear();
            //var month = months[a.getMonth()];
            var month = a.getMonth()+1;
            var date = a.getDate();
            var hour = a.getHours();
            var min = a.getMinutes();
            var sec = a.getSeconds();
            //var time = year+' '+month+' '+date+' '+hour+':'+min+':'+sec ;
            time[0]=year+'-'+month+'-'+date;
            time[1]=hour+':'+min+':'+sec
            return time;*/

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
        //将比特币的数额映射到具体的值
        /* function CalSize(bitAmount){
           return (2- (1e+10)/((1e+10)+bitAmount))*5
         }*/
        function CalSize(bitAmount) {
            return (2.5 - (1e+8) / ((1e+8) + bitAmount)) * 2
        }

        function do_push(size_block, info, hash, data) {
            // Add a new random shape.
            //计算出点集和边集的初始的数量
            var start_nodes_index = self.nodes.length
            var start_edges_index = self.edges.length
            var limit = $('#slider-range-min').slider("option", "value")
                //console.log(limit)
                //添加点集合边集
                //如果输入的次数大于1则加上表示交易的那个点
            if (data.x.inputs.length > 1) {
                self.nodes.push({
                    x: self.width / 10,
                    y: self.height / 2,
                    hash: hash,
                    relayed_by: data.x.relayed_by,
                    time: data.x.time,
                    tx_index: data.x.tx_index,
                    size: CalSize(size_block * (1e+8)),
                    id: self.nodeId,
                    state: "tx"
                });
            }
            self.nodeId += 1
            for (var i = 0; i < data.x.inputs.length; i++) {
                self.nodes.push({
                    x: self.width / 10,
                    y: self.height / 2,
                    addr: data.x.inputs[i].prev_out.addr,
                    value: data.x.inputs[i].prev_out.value,
                    size: CalSize(data.x.inputs[i].prev_out.value),
                    id: self.nodeId,
                    state: "input_addr"
                });
                self.nodeId += 1
            }

            for (var i = 0; i < data.x.out.length; i++) {
                self.nodes.push({
                    x: self.width / 10,
                    y: self.height / 2,
                    addr: data.x.out[i].addr,
                    value: data.x.out[i].value,
                    size: CalSize(data.x.out[i].value),
                    id: self.nodeId,
                    state: "output_addr"
                });
                self.nodeId += 1
            }
            //计算出点集的结束的数量
            var end_nodes_index = self.nodes.length
            for (var i = start_nodes_index + 1; i < end_nodes_index; i++) {
                self.edges.push({
                    source: start_nodes_index,
                    target: i,
                    id: self.edgeId
                })
                self.edgeId += 1
            }
            //计算出边集的结束的数量
            var end_edges_index = self.edges.length

            self.nodenum.push(end_nodes_index - start_nodes_index)
            self.edgenum.push(end_edges_index - start_edges_index)

            var force = self.forceLayout.nodes(self.nodes)
                .links(self.edges)
                .size([2 * self.width, self.height]);
            force.on("tick", function(e) {
                self.vis.selectAll(".mainCircle")
                    .attr("cx", function(d) {
                        return d.x; })
                    .attr("cy", function(d) {
                        return d.y; });
                self.vis.selectAll(".mainLine")
                    .attr("x1", function(d) {
                        return d.source.x; })
                    .attr("y1", function(d) {
                        return d.source.y; })
                    .attr("x2", function(d) {
                        return d.target.x; })
                    .attr("y2", function(d) {
                        return d.target.y; });
            });

            force.alpha(0.1)
                .gravity(0.02)
                .friction(0.1)
                .charge(-80)
                .start()
            while (self.edgenum.length > limit) {
                for (var i = 0; i < self.nodenum[0]; i++) {
                    self.nodes.shift();
                }
                for (var i = 0; i < self.edgenum[0]; i++) {
                    self.edges.shift();
                }
                self.nodenum.shift()
                self.edgenum.shift()
                self.vis.selectAll(".mainLine")
                    .data(self.edges, function(d) {
                        return d.id;
                    }).exit().remove();
                updateCircle = self.vis.selectAll(".mainCircle")
                    .data(self.nodes, function(d) {
                        return d.id;
                    }).exit()
                updateCircle.attr("stroke-width", 3)
                    .attr("stroke", "red")
                updateCircle.remove();
            }

            self.vis.selectAll(".mainLine")
                .data(self.edges)
                .enter()
                .append("line")
                .attr("class", "mainLine")
                .style("opacity", 0.5)
                .style("stroke", "grey")
                .style("stroke-width", 1);
            self.vis.selectAll(".mainCircle")
                .data(self.nodes)
                .enter()
                .append("circle")
                .attr("class", "mainCircle")
                .attr("r", function(d, i) {
                    return d.size;
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
                    d3.selectAll(".mainCircle")
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
                .call(force.drag); //使得节点能够拖动
            /*.on('mouseover', function(d){
                d3.select(this)
                  .style("fill","black");
                //document.getElementById("info").innerHTML=d.info;
            })
            .on('mouseout', function(d){
                d3.select(this)
                  .style("fill","#1f77b4");
                //nodeSelection.select("text").style({opacity:'0'});
            })*/
        };

        function writeToScreen(message) {
            var data = JSON.parse(message);
            self.alltx.push(data)
            var hash = data.x.hash;
            var amount = 0;
            var amount_data = data.x.out;
            for (var i = 0; i < data.x.out.length; i++) {
                amount += data.x.out[i].value;
            }
            amount *= 1e-8;

            amount_in = 0;
            for (var i = 0; i < data.x.inputs.length; i++) {
                amount_in += data.x.inputs[i].prev_out.value;
            }
            amount_in *= 1e-8;
            var fee = amount_in - amount
            var myip = data.x.relayed_by
            var info = "Amount: " + (Math.round(amount * 1e8) / 1e8) + "BTC<br>Fee: " + fee + "BTC<br>Time: " + timeConverter(data.x.time) + "<br>Relayed by: " + myip + "<br><br>Click to view on blockchain.info";

            var detailInfo = "Amount: " + (Math.round(amount * 1e8) / 1e8) + "BTC<br>Fee: " + fee + "BTC<br>Time: " + timeConverter(data.x.time) + "<br>Relayed by: " + myip;

            document.getElementById("bitSpan").innerHTML = Math.round(amount * 1e8) / 1e8;
            var time = timeConverter(data.x.time)

            //console.log(data)
            ///console.log(data.x.time)
            //console.log(time)
            //console.log(new Date(data.x.time*1000))

            document.getElementById("timeSpan").innerHTML = time
                //[0]+"<p style='padding-left:20px'></p>"+time[1];

            if (self.tx_num == 0) {
                self.startTime = data.x.time;

                var minute = parseInt(data.x.time / 60) * 60

                //console.log(minute)

                //var minute = data.x.time
                self.rangeTime = parseInt(data.x.time / 5) * 5
                    //console.log(minute)
                self.mintime = new Date(minute * 1000)

                console.log(self.mintime)

                self.drawFigure = new drawTimeBar(self.mintime, new Date((minute + 600) * 1000))
            }
            //tip="Amount: "+total_amount+"BTC   tx_num: "+tx_num+"  Time: "+timeConverter(data.x.time)
            //document.querySelector("#tip").innerHTML=tip;

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

            document.getElementById("idSpan").innerHTML = minute + ":" + sec

            document.getElementById("amountSpan").innerHTML = parseInt(10000 * self.total_amount) / 10000;

            if (data.x.time - self.rangeTime > 5) {
                self.rangeTime += 5
            }
            var flag = 0

            if (self.dataset.length > 0) {
                if (self.dataset[self.dataset.length - 1].timeStamp == self.rangeTime) {
                    self.dataset[self.dataset.length - 1].amount += 1;
                    flag = 1;
                }
            }


            if (flag == 0) {
                self.dataset.push({
                    amount: 1,
                    timeStamp: self.rangeTime,
                    time: new Date(self.rangeTime * 1000)
                })
            }
            /*self.dataset.unshift(amount)
            self.dataset.pop()
            */
            console.log('dataset', self.dataset)
            // timeline data
            self.drawFigure.update(self.dataset)

            //console.log(self.dataset)
            do_push(amount, info, hash, data);
        }
        window.onload = function() {

        }
        window.addEventListener("load", init, false);
    }
    /*drawMainView.prototype.updateLimit=function(limit){

    }*/
