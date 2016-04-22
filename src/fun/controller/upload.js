import Base from './base.js';
let fs = require('fs') ;

export default class extends Base {

  fileAction(){
    let file = this.http.file('file') ,
        self = this;

    let filepath    = file.path ,
        filename    = filepath.substr(filepath.lastIndexOf('\\')+1) ,
        type        = file.headers['content-type'] ,
        outdir      = think.RESOURCE_PATH + '/upload/' + filename ; 

    // TODO : 判断格式是否正确
    
    // 移动文件
    fs.rename(filepath, outdir, function(err) {
      if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(filepath, function() {
         if (err) throw err;
         self.success({msg:'上传成功！' ,path:'/upload/'+filename ,name:filename});
      });
    });
  }
}