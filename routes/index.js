var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken')

var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'hH182458',
  database: 'chat'
});
//  2。连接数据库
connection.connect();

let token
const salt = '@!$!@#%#@$#$@'

/* 注册接口 */
router.post('/register', function (req, res) {
  (async function () {
    // console.log(req.body);  
    // 获取参数
    const { username, password, email } = req.body
    //  3.执行数据操作
    connection.query(`SELECT * FROM user where username='${username}'`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      // console.log("返回用户信息", results);
      if (results.length > 0) {
        let asd = {
          code: 1,
          msg: '用户名已存在'
        }
        res.send(asd);
        // console.log("成功");
      } else {
        // 不存在,往数据库添加一条记录
        var addSql = 'INSERT INTO user(username,password,email) VALUES(?,?,?)';
        var addSqlParams = [`${username}`, `${password}`, `${email}`];
        connection.query(addSql, addSqlParams, function (error, results, fields) {
          if (error) throw error;
        });
        res.send({
          code: 0,
          msg: '注册成功'
        })

      }


    });

  })()

});
// 登录接口
router.post('/login', function (req, res) {
  (async function () {
    console.log(req.body);
    // 获取参数
    const { username, password } = req.body
    connection.query(`SELECT * FROM user where username='${username}'`, function (error, results, fields) {
      if (error) throw error;
      // 返回值
      console.log("返回用户信息", results);
     
      // 如果数据库没有该用户
      if (results.length <= 0) {
        res.send({ msg: '用户名未注册' })
        return
      }
      // 如果有，判断数据库参数与当前参数是否一致
      if (results[0].username !== username || results[0].password !== password) {
        res.send({ msg: '用户名或密码错误' })
        return
      }
      if (results.length > 0) {
        // 设置token
        token = jwt.sign({ id: results[0].id, }, salt, { expiresIn: 100000 * 60 * 60 * 24 })
        req.headers['token'] = token
        let asd = {
          code: 0,
          msg: '登陆成功',
          token,
          data: results[0]
        }
        res.send(asd);
      }


    });

  }
  )()

});

module.exports = router;
