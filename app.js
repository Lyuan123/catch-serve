var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser')
const cors = require('cors')


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var chatRouter = require('./routes/chat');
var uploadRouter = require('./routes/upload');
const need_token = require('./utils/token')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded   针对普通页面提交功能
app.use(bodyParser.urlencoded({ extended: false }))  //false接收的值为字符串或者数组，true则为任意类型
// parse application/json    
app.use(bodyParser.json())   // 解析json格式
// 配置跨域
app.use(cors({credentials:true,origin:true}))

app.use(indexRouter);
app.use(chatRouter);
app.use(uploadRouter);
app.use(need_token, usersRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
