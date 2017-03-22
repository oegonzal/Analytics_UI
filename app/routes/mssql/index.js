var express = require('express');
var router = express.Router();
var sql = require('mssql');
var conf = require('../../../conf');
router.post("/crq",getCRQInfo);
router.post("/deviceName",getDeviceInfo);

function getDeviceInfo(req,res){
    var deviceName = req.body.deviceName;
    var config = {
            user: conf.mssql_id,
            password: conf.mssql_pass,
            server: 'DW730VIPERQS01.corpdev.visa.com', // You can use 'localhost\\instance' to connect to named instance 
            database: 'ARSystem_QA',
            domain:'VISA',
 
            options: {
            encrypt: false // Use this if you're on Windows Azure 
            }
        }

       var conn = new sql.Connection(config);
       var req = new sql.Request(conn);

       conn.connect(function(err){
            if(err){
                console.log(err);
            }
            var query2 = "SELECT  HPD_HELP_DESK.Incident_Number AS 'Incident',  HPD_Priority.priority AS 'Priority',  case when ((HPD_HELP_DESK.Last_Resolved_Date - HPD_HELP_DESK.Submit_Date) > 0) then round((HPD_HELP_DESK.Last_Resolved_Date - HPD_HELP_DESK.Submit_Date)/60.00,2) else 0 end AS 'MTTR',  HPD_HardwareCI.Request_Description01 FROM  (   SELECT DISTINCT FIELD_ENUM_VALUES.ENUMID,FIELD_ENUM_VALUES.VALUE AS PRIORITY FROM   [ARSystem_QA].[dbo].[FIELD_ENUM_VALUES]  inner join [ARSystem_QA].[dbo].[arschema] on arschema.schemaid = field_enum_values.schemaid and name = 'HPD:Help Desk' inner join [ARSystem_QA].[dbo].[field] on field.fieldid = field_enum_values.fieldid and field.fieldname = 'Priority' and field.schemaid = field_enum_values.schemaid  )  HPD_Priority RIGHT OUTER JOIN (   SELECT * FROM   [ARSystem_QA].[dbo].[HPD_HELP_DESK] WHERE  HPD_HELP_DESK.CONTACT_COMPANY IN (SELECT DISTINCT COMPANY FROM   [ARSystem_QA].[dbo].[CTM_PEOPLE_PERMISSION_GROUPS] WHERE  REMEDY_LOGIN_ID = 'hargulat'        AND COMPANY IS NOT NULL UNION  SELECT DISTINCT COMPANY FROM   [ARSystem_QA].[dbo].[CTM_PEOPLE_ORGANIZATION] WHERE  (SELECT 1         FROM   [ARSystem_QA].[dbo].[CTM_PEOPLE_PERMISSION_GROUPS]         WHERE  REMEDY_LOGIN_ID = 'hargulat'                AND PERMISSION_GROUP = 'Unrestricted Access') = 1        AND COMPANY IS NOT NULL)  )  HPD_HELP_DESK ON (HPD_HELP_DESK.Priority=HPD_Priority.ENUMID)   LEFT OUTER JOIN (   select hpd_associations.* from [ARSystem_QA].[dbo].[HPD_Associations] inner join [ARSystem_QA].[dbo].[FIELD_ENUM_VALUES] on field_enum_values.enumId = hpd_associations.request_type01 and field_enum_values.value = 'Configuration Item' inner join [ARSystem_QA].[dbo].[arschema] on arschema.schemaId = field_enum_values.schemaId and arschema.name = 'HPD:Associations' inner join [ARSystem_QA].[dbo].[field] on field_enum_values.fieldId = field.fieldId  and arschema.schemaId = field.schemaId  where (((((((((((((((Lookup_Keyword = 'BMC_COMPUTERSYSTEM')  OR (Lookup_Keyword = 'BMC_HARDWARESYSTEMCOMPONENT'))  OR (Lookup_Keyword = 'OB0016353B88A8I74BRQEKytAA6MsA'))  OR (Lookup_Keyword = 'OB0016353B88A86EuVRg_l4jAA3TQA'))  OR (Lookup_Keyword = 'BMC_LPAR'))  OR (Lookup_Keyword = 'BMC_MAINFRAME'))  OR (Lookup_Keyword = 'BMC_MEDIA'))  OR (Lookup_Keyword = 'OB0016353B88A82AArSATSiJCAuCgB')) OR (Lookup_Keyword = 'BMC_EQUIPMENT'))  OR (Lookup_Keyword = 'OB0016353B88A87#eCRgzcIzBQi8IA'))  OR (Lookup_Keyword = 'OB0016353B88A8gROqRgtwR8IgqaUD'))  OR (Lookup_Keyword = 'OB0016353B88A87hWqRga4CFIgSakD'))  OR (Lookup_Keyword = 'OB0016353B88A8##AiRQM90lBAiWMB'))  OR (Lookup_Keyword = 'OB0016353B88A8rbd5RgRB3lBgHeEC'))  OR (Lookup_Keyword = 'OB0016353B88A8NgqyRgsbeXQQ_pUJ')) )  HPD_HardwareCI ON (HPD_HELP_DESK.Incident_Number=HPD_HardwareCI.Request_ID02) WHERE HPD_HardwareCI.Request_Description01='"+deviceName+"'";

            req.query(query2 ,function(err,recordset){
                if(err){
                    console.log(err);
                }
                else{
                    console.log(recordset);
                    res.send(recordset);
                    conn.close();
                }
            });
        });

}


