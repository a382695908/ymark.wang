import Base from './base.js';
let fs = require('fs') ;

export default class extends Base {

  fileAction(){
    let file = this.http.file('file') ,
        self = this;

    console.log('file:' ,this.http.file());

    let filepath    = file.path ;
    if(!filepath){
      self.success({msg:'上传失败！'});
      return '';
    }
    let filename    = filepath.substr(filepath.lastIndexOf('\\')+1) ,
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

  // react upload 上传组件的服务端方法
  rfileAction(){
    if(this.http.method!='POST'){
      return this.fail(-1);
    }


    let file = this.http.file().uploadFile ,
        self = this;
        
    if(!file ||  !file.path){
      self.success({msg:'上传失败！'});
      return '';
    }

    let filepath    = file.path ;
    console.log('filePath:' ,filepath);
    let filename    = filepath.substr(filepath.lastIndexOf('\\')+1) ,
        type        = file.headers['content-type'] ,
        outdir      = think.RESOURCE_PATH + '/upload/' + filename ; 

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


  editorimgAction(){
    let file = this.http.file('file') ,
        self = this;

    let filepath    = file.path ,
        filename    = filepath.substr(filepath.lastIndexOf('\\')+1) ,
        type        = file.headers['content-type'] ,outdir ;

    if(filename.indexOf('/') >= 0){
      filename = filename.split('/');
      filename = filename[filename.length - 1];
    }
    outdir          = think.RESOURCE_PATH + '/upload/editor/' + filename ; 
    // 移动文件
    fs.rename(filepath, outdir, function(err) {
      if (err) throw err;
      // 删除临时文件夹文件, 
      fs.unlink(filepath, function() {
         if (err) throw err;
         self.success('/upload/editor/'+filename);
      });
    });
  }
}