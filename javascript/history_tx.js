var updateView=function(forceLayout,width,height,tx_num,loc,nodes,edges,vis,alltx){
  var force = forceLayout
      .nodes(nodes)
      .links(edges)
      .size([width, height]);

  var ggName="gg"+(tx_num-1)

  var xLoc=width*loc[(tx_num-1)%84].x
  var yLoc=height*loc[(tx_num-1)%84].y
  
  //var xLoc=self.width/2
  //var yLoc=self.height/2
  //gWidth=
  //gHeight=
  var gg=vis.append("g")
         .attr("class",ggName)
         .attr("transform", "translate("+ xLoc +"," + yLoc + ")")


  gg.selectAll(".mainLine")
            .data(edges)
            .enter()
            .append("line")
            .attr("class","mainLine")
            .style("stroke","grey")
            .style("stroke-width",1);

  var nodeCircle=gg.selectAll(".mainCircle")
                .data(nodes)
                .enter()
                .append("circle")
                .attr("class","mainCircle")
                .attr("r",function(d,i){
                  return d.size;
                })
                .style("fill",function(d,i){
                  if(d.state=="tx"){
                    return "#aaaaaa";
                  }
                  else if(d.state=="input_addr"){
                    return "#fda26b";
                  }
                  else{
                    return "#b3d465";
                  }
                })
                .attr("cx",0)
                .attr("cy",0)
                .style("opacity",0.8)
                .style("stroke-width","1")
                .style("stroke",'black')
                .on("click",function(d){
                  d3.selectAll(".mainCircle")
                    .style("opacity",function(q){
                      if(q.tx_id==d.tx_id){
                        return 1;
                      }
                      else{
                        return 0.8;
                      }
                    })
                  document.getElementById("shootGroup").innerHTML+="<div class=classGroup id=shootGroup"+d.tx_id+">ID:"+d.tx_id+"</div>" 
                  var small=new drawTx(alltx[d.tx_id],"shootGroup"+d.tx_id) 
                })
                .call(force.drag);  //使得节点能够拖动
  nodeCircle.append("title")
            .text(function(d){
              if(d.state!="tx"){
                return d.addr;
              }
              else{
                return d.value*1e-8
              }
            });
  force.on("tick", function(e) {
    var xMin=10000
    var xMax=-10000
    var yMin=10000
    var yMax=-10000
    var xMid
    var yMid
    vis.select("."+ggName).selectAll(".mainCircle")
        .attr("cx",function(d){
          xMin=Math.min(xMin,d.x)
          xMax=Math.max(xMax,d.x)
          return d3.select(this).attr("cx")
        })

    vis.select("."+ggName).selectAll(".mainCircle")
        .attr("cy",function(d){
          yMin=Math.min(yMin,d.y)
          yMax=Math.max(yMax,d.y)
          //console.log('cx', d3.select(this).attr('cx'));
          //console.log('cy', d3.select(this).attr('cy'));
          return d3.select(this).attr("cy")
        })
        //console.log('xmin', xMin);
        //console.log('xMax', xMax);
        //console.log('yMin', yMin);
        //console.log('yMax', yMax);
    xMid=(xMin+xMax)/2
    yMid=(yMin+yMax)/2
    //console.log(xMid)
    //console.log(yMid)

    vis.select("."+ggName).selectAll(".mainCircle")
        .attr("cx",function(d){ return d.x - xMid; })
        .attr("cy",function(d){ return d.y - yMid; });
    vis.select("."+ggName).selectAll(".mainLine")
        .attr("x1",function(d){ return d.source.x - xMid; })
        .attr("y1",function(d){ return d.source.y - yMid; })
        .attr("x2",function(d){ return d.target.x - xMid; })
        .attr("y2",function(d){ return d.target.y - yMid; });  
  });

  force.alpha(1)
       .gravity(0)
       .friction(0.3)
       .charge(-30)
       .start()
}

