const path = require('path')
const  { addFileHash } = require('./src/index.js')
const props = {
    includes:[],//需要添加版本号的文件
    // exclusion:[],//不需要添加版本号的文件（与includes互斥）
    specifyUrl:path.join(__dirname,'example')//指定路径
}
console.log(props,'props');
/*
1:该文件执行时，就修改所有同级html文件内  script style link 的版本号
2：includes，exclusion两个参数内容互斥，都不存在时将修改所有同级html文件
3:使用方式：控制台：npm run scripting
*/
addFileHash(props)