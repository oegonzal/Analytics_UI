var express = require('express');
var router = express.Router();
var HashMap = require('hashmap');
var fs = require('fs')
const cassandra = require('cassandra-driver');
router.post('/tierApplicationInfo', getApplicationTierInfo);

var conf = require('../../../conf');
const authProvider = new cassandra.auth.PlainTextAuthProvider(conf.auth_id,conf.auth_pass);
const client = new cassandra.Client({authProvider: authProvider ,contactPoints: [conf.client_host], keyspace: conf.client_keyspace});


router.post('/deviceList', function(req, res) {
  //Code to get latest date to fetch data
        var NCDT,NVDT1;
        var query = "select conf_id,conf_val from config_values where conf_id IN ('NCDT','NVDT1')";
        client.execute(query, function(err, result) {
          if(err){
              console.log("Error in deviceList function : " + err);
              var json_for_table=[];
              res.send(json_for_table);
          }
          for(var i=0,len=result.rows.length;i<len;i++){
            if(result.rows[i].conf_id=="NCDT"){
                 NCDT=result.rows[i].conf_val;
            }
            else{
              NVDT1=result.rows[i].conf_val;
            }
          }
  // Code to fetch the list of devices and there score
          if(req.body.device_type=='RT/ST'){
           var query = "select device_id,data_source,score from device_type_score where device_type IN ('RT','ST') and device_infra='"+req.body.infra+"' and updated_date='"+NCDT+"'";
        }
        else if(req.body.device_type=='FW/FX'){
           var query = "select device_id,data_source,score from device_type_score where device_type IN ('FW','FX') and device_infra='"+req.body.infra+"' and updated_date='"+NCDT+"'";
        }
        else if(req.body.device_type='LB'){
           var query = "select device_id,data_source,score from device_type_score where device_type='LB' and device_infra='"+req.body.infra+"' and updated_date='"+NCDT+"'";
        }
        client.execute(query, function(err, result) {
          if(err){
              console.log("Error in deviceList function : " + err);
              var json_for_table=[];
              res.send(json_for_table);
          }
          
          //console.log("Result from Device_type_score  "+ result.rows);
          var map = new HashMap(); 
          for(var i=0,len=result.rows.length;i<len;i++){
            if(!map.has(result.rows[i].device_id)){
                map.set(result.rows[i].device_id,result.rows[i].data_source+";"+result.rows[i].score);
            }
            else{
              var temp=map.get(result.rows[i].device_id);
              temp=temp+","+result.rows[i].data_source+";"+result.rows[i].score;
              map.remove(result.rows[i].device_id);
              map.set(result.rows[i].device_id,temp);
            }
          }
          var json_for_table=[];
          map.forEach(function(value,key){
            //console.log("key :" + key +" value: "+value);
            var values=value.split(",");
            var NC=3,NV=3;
            if(values.length==2){
              if(values[0].substring(0,3)=="NC;"){
            NC=values[0].split(";")[1];
           }
           else{
            NV=values[0].split(";")[1];
           }
           if(values[1].substring(0,3)=="NC;"){
            NC=values[1].split(";")[1];
           }
           else{
            NV=values[1].split(";")[1];
           }
            }
           else{
            if(values[0].substring(0,3)=="NC;"){
            NC=values[0].split(";")[1];
           }
           else{
            NV=values[0].split(";")[1];
           }
           }
           var temp={
            "Device": key,
            "Crticality Score": NC,
            "Volatility Score": NV
           }
           json_for_table.push(temp);
          });
          console.log("List of Devices with score: "+JSON.stringify(json_for_table));
          res.send(json_for_table);
        });

        });
            
        
            
        });