function getCRQInfo(req,res){
        console.log("Reached index.js for MSSQL");
        var crqNo = req.body.crqnumber;
        /*Config properties for config.js*/
        // Query 
        var config = {
            user: conf.mssql_temp,
            password: conf.mssql_temp_pass,
            server: 'DW730VIPERPS04', // You can use 'localhost\\instance' to connect to named instance 
            database: 'ARSystem',
            domain:'VISA',
 
            options: {
            encrypt: false // Use this if you're on Windows Azure 
            }
        }
        
       var conn = new sql.Connection(config);
       var req = new sql.Request(conn);

       conn.connect(function(err){
            if(err){
                console.log(err);
            }
            var quer ="Select REQUEST_ID02, CHGHardwareCIList = STUFF((Select distinct '; ' + Request_Description01 From [ARSystem].[dbo].[CHG_Associations] chg0 WHERE chg0.REQUEST_ID02 = chg1.REQUEST_ID02 and  (((((((((((((((Lookup_Keyword = 'BMC_HARDWARESYSTEMCOMPONENT') OR (Lookup_Keyword = 'BMC_EQUIPMENT')) OR (Lookup_Keyword = 'BMC_COMPUTERSYSTEM')) OR (Lookup_Keyword = 'OB0016353B88A8I74BRQEKytAA6MsA')) OR (Lookup_Keyword = 'OB0016353B88A86EuVRg_l4jAA3TQA')) OR (Lookup_Keyword = 'BMC_LPAR')) OR (Lookup_Keyword = 'BMC_MAINFRAME')) OR (Lookup_Keyword = 'BMC_MEDIA')) OR (Lookup_Keyword = 'OB0016353B88A82AArSATSiJCAuCgB')) OR (Lookup_Keyword = 'OB0016353B88A87#eCRgzcIzBQi8IA')) OR (Lookup_Keyword = 'OB0016353B88A8gROqRgtwR8IgqaU')) OR (Lookup_Keyword = 'OB0016353B88A87hWqRga4CFIgSakD')) OR (Lookup_Keyword = 'OB0016353B88A8##AiRQM90lBAiWMB')) OR (Lookup_Keyword = 'OB0016353B88A8rbd5RgRB3lBgHeEC')) OR (Lookup_Keyword = 'OB0016353B88A8NgqyRgsbeXQQ_pUJ'))      Order by '; ' + Request_Description01 For XML Path ('')), 1, 2, '') FROM [ARSystem].[dbo].[CHG_Associations] chg1 where (((((((((((((((Lookup_Keyword = 'BMC_HARDWARESYSTEMCOMPONENT') OR (Lookup_Keyword = 'BMC_EQUIPMENT')) OR (Lookup_Keyword = 'BMC_COMPUTERSYSTEM')) OR (Lookup_Keyword = 'OB0016353B88A8I74BRQEKytAA6MsA')) OR (Lookup_Keyword = 'OB0016353B88A86EuVRg_l4jAA3TQA')) OR (Lookup_Keyword = 'BMC_LPAR')) OR (Lookup_Keyword = 'BMC_MAINFRAME')) OR (Lookup_Keyword = 'BMC_MEDIA')) OR (Lookup_Keyword = 'OB0016353B88A82AArSATSiJCAuCgB')) OR (Lookup_Keyword = 'OB0016353B88A87#eCRgzcIzBQi8IA')) OR (Lookup_Keyword = 'OB0016353B88A8gROqRgtwR8IgqaU')) OR (Lookup_Keyword = 'OB0016353B88A87hWqRga4CFIgSakD')) OR (Lookup_Keyword = 'OB0016353B88A8##AiRQM90lBAiWMB')) OR (Lookup_Keyword = 'OB0016353B88A8rbd5RgRB3lBgHeEC')) OR (Lookup_Keyword = 'OB0016353B88A8NgqyRgsbeXQQ_pUJ')) Group by REQUEST_ID02 having REQUEST_ID02='"+crqNo+"'";

            req.query(quer ,function(err,recordset){
                if(err){
                    console.log(err);
                }
                else{
                    res.send(recordset);
                    conn.close();
                }
            });
        });

       
    }


module.exports=router;