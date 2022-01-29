var express = require('express');
var fs = require('fs')
var router = express.Router();
// 引入上传模块
let multer = require('multer')
// 配置上传对象
let upload = multer({ dest: "./public/upload" })
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hH182458',
  database: 'chat'
});
//  2。连接数据库
connection.connect();

// 处理上传的post请求
// 如果上传单个文件，可调用upload.single（'imgfile'）方法，并且将表单文件的name值传入
// 上传头像
router.post('/uploadImg', upload.single('avatar'), function (req, res) {
  (async function () {
    let file = req.file
    // console.log(file);
    // 获取参数,当前登录用户的id
    let { current_id } = req.query
    // 因为直接上传的文件为随机的名字，我们想要重新命名,加一个随机值
    let oldPath = req.file.destination + "/" + req.file.filename
    let newPath = req.file.destination + "/" + req.file.filename + req.file.originalname;
    fs.rename(oldPath, newPath, () => {
      console.log("改名成功");
    })
    let imgUrl = "http://localhost:3000/upload/" + req.file.filename + req.file.originalname
    connection.query(`update user set headerimg= '${imgUrl}'  where id = '${current_id}'`, function (error, results, fields) {
      if (error) throw error;
      console.log('更改图片信息 ', results);

    })
    res.send("<h1>上传成功</h1><img src='/upload/" + req.file.filename + req.file.originalname + "'>")
    // res.send("<h1>上传成功</h1>")
  }
  )()
});
// 更改用户信息
router.post('/updateUserInfo', function (req, res) {
  (async function () {
    let { username, password, email } = req.body
    // console.log(req.body.data.username);
    let { current_id } = req.body.params
    // console.log(current_id);
    connection.query(`update user set username= '${req.body.data.username}', password= '${req.body.data.password}' , email= '${req.body.data.email}'  where id = '${current_id}'`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      // console.log("返回用户信息", results);
      res.send({
        code: 0,
        msg: "修改成功"
      })
    });
  }
  )()
});
// 全部动态
router.get('/allDynamic', function (req, res) {
  (async function () {
    connection.query(`SELECT * FROM dynamic`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      // console.log("返回用户信息", results);
      res.send({
        code: 0,
        msg: "查找成功",
        data:results
      })
    });
  }
  )()
});
// 全部评论
router.get('/allRemark', function (req, res) {
  (async function () {
    let {dynamic_id} = req.query
    // 查找数据库，找到对应动态的所有评论
    connection.query(`SELECT * FROM remark where dynamic_id='${dynamic_id}'`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      // console.log("返回用户信息", results);
      res.send({
        code: 0,
        msg: "全部评论数据查找成功",
        data:results
      })
    });
  }
  )()
});
// 动态评论
router.post('/remark', function (req, res) {
  (async function () {
    // 获取参数，用户名字，动态id，评论内容
    let { remark_username, dynamic_id, remark_content } = req.body.data
    // console.log(req.body);
      // 根据参数查找当前用户的头像
    connection.query(`SELECT * FROM user where username='${remark_username}'`, function (error, results, fields) {
      if (error) throw error;
      // 拿到用户的头像
      // console.log(results);
    let remark_user_avatar = results[0].headerimg
     // 拿到对应的动态的id，需要查找dynamic表，它的id就为动态的id
     connection.query(`SELECT * FROM dynamic where id='${dynamic_id}'`, function (error, results, fields) {
      if (error) throw error;
      // 拿到动态的id
      let dynamicId = results[0].id
      // 将此条评论保存到数据库中
      connection.query(`INSERT INTO remark(remark_username,dynamic_id,remark_content,remark_userimg) VALUES('${remark_username}','${dynamicId}','${remark_content}','${remark_user_avatar}')`, function (error, results, fields) {
        if (error) throw error;
         // 评论成功后，查询出对应动态的对应评论
         connection.query(`SELECT * FROM remark where dynamic_id='${dynamic_id}'`, function (error, results, fields) {
          if (error) throw error;
           // 评论成功后，查询出对应动态的对应评论
           res.send({
            code: 0,
            msg: '评论成功',
            data: results
          })
           
          
         
        });
        
       
      });
      
     // 拿到对应的动态的id，需要查找dynamic表，它的id就为动态的id
     
    });
    });
  }
  )()
});
router.post('/publish', upload.single('file'), function (req, res) {
  (async function () {
    console.log(req.file,req.query);
    let user = req.query
    // 1.接收上传的图片
    let file = req.file
   // 因为直接上传的文件为随机的名字，我们想要重新命名,加一个随机值
   let oldPath = req.file.destination + "/" + req.file.filename
   let newPath = req.file.destination + "/" + req.file.filename + req.file.originalname;
   fs.rename(oldPath, newPath, () => {
     console.log("改名成功");
   })
   let imgUrl = "http://localhost:3000/upload/" + req.file.filename + req.file.originalname
   connection.query(`INSERT INTO dynamic(username,dynamicimg,isfocus,userimg,content) VALUES('${user.username}','${user.headerimg}','${false}','${imgUrl}','${user.content}')`, function (error, results, fields) {
    if (error) throw error;
    if(results){
      connection.query(`SELECT * FROM dynamic`, function (error, results, fields) {
        if (error) throw error;
        // 返回值
        // console.log("返回用户信息", results);
        res.send({
          code: 0,
          msg: "已将动态的数据查询出来",
          data:results
        })
      });
    }else{
      res.send({
        code: 1,
        msg: '数据库添加出错了'
      })
    }
    


  })
  }
  )()
});

module.exports = router;