router.post('/CRQ', function(req, res) {
            var dev_arr=req.body.device_ids;
            if(dev_arr.length>0){
                var NCDT,NVDT1;
            var dev_ids="(";
            for(var i=0,len=dev_arr.length;i<len;i++){
              if(i!=len-1){

                    dev_ids+="'"+dev_arr[i].trim().toLowerCase()+"',";
              }
              else{
                  dev_ids+="'"+dev_arr[i].trim().toLowerCase()+"'";
              }
              
            }
            dev_ids+=")";
            
            var query = "select conf_id,conf_val from config_values where conf_id IN ('NCDT','NVDT1')";
        client.execute(query, function(err, result) {
          if(err){
            console.log("In function to get devices from crq" + err);
            var json_for_table=[];
              res.send(json_for_table);
          }
          for(var i=0,len=result.rows.length;i<len;i++){
            if(result.rows[i].conf_id=="NCDT"){
                 NCDT=result.rows[i].conf_val;
            }
            else{
              NVDT1=result.rows[i].conf_val;
            }
          }
        console.log("In function CRQ, searching for updated_date: "+NCDT + "list :"+dev_ids);
            var query = "select device_id,data_source,score from device_score where device_id IN "+dev_ids.toLowerCase() +" and updated_date='"+NCDT+"'";
        client.execute(query, function(err, result) {
          if(err){
              console.log("In function to get devices from crq" + err);
              var json_for_table=[];
              res.send(json_for_table);
          }
         console.log("length of result: " +result.rows.length);
          if(result.rows.length>0){
            var map = new HashMap(); 
          for(var i=0,len=result.rows.length;i<len;i++){
            if(!map.has(result.rows[i].device_id)){
                map.set(result.rows[i].device_id,result.rows[i].data_source+";"+result.rows[i].score);
            }
            else{
              var temp=map.get(result.rows[i].device_id);
              temp=temp+","+result.rows[i].data_source+";"+result.rows[i].score;
              map.remove(result.rows[i].device_id);
              map.set(result.rows[i].device_id,temp);
            }
          }
          var json_for_table=[];
          map.forEach(function(value,key){
            var key=key.split(".")[0];
            var values=value.split(",");
            var NC=3,NV=3;
           if(values.length==2){
              if(values[0].substring(0,3)=="NC;"){
            NC=values[0].split(";")[1];
           }
           else{
            NV=values[0].split(";")[1];
           }
           if(values[1].substring(0,3)=="NC;"){
            NC=values[1].split(";")[1];
           }
           else{
            NV=values[1].split(";")[1];
           }
            }
           else{
            if(values[0].substring(0,3)=="NC;"){
            NC=values[0].split(";")[1];
           }
           else{
            NV=values[0].split(";")[1];
           }
           }
           var temp={
            "Device": key,
            "Crticality Score": NC,
            "Volatility Score": NV
           }
           json_for_table.push(temp);
          });
          console.log("List of Devices with score: "+JSON.stringify(json_for_table));
          res.send(json_for_table);
          }
          else{
              var json_for_table=[];
              res.send(json_for_table);
          }
        });
          });
            }
            else{
              var json_for_table=[];
              res.send(json_for_table);
            }     
        });


