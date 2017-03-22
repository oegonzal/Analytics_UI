var express = require('express');
var router = express.Router();
var sql = require('mssql');
const cassandra = require('cassandra-driver');
var conf = require('../../../conf');
var HashMap = require('hashmap');
const authProvider = new cassandra.auth.PlainTextAuthProvider(conf.auth_id,conf.auth_pass);
const client = new cassandra.Client({authProvider: authProvider ,contactPoints: [conf.client_host], keyspace: conf.client_keyspace});
var counter_main=0,count_min=0;
router.post('/getCrqScore',fetchScore);
var schedule = require('node-schedule');
global.pageZeroData=[];

var j = schedule.scheduleJob('*/3 * * * *', function(){
  console.log('Cron job started');
  getCrqScore();
});
function fetchScore(req,res){
	
		res.send(pageZeroData);
	
}
//getCrqScore();
var list_of_crq=[];
function getCrqScore(){
        console.log("Reached index.js for MSSQL");
        list_of_crq=[];
        var map = new HashMap(); 
        /*Config properties for config.js*/
        // Query 
        var NCDT,NVDT1;
        var config = {
            user: conf.mssql_temp,
            password: conf.mssql_temp_pass,
            server: 'DW730VIPERPS04', // You can use 'localhost\\instance' to connect to named instance 
            database: 'ARSystem',
            domain:'VISA',
 			connectionTimeout :'120000',
 			requestTimeout :'120000',
            options: {
            encrypt: false,
            trustedConnection: true // Use this if you're on Windows Azure 
            }
        }
        
       var conn = new sql.Connection(config);
       var req = new sql.Request(conn);

    
       conn.connect(function(err){
            if(err){
                console.log(err);
                return;
            }
            console.log("Cannected");
            var d = new Date();
 			d.setDate(d.getDate()-1);
 			d=d.toLocaleDateString().trim()+" "+d.toLocaleTimeString().split(' ')[0];
 			console.log("date: "+d);
            var query ="SELECT CHG_INFRASTRUCTURE_CHANGE.Infrastructure_Change_ID,CHG_INFRASTRUCTURE_CHANGE.Description,CHG_INFRASTRUCTURE_CHANGE.Categorization_Tier_1,CHG_CHANGE_ENVIRONMENT.CHANGE_ENVIRONMENT,CHG_RISK_LEVEL.RISK_LEVEL,CHG_CHANGE_REQUEST_STATUS.CHANGE_REQUEST_STATUS,CHG_ApplicationCIList.CHGApplicationCIList,CHG_HardwareCI_List.CHGHardwareCIList,[ARSystem].[dbo].fn_adjusted_date(CHG_INFRASTRUCTURE_CHANGE.Scheduled_Start_Date) as Start_Date_Time,[ARSystem].[dbo].fn_adjusted_date(CHG_INFRASTRUCTURE_CHANGE.Scheduled_End_Date) as End_Date_Time, CHG_INFRASTRUCTURE_CHANGE.IPL FROM ( SELECT DISTINCT FIELD_ENUM_VALUES.ENUMID,FIELD_ENUM_VALUES.VALUE AS CHANGE_REQUEST_STATUS FROM [ARSystem].[dbo].[FIELD_ENUM_VALUES] inner join [ARSystem].[dbo].[arschema] on arschema.schemaid = field_enum_values.schemaid and name = 'CHG:Infrastructure Change' inner join [ARSystem].[dbo].[field] on field.fieldid = field_enum_values.fieldid and field.fieldname = 'Change Request Status' and field.schemaid = field_enum_values.schemaid)  CHG_CHANGE_REQUEST_STATUS RIGHT OUTER JOIN ( SELECT * FROM   [ARSystem].[dbo].[CHG_INFRASTRUCTURE_CHANGE] WHERE  CHG_INFRASTRUCTURE_CHANGE.Company IN (SELECT DISTINCT COMPANY FROM   [ARSystem].[dbo].[CTM_PEOPLE_PERMISSION_GROUPS]	 WHERE  REMEDY_LOGIN_ID = 'hargulat' AND COMPANY IS NOT NULL UNION SELECT DISTINCT COMPANY FROM   [ARSystem].[dbo].[CTM_PEOPLE_ORGANIZATION] WHERE  (SELECT 1 FROM   [ARSystem].[dbo].[CTM_PEOPLE_PERMISSION_GROUPS] WHERE  REMEDY_LOGIN_ID = 'hargulat' AND PERMISSION_GROUP = 'Unrestricted Access') = 1	AND COMPANY IS NOT NULL))  CHG_INFRASTRUCTURE_CHANGE ON (CHG_CHANGE_REQUEST_STATUS.ENUMID=CHG_INFRASTRUCTURE_CHANGE.Change_Request_Status) LEFT OUTER JOIN ( SELECT DISTINCT FIELD_ENUM_VALUES.ENUMID,FIELD_ENUM_VALUES.VALUE AS CHANGE_ENVIRONMENT FROM [ARSystem].[dbo].[FIELD_ENUM_VALUES] inner join [ARSystem].[dbo].[arschema] on arschema.schemaid = field_enum_values.schemaid and name = 'CHG:Infrastructure Change' inner join [ARSystem].[dbo].[field] on field.fieldid = field_enum_values.fieldid and field.fieldname = 'Environment' and field.schemaid = field_enum_values.schemaid)  CHG_CHANGE_ENVIRONMENT ON (CHG_INFRASTRUCTURE_CHANGE.Environment=CHG_CHANGE_ENVIRONMENT.ENUMID) LEFT OUTER JOIN ( SELECT DISTINCT FIELD_ENUM_VALUES.ENUMID,FIELD_ENUM_VALUES.VALUE AS RISK_LEVEL FROM [ARSystem].[dbo].[FIELD_ENUM_VALUES] inner join [ARSystem].[dbo].[arschema] on arschema.schemaid = field_enum_values.schemaid and name = 'CHG:Infrastructure Change' inner join [ARSystem].[dbo].[field] on field.fieldid = field_enum_values.fieldid and field.fieldname = 'Risk Level' and field.schemaid = field_enum_values.schemaid)  CHG_RISK_LEVEL ON (CHG_RISK_LEVEL.ENUMID=CHG_INFRASTRUCTURE_CHANGE.Risk_Level) LEFT OUTER JOIN ( Select REQUEST_ID02, CHGHardwareCIList = STUFF((	Select distinct '; ' + Request_Description01 From [ARSystem].[dbo].[CHG_Associations] chg0	WHERE chg0.REQUEST_ID02 = chg1.REQUEST_ID02 and (((((((((((((((Lookup_Keyword = 'BMC_HARDWARESYSTEMCOMPONENT') OR (Lookup_Keyword = 'BMC_EQUIPMENT')) OR (Lookup_Keyword = 'BMC_COMPUTERSYSTEM')) OR (Lookup_Keyword = 'OB0016353B88A8I74BRQEKytAA6MsA')) OR (Lookup_Keyword = 'OB0016353B88A86EuVRg_l4jAA3TQA')) OR (Lookup_Keyword = 'BMC_LPAR')) OR (Lookup_Keyword = 'BMC_MAINFRAME')) OR (Lookup_Keyword = 'BMC_MEDIA')) OR (Lookup_Keyword = 'OB0016353B88A82AArSATSiJCAuCgB')) OR (Lookup_Keyword = 'OB0016353B88A87#eCRgzcIzBQi8IA')) OR (Lookup_Keyword = 'OB0016353B88A8gROqRgtwR8IgqaU')) OR (Lookup_Keyword = 'OB0016353B88A87hWqRga4CFIgSakD')) OR (Lookup_Keyword = 'OB0016353B88A8##AiRQM90lBAiWMB')) OR (Lookup_Keyword = 'OB0016353B88A8rbd5RgRB3lBgHeEC')) OR (Lookup_Keyword = 'OB0016353B88A8NgqyRgsbeXQQ_pUJ'))	Order by '; ' + Request_Description01	For XML Path ('')), 1, 2, '') FROM [ARSystem].[dbo].[CHG_Associations] chg1 where (((((((((((((((Lookup_Keyword = 'BMC_HARDWARESYSTEMCOMPONENT') OR (Lookup_Keyword = 'BMC_EQUIPMENT')) OR (Lookup_Keyword = 'BMC_COMPUTERSYSTEM')) OR (Lookup_Keyword = 'OB0016353B88A8I74BRQEKytAA6MsA')) OR (Lookup_Keyword = 'OB0016353B88A86EuVRg_l4jAA3TQA')) OR (Lookup_Keyword = 'BMC_LPAR')) OR (Lookup_Keyword = 'BMC_MAINFRAME')) OR (Lookup_Keyword = 'BMC_MEDIA')) OR (Lookup_Keyword = 'OB0016353B88A82AArSATSiJCAuCgB')) OR (Lookup_Keyword = 'OB0016353B88A87#eCRgzcIzBQi8IA')) OR (Lookup_Keyword = 'OB0016353B88A8gROqRgtwR8IgqaU')) OR (Lookup_Keyword = 'OB0016353B88A87hWqRga4CFIgSakD')) OR (Lookup_Keyword = 'OB0016353B88A8##AiRQM90lBAiWMB')) OR (Lookup_Keyword = 'OB0016353B88A8rbd5RgRB3lBgHeEC')) OR (Lookup_Keyword = 'OB0016353B88A8NgqyRgsbeXQQ_pUJ')) Group by REQUEST_ID02)  CHG_HardwareCI_List ON (CHG_HardwareCI_List.REQUEST_ID02=CHG_INFRASTRUCTURE_CHANGE.Infrastructure_Change_ID) LEFT OUTER JOIN ( Select REQUEST_ID02, CHGApplicationCIList = STUFF((Select distinct '; ' + Request_Description01	From [ARSystem].[dbo].[CHG_Associations] chg0	WHERE chg0.REQUEST_ID02 = chg1.REQUEST_ID02 and (((Lookup_Keyword = 'BMC_APPLICATION') 		OR (Lookup_Keyword = 'OB005056826680v0kATAxedZCwnpwE')) 		OR (Lookup_Keyword = 'OB0016353B88A8RWUmSw7LTSDQPTMc')) 	Order by '; ' + Request_Description01	For XML Path ('')), 1, 2, '') FROM [ARSystem].[dbo].[CHG_Associations] chg1 where (((Lookup_Keyword = 'BMC_APPLICATION') 		OR (Lookup_Keyword = 'OB005056826680v0kATAxedZCwnpwE')) 		OR (Lookup_Keyword = 'OB0016353B88A8RWUmSw7LTSDQPTMc')) Group by REQUEST_ID02 )  CHG_ApplicationCIList ON (CHG_INFRASTRUCTURE_CHANGE.Infrastructure_Change_ID=CHG_ApplicationCIList.REQUEST_ID02) WHERE [ARSystem].[dbo].fn_adjusted_date(CHG_INFRASTRUCTURE_CHANGE.Submit_Date)  >  '"+d+"'";
            
            req.query(query ,function(err,recordset){
                if(err){
                    console.log(err);
                    return;
                }
                else{
                	//console.log(recordset);
                	
                	var query = "select conf_id,conf_val from config_values where conf_id IN ('NCDT','NVDT1')";
						        client.execute(query, function(err, result) {
						          if(err){
						            console.log(err);
						            return;
						          }
						          if(result.rows.length>0){
						          for(var i=0,len=result.rows.length;i<len;i++){
						            if(result.rows[i].conf_id=="NCDT"){
						                 NCDT=result.rows[i].conf_val;
						            }
						            else{
						              NVDT1=result.rows[i].conf_val;
						            }
						          }
						      console.log("NCDT and NVDT1 "  + NCDT+" "+NVDT1);
                	for(var h=0,len=recordset.length;h<len;h++){
                		var response_json={};
                		var NC,NV;
                		
                		if(recordset[h].CHGHardwareCIList!=null){
                				//console.log("hw: "+recordset[h].CHGHardwareCIList);
                				var ID=recordset[h].Infrastructure_Change_ID;
                				var Summary=recordset[h].Description;
                				var Category=recordset[h].Categorization_Tier_1;
                				var Environment=recordset[h].CHANGE_ENVIRONMENT;
                				var Risk_Level=recordset[h].RISK_LEVEL;
                				var Request_Status=recordset[h].CHANGE_REQUEST_STATUS;
                				var Application_CI_List=recordset[h].CHGApplicationCIList;
                				var dev_arr=recordset[h].CHGHardwareCIList.split(';');
                				var Start_Date=recordset[h].Start_Date_Time;
                				var End_Date=recordset[h].End_Date_Time;
                				var Restart_required=recordset[h].IPL;
					            if(dev_arr.length>0){
					                
					            var dev_ids="(";
					            for(var i=0,len1=dev_arr.length;i<len1;i++){
					              if(i!=len1-1){
					                    dev_ids+="'"+dev_arr[i].trim().toLowerCase()+"',";
					              }
					              else{
					                  dev_ids+="'"+dev_arr[i].trim().toLowerCase()+"'";
					              }
					              
					            }
					            dev_ids+=")";
					            //map.set(recordset[h].Infrastructure_Change_ID,dev_ids);
					            counter_main+=1;
					            //console.log("dev_arr: "+dev_ids+" ID: "+ID);
					            getscore(NCDT,ID,Summary,Category,Environment,Risk_Level,Request_Status,Application_CI_List,dev_ids,Start_Date,End_Date,Restart_required,function(){
					            	//console.log("counter  " +counter_main+"   "+ count_min);
					            	if(counter_main==count_min){
					            	console.log("finished");
					            	console.log(list_of_crq);
					            	pageZeroData=list_of_crq;
					            }
					            });

					        }
                		}
                		else{
                			var ID=recordset[h].Infrastructure_Change_ID;
                				var Summary=recordset[h].Description;
                				var Category=recordset[h].Categorization_Tier_1;
                				var Environment=recordset[h].CHANGE_ENVIRONMENT;
                				var Risk_Level=recordset[h].RISK_LEVEL;
                				var Request_Status=recordset[h].CHANGE_REQUEST_STATUS;
                				var Application_CI_List=recordset[h].CHGApplicationCIList;
                				//var dev_arr=recordset[h].CHGHardwareCIList.split(';');
                				var Start_Date=recordset[h].Start_Date_Time;
                				var End_Date=recordset[h].End_Date_Time;
                				var Restart_required=recordset[h].IPL;
                			var response_json={
								                			"CRQ": ID,
								                			"Summary":Summary,
								                			"Category":Category,
								                			"Environment":Environment,
								                			"Risk_Level":Risk_Level,
								                			"Request_Status":Request_Status,
								                			"Application_CI_List":Application_CI_List,
								   
								                			"Start_Date" :Start_Date,
								                			"End_Date":End_Date,
								                			"Restart_required":Restart_required,
								                			"NC":'null',
								                			"NV":'null'
								                		}
								                		//console.log('adding data to list');
								                		list_of_crq.push(response_json);
                		}
                		
                	}
				}
				else{
					return;
				}
                    });
                    conn.close();
                }
            });
        });

       
    }

