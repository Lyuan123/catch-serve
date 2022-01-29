const qiniu_sdk = require('qiniu')
// const { qiniu } = require('../../../config/')
qiniu_sdk.conf.ACCESS_KEY = 'ftr3RJtkIRdp4xgoEFDYYlSxtQ2ACqAG4sL-CjFm'; // 在七牛密钥管理里边
qiniu_sdk.conf.SECRET_KEY = 'ZR2QEOk9WQDxi2nfpqf1fwG2fp6fnjxeoDJw47Nz'; // 在七牛密钥管理里边

// 要上传的空间
const bucket = "nocost" // 空间名字

// 文件前缀
const prefix = 'image/avatar/'

// 生成上传文件的 token
const token = (bucket, key) => {
  const policy = new qiniu_sdk.rs.PutPolicy({ isPrefixalScope: 1, scope: bucket + ':' + key })
  return policy.uploadToken()
}

const config = new qiniu_sdk.conf.Config()

async function upload_file(file_name, file_path) {
  // 保存到七牛的地址
  const file_save_path = prefix + file_name
  // 七牛上传的token
  const up_token = token(bucket, file_save_path)
  const extra = new qiniu_sdk.form_up.PutExtra()
  const formUploader = new qiniu_sdk.form_up.FormUploader(config)

  // 上传文件
  let ret = await new Promise((resolve, reject) => {
    formUploader.putFile(up_token, file_save_path, file_path, extra, (err, data) => {
      if (!err) {
        // 上传成功， 处理返回值
        resolve(data);
      } else {
        // 上传失败， 处理返回代码
        reject(data);
      }
    });
  })
  return ret
}

// upload_file(上传后的名字，上传的图片路径)   //上传的图片相对路径, 从项目文件夹出发
// upload_file('01.jpg', './01.jpg')  

module.exports = upload_file


/*
  var qiniu = require("qiniu");
  //需要填写你的 Access Key 和 Secret Key
  qiniu.conf.ACCESS_KEY = 'Access_Key';
  qiniu.conf.SECRET_KEY = 'Secret_Key';
  //要上传的空间
  bucket = 'Bucket_Name';
  //上传到七牛后保存的文件名
  key = 'my-nodejs-logo.png';
  //构建上传策略函数，设置回调的url以及需要回调给业务服务器的数据
  function uptoken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket+":"+key);
    putPolicy.callbackUrl = 'http://your.domain.com/callback';
    putPolicy.callbackBody = 'filename=$(fname)&filesize=$(fsize)';
    return putPolicy.token();
  }
  //生成上传 Token
  token = uptoken(bucket, key);
  //要上传文件的本地路径
  filePath = './nodejs-logo.png'
  //构造上传函数
  function uploadFile(uptoken, key, localFile) {
    var extra = new qiniu.io.PutExtra();
      qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if(!err) {
          // 上传成功， 处理返回值
          console.log(ret.hash, ret.key, ret.persistentId);
        } else {
          // 上传失败， 处理返回代码
          console.log(err);
        }
    });
  }
  //调用uploadFile上传
  uploadFile(token, key, filePath);
*/