router.post('/secondPageData', function(req, res) {
            var graph1_data=[];
            var query = "select conf_id,conf_val from config_values where conf_id IN ('NCDT','NVDT1')";
        client.execute(query, function(err, result) {
          if(err){
            console.log("In function secondPageData : "+ err);
            graph1_data.push({"NC":"3"});
            graph1_data.push({"NV":"3"});
            res.send(graph1_data);
          }
          for(var i=0,len=result.rows.length;i<len;i++){
            if(result.rows[i].conf_id=="NCDT"){
                var NCDT=result.rows[i].conf_val;
            }
            else{
              var NVDT1=result.rows[i].conf_val;
            }
          }
          //console.log(NCDT+"  "+NVDT1);
          var query = "select score from device_score where device_id='"+req.body.device_id+"' and updated_date='"+NCDT+"' and data_source='NC'";
        client.execute(query, function(err, result) {
       if(err){
            console.log(err);
            graph1_data.push({"NC":"3"});
            graph1_data.push({"NV":"3"});
            res.send(graph1_data);
       }
          
       if(result.rows.length>0){
        graph1_data.push({"NC":result.rows[0].score});
       }
        else{
          graph1_data.push({"NC":"3"});
        }
          
          
          var query = "select score from device_score where device_id='"+req.body.device_id+"' and updated_date='"+NVDT1+"' and data_source='NV'";
        client.execute(query, function(err, result) {
          //console.log(result.rows[0].score);
          if(err){
              console.log(err);
              graph1_data.push({"NC":"3"});
              graph1_data.push({"NV":"3"});
              res.send(graph1_data);
       } 
           if(result.rows.length>0){
        graph1_data.push({"NV":result.rows[0].score});
       }
        else{
          graph1_data.push({"NV":"3"});
        }

          res.send(graph1_data);
        });
        });
        });

});
    router.post('/detailedPageGraphData', function(req, res) {
            var mapTable = new HashMap();
            var arrDate=[];
            var detailed_graph_data=[];
            var graph;
            console.log("Reached in Graph data");
 
  var query = "select conf_id,conf_val from config_values where conf_id IN ('NVDT1','NVDT2','NVDT3','NVDT4','NVDT5','NVDT6','NVDT7','NVDT8','NVDT9','NVDT10','NVDT11','NVDT12','NVDT13','NVDT14','NVDT15','NVDT16','NVDT17','NVDT18','NVDT19','NVDT20','NVDT21','NVDT22','NVDT23','NVDT24')";
  client.execute(query, function(err, result) {
          if(err){
            console.log(err);
            res.send({});
          }
          if(len=result.rows.length>0){
            var count=result.rows.length;
            for(var i=0,len=result.rows.length;i<len;i++){
              //console.log("counter "+ i + detailed_graph_data);
              var date_temp=result.rows[i].conf_val;
              var counter_inside=0;
             var query ="select updated_date,score from device_score where device_id='"+req.body.device_id+"' and updated_date='"+result.rows[i].conf_val+"' and data_source='NV'";
             //console.log("query to extract graph data: "+query+" id: "+result.rows[i].conf_id);
              client.execute(query, function(err, result) {
          if(err){
            console.log(err);
            res.send({});
          }
          console.log("length of rows: "+result.rows.length);
         if(result.rows.length>0){
          //console.log("inside " +result.rows[0].updated_date + i );
          counter_inside+=1;
          //var temp='"date":"'+result.rows[0].updated_date+'","score":"'+result.rows[0].score+'"';
          //console.log("count "+ i);
          //console.log(new Date(result.rows[0].updated_date).getTime());
          var tempDate=new Date(result.rows[0].updated_date).getTime();
          //console.log(new Date(tempDate).getDate());
          arrDate.push(tempDate);
          mapTable.set(tempDate,result.rows[0].score.toString());
         
          if(counter_inside==count){
            
          arrDate.sort().reverse();
          for (var i=0;i<arrDate.length;i++){

            //console.log({"date":getDate(arrDate[i]),"score":mapTable.get(arrDate[i])});
            detailed_graph_data.push({"date":getDate(arrDate[i]),"score":mapTable.get(arrDate[i])});

            //getDate(arrDate[i]);
            if(i==arrDate.length-1){
              
              res.send(detailed_graph_data);
            }
          }
            
          }
          
         }
          else{
            counter_inside+=1;
            console.log("counter_inside:"+counter_inside+" count:"+count+"arrdate: "+arrDate.length);
            if(counter_inside==count){
            if(arrDate.length==0){
              res.send([{"date":"01-Jan-16","score":"3"}]);
            }
          arrDate.sort().reverse();
          for (var i=0;i<arrDate.length;i++){

            console.log({"date":getDate(arrDate[i]),"score":mapTable.get(arrDate[i])});
            detailed_graph_data.push({"date":getDate(arrDate[i]),"score":mapTable.get(arrDate[i])});

            //getDate(arrDate[i]);
            if(i==arrDate.length-1){

              res.send(detailed_graph_data);
            }
          }
            
          }
          }
          
        });
              
            }
            
          }
         else{
          res.send({});
         }
        });
       
        });

    function getDate(date){
      var dateToChange=new Date(date);
      var day = dateToChange.getDate();
      var month = dateToChange.getMonth()+1;
      var year = dateToChange.getFullYear();
      //console.log(day +" " + month+ " " +year);
      if(month == 1){
        month="Jan";
      }
      else if(month == 2){
        month="Feb";
      }
      else if(month == 3){
        month="Mar";
      }
      else if(month == 4){
        month="Apr";
      }
      else if(month == 5){
        month="May";
      }
      else if(month == 6){
        month="Jun";
      }
      else if(month == 7){
        month="Jul";
      }
      else if(month == 8){
        month="Aug";
      }
      else if(month == 9){
        month="Sep";
      }
      else if(month == 10){
        month="Oct";
      }
      else if(month == 11){
        month="Nov";
      }
      else if(month == 12){
        month="Dec";
      }
 var out =day+"-"+month+"-"+year.toString().substring(2,4);
 return out.toString();
    }
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr; 
}
router.post('/detailedPageTableData', function(req, res) {
            var query="select conf_val from config_values where conf_id='FLND'";
            client.execute(query, function(err, result) {
          if(err){
            console.log(err);
            res.send([]);
          }
          if(result.rows.length>0){
           
            var query="select lst_src_dst_id from device_camr_topology where flag="+result.rows[0].conf_val+" and dev_type='"+req.body.device_id.substring(0,2).toUpperCase()+"' and dev_id='"+req.body.device_id+"'";
            client.execute(query, function(err, result) {
          if(err){
            console.log(err);
            res.send([]);
          }
          if(result.rows.length>0){
            var output=result.rows[0].lst_src_dst_id;
            var set_apps=[];
            for(var i=0,len=output.length;i<len;i++){
              //console.log(output[i].src_app_id + " dst "+ output[i].dest_app_id);
              set_apps.push(output[i].src_app_id);
              set_apps.push(output[i].dest_app_id);
            }
            var unique_app_ids=set_apps.unique();
            //console.log("inside call" +getTierCount(unique_app_ids,req.body.device_id));
            var apps=unique_app_ids;
            var device=req.body.device_id;
            var RT=0,zero=0,one=0,two=0,counter=0;
            var query="select conf_val from config_values where conf_id='FLCM'";
            client.execute(query, function(err, result) {
          if(err){
            console.log(err);
            res.send([]);
          }
          if(result.rows.length>0){
            for(var i=0,len=apps.length;i<len;i++){
              
              if(apps[i]>0){

              var query="select tier from camr_details where flag="+result.rows[0].conf_val+" and app_id="+apps[i];
              client.execute(query, function(err, result) {
                counter+=1;
                //console.log(err);
                
          if(err){
            console.log(err);
            res.send([]);
          }
          if(result.rows.length>0){
            if(result.rows[0].tier==-1){
              RT+=1;
            }
            else if(result.rows[0].tier==0){
              zero+=1;
            }
            else if(result.rows[0].tier==1){
              one+=1;
            }
            else if(result.rows[0].tier>1){
              two+=1;
            }
            
          }
          
          
          if(counter==len){
            var tier_data = {"Device": req.body.device_id, "Tier-RT":RT.toString(),"Tier-0":zero.toString(),"Tier-1":one.toString(),"Tier-Above 1":two.toString()};
            res.send([tier_data]);
          }
        });
            }
            else{
              counter+=1;

              if(counter==len){
            var tier_data = {"Device": req.body.device_id, "Tier-RT":RT.toString(),"Tier-0":zero.toString(),"Tier-1":one.toString(),"Tier-Above 1":two.toString()};
            res.send([tier_data]);
          }
           }
            }
            
          }
          
        });

          }
          else{
            res.send([]);
          }
        });
          }
          else{
            res.send([]);
          }
        });
        });

