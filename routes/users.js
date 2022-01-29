var express = require('express');
var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hH182458',
  database: 'chat'
});
//  2。连接数据库
connection.connect();

// 登录接口
router.get('/currentUser', function (req, res) {
  (async function () {
    // console.log(req.query);
    // 获取参数
    const { current_id } = req.query
    console.log(current_id);
    connection.query(`SELECT * FROM user where id='${current_id}'`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      console.log("返回用户信息", results);
      let asd = {
        code: 0,
        data: results[0]
      }
      res.send(asd);
    });
  }
  )()
});

module.exports = router;
