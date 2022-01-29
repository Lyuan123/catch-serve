const jwt = require('jsonwebtoken')
const salt = '@!$!@#%#@$#$@'

module.exports = function (req, res, next) {
  // 检查post的信息或者url查询参数或者头信息
  const token = req.body.token || req.query.token || req.headers['token']
  if (token) {
    // 解析token
    jwt.verify(token, salt, (err, decoded) => {
      if (err) {
        return res.send({
          code: 1,
          msg: 'token信息错误'
        })
      } else {
        // 如果没问题九八解码后得信息保存到请求中，供后面使用
        req.api_user = decoded
        next()
      }
    })
  } else {
    // 如果没有token，返回错误信息
    res.send({
      code: 1,
      msg: '无效token'
    })
  }
}