function getFileInfo(){
  var mapOfGroups = new Map();
  var allApplicationNames = new Array();
  fs.readFileSync('Grouping.txt').toString().split('\r\n').forEach(function (line)
    {
      var arr = line.split("\t");
      if(arr[0] in mapOfGroups){

        var temp = mapOfGroups[arr[0]];
        temp.push(arr[1]);
        mapOfGroups[arr[0]] = temp;
      }
      else{
        var dataApps = new Array();
        dataApps.push(arr[1])
        mapOfGroups[arr[0]]=dataApps;
      }
    });
  return mapOfGroups;
}

function getAllApplicationsForGroups(){
  var allApplicationNames = new Array();
  fs.readFileSync('Grouping.txt').toString().split('\r\n').forEach( function (line)
    {
      var arr = line.split("\t");
      if(allApplicationNames.indexOf(arr[1])==-1){
        console.log("Inside if statment");
         allApplicationNames.push(arr[1]);
      }
    });
    console.log('-----allApplicationNames: ' + allApplicationNames);
    return allApplicationNames;
}

function getApplicationsToGroupMap(){
  var appMapData = new Map();
  fs.readFileSync('Grouping.txt').toString().split('\r\n').forEach(function(line){
    var arr = line.split("\t");
    appMapData[arr[1]]=arr[0];
  });
  //console.log("RLM License Server for XWin3" in appMapData);
  return appMapData;
}

function getGroupingMap(){
  var mapOfGroups = new Map();
  var allApplicationNames = new Array();
  fs.readFileSync('Grouping.txt').toString().split('\r\n').forEach(function (line)
    {
      var arr = line.split("\t");
      if(arr[0] in mapOfGroups){

        var temp = mapOfGroups[arr[0]];
        temp.push(arr[1]);
        mapOfGroups[arr[0]] = temp;
      }
      else{
        var dataApps = new Array();
        dataApps.push(arr[1])
        mapOfGroups[arr[0]]=dataApps;
      }
    });
 // console.log(mapOfGroups);
  return mapOfGroups;
}

