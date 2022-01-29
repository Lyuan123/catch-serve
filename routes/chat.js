var express = require('express');
const app = express();
var router = express.Router();
var mysql = require('mysql');
const http = require('http');
const server = http.createServer(app);
var io = require('socket.io')(server, { cors: true });
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hH182458',
  database: 'chat'
});
//  2。连接数据库
connection.connect();
router.get('/api/userlist', async (req, res) => {
    console.log("返回的用户名",req.query);
    //  3.执行数据操作
    connection.query(`SELECT * FROM user where isgroup='${false}' and username='${req.query.mename}'`, function (error, results, fields) {
      if (error) throw error;
    //   res.append('Access-Control-Allow-Origin', "*")
    //   res.append('Access-Control-Allow-Content-Type', '*')
      // 返回值
      console.log("返回用户信息",results);
      res.json(Array.from(results))
    });
  
  });
  router.get('/api/me', async (req, res) => {
    console.log("用户数据",req.query);
     //  3.执行数据操作
     
     var  addSq = 'SELECT username  FROM `user` WHERE username = ?';
     var  addSqlParam = [`${req.query.mename}`];
     connection.query(addSq,addSqlParam,function(error, results, fields){
      // console.log('yuansheng',this.qwe);
       var qwe=[]
       qwe=results
       console.log('count',qwe);
       if (qwe.length<1) {
        console.log("baocuole",qwe);
        var  addSql = 'INSERT INTO user(username,headerimg,isgroup,isonline) VALUES(?,?,?,?)';
        var  addSqlParams = [`${req.query.mename}`, `${req.query.mehead_img}`,'false', 'true'];
           connection.query(addSql,addSqlParams, function (error, results, fields) {
            if (error) throw error;
            res.append('Access-Control-Allow-Origin', "*")
            res.append('Access-Control-Allow-Content-Type', '*')
            // 返回值
            res.json(Array.from(results))
          });
      }else{
          console.log("数据大于1");
      }
     })
    
     
  
  
  });
  io.on('connection', (socket) => {
    console.log(socket.id + "建立连接");
    // 接收登录事件
    socket.on('login', async function (data) {
      console.log("登录窜过来的用户",data);
  
      // 先判断是否已经有人在登录，如果有人登录的话，那么将其断开连接
      connection.query(`select * from user where isonline ='${true}' and username ='${data.username}' `, function (error, results, fields) {
        if (results.length > 0) {
          socket.to(results[0].socketid).emit('logout', { content: "有人登录进来了，强制将你踢出去" })
        } else {
          console.log(results.length);
        }
  
      });
      let zuangtau = "true"
      // 修改数据库登录信息（socketid,isonline）
      connection.query(`update user set socketid= '${socket.id}' ,isonline='${zuangtau}' where username = '${data.username}'`, function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results);
        socket.emit('login', {
          state: 'ok',
          content: "登录成功"
        })
        //  .更新用户状态，当新用户上线后需要更新其他人页面的用户状态，广播
        connection.query('SELECT * FROM `user`', function (error, results, fields) {
          if (error) throw error;
          // console.log('用户列表 ', results);
          // 将users对象传出去
          io.sockets.emit('users',Array.from(results))
          // 加入群
          // 获取所有群
          connection.query(`select * from user where isgroup = '${true}'`,function(error, results, fields){
            Array.from(results).forEach((item,index)=>{
              socket.join(item.socketid)
            })
          })
          socket.join()
  
          // 最新未接收的消息
          // let hh = "to"
          connection.query(`select * from chat where touser ='${data.username}' and isread='${false}' `,function(error, results, fields){
            if (error) throw error;
            socket.emit('unreadMsg',Array.from(results))
          })
    });
  
      });
  
  
    })
    // 监听断开连接后清空数据
    socket.on('disconnect',function(){
  
    connection.query(`update user set socketid= '' ,isonline='' where socketid = '${socket.id}'`, function (error, results, fields) {
      if (error) throw error;
      // console.log('The solution is: ', results);
  
    }); 
    })
    socket.on('users',function(){
  
    //  3.执行数据操作
    connection.query('SELECT * FROM `user`', function (error, results, fields) {
      if (error) throw error;
      // console.log('The solution is: ', results);
      // 将users对象传出去
      socket.emit('users',Array.from(results))
    });
  
    })
    socket.on('sendMsg',function(msg){
      console.log(msg);
      // 判断收消息的人是否在线
    connection.query(`select * from user where username = '${msg.to.username}' and isonline='${true}'`, function (error, results, fields) {
      if (error) throw error;
      if(results.length>0){
        // 如果此人在线则直接发送消息
        let toid = results[0].socketid
        socket.to(toid).emit("accept",msg)
        // 将聊天内容存放数据库
        let post ={fromuser:`${msg.from.username}`,touser:`${msg.to.username}`,content:`${msg.content}`,time:`${msg.time}`,isread:`${true}`}
        let sql = "insert into chat set ?"
        connection.query(sql,post)
      }else{
       // 将聊天内容存放数据库
       let post ={fromuser:`${msg.from.username}`,touser:`${msg.to.username}`,content:`${msg.content}`,time:`${msg.time}`,isread:`${false}`}
       let sql = "insert into chat set ?"
       connection.query(sql,post)
      }
    });
    
  
    })
      // 如果收到已读消息，将已读信息改为true
      socket.on('readMsg',(data)=>{
        console.log(data);
        connection.query(`update chat set isread='${true}' where fromuser='${data.username}' and touser='${data.self}'`)
      })
  })
  
  
  module.exports = router;