var drawMainViewHistory=function(){
  //var wsUri = "ws://ws.blockchain.info/inv"; 
  //wss://bitcoin.toshi.io
  var self=this;
  self.alltx=[]
  self.nodes=[]
  self.edges=[]
  self.timeMin=20
  self.timeCal=0
  self.nodenum=[]//存放当前每个交易所包含的点数
  self.edgenum=[]//存放每个交易所包含的边数
  self.tx_num=0//统计从开始时间累积的交易次数
  self.total_amount=0//统计从开始时间累积的交易额
  self.width=document.getElementById("content").clientWidth
  self.height=document.getElementById("content").clientHeight
  self.nodeId=0//对点进行编号
  self.edgeId=0//对边进行编号
  self.vis = d3.select("#content").append("svg")
      .attr("width", self.width)
      .attr("height", self.height);
  self.drawFigure=new drawTimeBar()//定义时间轴
  self.forceLayout = d3.layout.force()//定义力学图
  self.dataset=[];
  self.ggName="gg0"
 /* for(var i=0;i<80;i++){
    self.dataset[i]=0
  }*/
  self.loc=[]

  for(var i=14;i>1;i--){
    for(var j=1;j<7;j++){
      self.loc.push({x:i/15,y:j/7})
    }
  }
  //时间戳转化为日期
  function timeConverter(UNIX_timestamp){
   var time=[];
   var a = new Date(UNIX_timestamp*1000);
   //var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
       var year = a.getFullYear();
       var month = a.getMonth();
       var date = a.getDate();
       var hour = a.getHours();
       var min = a.getMinutes();
       var sec = a.getSeconds();
       //var time = year+' '+month+' '+date+' '+hour+':'+min+':'+sec ;
       time[0]=year+' '+month+' '+date;
       time[1]=hour+':'+min+':'+sec
       return time;
  }
  //将比特币的数额映射到具体的值
  function CalSize(bitAmount){
    return (2- (1e+8)/((1e+8)+bitAmount))*2.5
  }

  
  function do_push(size_block,data){
    // Add a new random shape.
    //计算出点集和边集的初始的数量
    //var start_nodes_index=self.nodes.length
    //var start_edges_index=self.edges.length
    var limit = $('#slider-range-min').slider("option", "value")
    var myinput=[]
    var myoutput=[]
    self.nodes=[]
    self.edges=[]
    //添加点集合边集
    //如果输入的次数大于1则加上表示交易的那个点
    if(data.inputs.length>1){
      self.nodes.push({
        x: 0,
        y: 0,
        hash: data.hash,
        relayed_by: data.relayed_by,
        time: data.time,
        tx_index: data.tx_index,
        size: CalSize(size_block*(1e+8)),
        value: size_block,
        id: self.nodeId,
        tx_id: self.tx_num-1,
        state: "tx"
      });
    }
    self.nodeId+=1

    for(var i=0;i<data.inputs.length;i++){
      self.nodes.push({
        x: 0,
        y: 0,
        addr: data.inputs[i].prev_out.addr,
        value: data.inputs[i].prev_out.value,
        size: CalSize(data.inputs[i].prev_out.value),
        id: self.nodeId,
        tx_id: self.tx_num-1,
        state: "input_addr"
      });
      self.nodeId+=1

      myinput.push({
        addr: data.inputs[i].prev_out.addr,
        value: data.inputs[i].prev_out.value,
        size: CalSize(data.inputs[i].prev_out.value)
      })
    }

    for(var i=0;i<data.out.length;i++){
      self.nodes.push({
        x: 0,
        y: 0,
        addr: data.out[i].addr,
        value: data.out[i].value,
        size: CalSize(data.out[i].value),
        id: self.nodeId,
        tx_id: self.tx_num-1,
        state: "output_addr"
      });
      self.nodeId+=1

      myoutput.push({
        addr: data.out[i].addr,
        value: data.out[i].value,
        size: CalSize(data.out[i].value)
      })
    }
    
    self.alltx.push({
      input: myinput,
      output: myoutput,
      size: CalSize(size_block*(1e+8)),
      amount: size_block

    })

    for(var i=1;i<self.nodes.length;i++){
      self.edges.push({
        source: 0,
        target: i,
        tx_id: self.tx_num-1,
        id: self.edgeId
      })
      self.edgeId+=1
    } 
    if(self.tx_num%84==0){
      for(var i=self.tx_num-84;i<self.tx_num;i++){
        d3.select(".gg"+i).remove()
      }
    } 
    var aaa=new updateView(self.forceLayout,self.width,self.height,self.tx_num,self.loc,self.nodes,self.edges,self.vis,self.alltx)
    
  };
  function writeToScreen(data) { 
      //var data = JSON.parse();
      //console.log(data)
      //console.log(data['inputs'][0]) 
      var amount_in=0;
      var amount=0
      var sendAddr=[]
      var receiveAddr=[]
      for(var i=0;i<data.inputs.length;i++){
        amount_in+=data.inputs[i].prev_out.value
        sendAddr.push(data.inputs[i].prev_out.addr)
      }
      //console.log(amount_in)
      amount_in*=1e-8

      for(var i=0;i<data.out.length;i++){
        amount+=data.out[i].value
        receiveAddr.push(data.out[i].addr)
      }
      amount*=1e-8
      //console.log(amount)
      var fee=amount
      document.getElementById("bitSpan").innerHTML=Math.round(amount*1e8)/1e8;
      var time=timeConverter(data.time)

      var timemin=20+parseInt(self.timeCal/60)

      var de=String(parseInt(self.timeCal%60))

      if(de.length==1){
        de=0+de;
      }
      //console.log(timemin)
      //console.log(de)
      document.getElementById("timeSpan").innerHTML="2016/3/11"+"<p>"+"18:"+timemin+":"+de;
      self.timeCal+=1
      //document.getElementById("timeHourSpan")
     /* var send="Send<p>"
      var receive="receive<p>"
      for(var i=0;i<sendAddr.length;i++)
      {
        send+=sendAddr[i].substring(0,15)+"...<p>"
      }
      for(var i=0;i<receiveAddr.length;i++)
      {
        send+=receiveAddr[i].substring(0,15)+"...<>"
      }
      document.getElementById("addrSpan").innerHTML=sendAddr[0].substring(0,15)+"..."*/
      self.tx_num+=1
      self.total_amount+=amount
      document.getElementById("idSpan").innerHTML=self.tx_num
      document.getElementById("amountSpan").innerHTML=Math.round(self.total_amount*1e8)/1e8;
      
      /*self.dataset.push(amount)
      
      self.dataset.shift()*/
      self.dataset.push({
        amount:Math.log(amount+1),
        time:new Date(2016,3,11,18,parseInt(timemin),parseInt(de))
      })
      console.log(self.dataset)
      self.drawFigure.update(self.dataset)
      do_push(amount,data)
  }  

  function init(){ 
    var data
    d3.json("406770.json",function(error,data){
      if(error){
        console.error(error);
      }

    /*  data['blocks'][0]['tx'].sort(function(a,b){
      　　return parseFloat(b.time)- parseFloat(a.time);
      }); */  

      //console.log(data);
      var txLen=data['blocks'][0]['tx'].length
      var tx=data['blocks'][0]['tx']
      var num=1;
      //console.log(data['blocks'][0]['tx'])
      //console.log(txLen)
      var timeControl;
      var timeSpeed=1000
      d3.select('#forwardButton').on('click',function(d){
        timeSpeed-=500
        timeSpeed=Math.max(timeSpeed,100)
        //console.log(timeSpeed)
      })

      d3.select('#backwardButton').on('click',function(d){
        timeSpeed+=500
        timeSpeed=Math.min(timeSpeed,10000)
        //console.log(timeSpeed)
      })

      timeControl =setInterval(function(){
        //console.log(timeSpeed)
        writeToScreen(tx[num%txLen])
        //console.log(tx[num%txLen]['time'])
        num=num+1
      },timeSpeed);

      d3.select('#playButton').on('click',function(d){
        var state=$("#playSpan").attr("class");
        
        if(state=="glyphicon glyphicon-play")
        {
          timeControl =setInterval(function(){
            if(num!=0){
              writeToScreen(tx[num%txLen])
            }
            num=num+1
          },timeSpeed);
          $("#playSpan").attr("class","glyphicon glyphicon-pause");
        }
        else
        {
          //console.log("pause")
          timeControl = window.clearInterval(timeControl);
          $("#playSpan").attr("class","glyphicon glyphicon-play");
        }   
      }); 
    })
  } 

  window.onload=function(){

  }
  window.addEventListener("load", init, false);  
}
/*drawMainView.prototype.updateLimit=function(limit){

}*/