function getApplicationTierInfo(req,res){
  console.log("Reached in get Tier Information");
  var deviceName = req.body.device_id;
  var deviceType = deviceName.substring(0,2).toUpperCase();

  var groupToAppMap = getGroupingMap();
  var appGroupMap = getApplicationsToGroupMap();
  var allApps = getAllApplicationsForGroups();

  const query1 = "select conf_val from  config_values where conf_id ='FLND'";
  client.execute(query1, function(err,result){
    if(err){
      console.log(err);
      res.send({});
    }
    if(result.rows.length>0){
    var conf_val = result.rows[0].conf_val;
    const query2 ="select * from device_camr_topology where dev_type = '"+deviceType+"' and dev_id = '"+deviceName+"' and flag="+conf_val;
    
    console.log("Printing query2: " + query2);

    client.execute(query2, function(err,result){
      if(err){
        console.log(err);
        res.send({});
      }
      if(result.rows.length>0){
    var arr_rows= result.rows[0].lst_src_dst_id;
    var query3 = "select conf_val from  config_values where conf_id ='FLCM'"
    client.execute(query3, function(err,result){
      if(err)
      {
        console.log(err);
        res.send({});
      }
      if(result.rows.length>0){
      var conf_val2 = result.rows[0].conf_val;
      var query_to_be_executed = "select app_name, app_id, tier from camr_details where flag ="+conf_val2+" and app_id in ("
      var count = 0;
      var selected_rows = [];
      for(var i = 0 ; i < arr_rows.length; i++){
        var current =arr_rows[i];

        var src_app_id =current.src_app_id;
        var dest_app_id = current.dest_app_id;
        if(src_app_id != null){
          query_to_be_executed = query_to_be_executed + src_app_id +",";
          count++;
        }
        else if(dest_app_id !=null){
          query_to_be_executed = query_to_be_executed+ dest_app_id +",";
          count++;
        }
      }
        console.log(count);
        var finalQuery = query_to_be_executed.substr(0, query_to_be_executed.length-1)+")";
        client.execute(finalQuery, function(err,result){
          if(err){
            console.log(err);
            res.send({});
          }
          var rtArr = [];
          var tier0Arr = [];
          var tier1Arr = [];
          var tier2AndAbove = [];
          var groupInfoForAllDevices = [];
          var groupInfoForThatDevice = new Map();
          var groupDataForAll = new Map();

          var values = result.rows;

          for(var i = 0 ; i < values.length; i++){
            var curr = values[i];

            if(allApps.indexOf(curr.app_name)>-1){
              var groupName = appGroupMap[curr.app_name];
              if(groupName in groupInfoForThatDevice){
                var appList = groupInfoForThatDevice[groupName];
                if(appList.indexOf(curr.app_name)==-1)
                  appList.push(curr.app_name);
                  groupInfoForThatDevice[groupName] =appList;
              }
              else{
                var appList = new Array();
                appList.push(curr.app_name);
                groupInfoForThatDevice[groupName] =appList;
              }
              var appsInGroup = groupToAppMap[groupName];
              var groupData = {"group": groupName , "applications": appsInGroup}
              //groupInfoForAllDevices.push(groupData);
              groupDataForAll[groupName] = appsInGroup;
            }

            if(curr.tier == -1){
              rtArr.push(curr);
            }
            else if(curr.tier == 0)
            {
              tier0Arr.push(curr);
            }
            else if(curr.tier == 1){
              tier1Arr.push(curr);
            }
            else{
              tier2AndAbove.push(curr);
            }
          }

          var i ;
          for(i in groupDataForAll){
            var groupData = {"group": i, "applications": groupDataForAll[i]};
            groupInfoForAllDevices.push(groupData)
          }

          console.log("groupInfoForAllDevices" + JSON.stringify(groupInfoForAllDevices));
          res.send({
            "Tier-RT": rtArr,
            "Tier-0": tier0Arr,
            "Tier-1": tier1Arr,
            "Tier-2+": tier2AndAbove,
            "GroupingInfo" : groupInfoForAllDevices,
          });
        });
      }
      else{
        res.send({});
      }
    });

}
else{
  res.send({});
}

    });
}
else{
  res.send({});
}

    //
  });
 
};


module.exports = router;