function getscore(NCDT,ID,Summary,Category,Environment,Risk_Level,Request_Status,Application_CI_List,dev_ids,Start_Date,End_Date,Restart_required,call){
	

	
	var query = "select device_id,data_source,score from device_score where device_id IN "+dev_ids +" and updated_date='"+NCDT+"'";
								        //console.log(query);
								        client.execute(query, function(err, results) {
								          if(err){
								              console.log(err);
								              return;
								          }
								          count_min+=1;

								          if(results.rows.length>0){
								          	//console.log("result length"+results.rows.length);
								            for(var i=0,len=results.rows.length;i<len;i++){
								            	if(results.rows[i].data_source=='NC' && results.rows[i].score>NC){
								            		NC=results.rows[i].score;
								            	}
								            	else if(results.rows[i].data_source=='NV' && results.rows[i].score>NV){
								            		NV=results.rows[i].score;
								            	}

								            }
								            //console.log("ID: "+ID+ " NC:"+NC+" NV:"+NV);
								            var response_json={
								                			"CRQ": ID,
								                			"Summary":Summary,
								                			"Category":Category,
								                			"Environment":Environment,
								                			"Risk_Level":Risk_Level,
								                			"Request_Status":Request_Status,
								                			"Application_CI_List":Application_CI_List,
								   
								                			"Start_Date" :Start_Date,
								                			"End_Date":End_Date,
								                			"Restart_required":Restart_required,
								                			"NC":NC,
								                			"NV":NV
								                		}
								                		//console.log('adding data to list');
								                		list_of_crq.push(response_json);
								            call();
								          }
								          else{
								           NC=null;
								           NV=null;   
								           var response_json={
								                			"CRQ": ID,
								                			"Summary":Summary,
								                			"Category":Category,
								                			"Environment":Environment,
								                			"Risk_Level":Risk_Level,
								                			"Request_Status":Request_Status,
								                			"Application_CI_List":Application_CI_List,
								                			
								                			"Start_Date" :Start_Date,
								                			"End_Date":End_Date,
								                			"Restart_required":Restart_required,
								                			"NC":NC,
								                			"NV":NV
								                		}
								                		//console.log('adding data to list');
								                		list_of_crq.push(response_json);
								           call();
								          }
								          
								          

});

    }
module.exports=router;