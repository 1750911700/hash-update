


const fs = require("fs");
const path = require("path");
const parse = require('cheerio')
const genID = ({ length } = { length: 10 }) => {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36)
}
const replaceUrlParam = (url, paramName, paramValue) => {
    if (paramValue == null) {
        paramValue = '';
    }
    const pattern = new RegExp('\\b(' + paramName + '=).*?(&|#|$)');
    if (url.search(pattern) >= 0) {
        return url.replace(pattern, '$1' + paramValue + '$2');
    }
    url = url.replace(/[?#]$/, '');
    return url + (url.indexOf('?') > 0 ? '&' : '?') + paramName + '=' + paramValue;
}
const parseHtml = (hm) => {

    let tagTypes = ['src', 'href']
    const $ = parse.load(hm);
    const getTextNodes = (elem) => {
        const eles = ['script', 'style', 'link'].includes(elem.type) ? [] : elem.contents().toArray()
        return eles.filter(el => el !== undefined)
            .reduce((acc, el) => {
                const isNeedTag = ['script', 'style', 'link'].includes($(el)[0].tagName)
                return acc.concat(isNeedTag ? [el] : getTextNodes($(el)))
            }, [])
    }
    const replaceRegex = /src|href/;
    getTextNodes($(`html`))
        .filter(node => {
            return $.html(node).match(replaceRegex)
        })
        .map(node => {
            const attr = $(node).attr()
            let ownStr = ''
            let repleaseStr = ''
            tagTypes.some(el => {
                if (attr[el]) {
                    ownStr = attr[el]
                    repleaseStr = replaceUrlParam(attr[el], 'v', genID())
                    return true
                }
            })
            return $(node).replaceWith($.html(node).replace(ownStr, repleaseStr))
        });
    return $.html()
}

function addFileHash ({ specifyUrl, includes, exclusion }) {
    let url = specifyUrl ? specifyUrl : __dirname

    fs.readdir(url, (err, files) => {
        if (err) throw err
        const newFiles = files.filter(el => {
            const isHtml = /.html$/.test(el)
            const fileName = el.substr(0, el.length - 5)
            const [isIn, isEx] = [Array.isArray(includes) && includes.length > 0, Array.isArray(exclusion) && exclusion.length > 0]
            if (isHtml && isIn) {
                if (isEx) {
                    let needHash = includes.filter(el => {
                        return !exclusion.some(ele => ele === el)
                    })
                    return needHash.includes(fileName)
                }
                return includes.includes(fileName)
            }
            if (isHtml && isEx) {
                return !exclusion.includes(fileName)
            }
            return isHtml
        })
        newFiles.forEach(file => {
            const fPath = path.join(url, file);
            fs.stat(fPath, (err, stat) => {
                console.log(file,'file');
                if (err) {
                    throw new Error(err)
                }
                if (stat.isFile()) {
                    fs.readFile(path.join(url,file), "utf8", (err, contents) => {
                        if (err) {
                            throw new Error(err)
                        }
                        const newHtml = parseHtml(contents)
                        fs.writeFile(path.join(url,file), newHtml, (err) => {
                            if (err) {
                                throw new Error(err)
                            }
                            console.log(`${file}--------已修改`);
                        })
                    })
                }
            })
        })
    })
}

module.exports = {
    addFileHash
}
