const requests = require('../requests/xsyu_1');
const {logger} = require("../middlewares/logger");
const sha1 = require("sha1")
const {AxiosError} = require("axios");
const cheerio = require("cheerio")

const login = async (stuId, password) => {
    let loginPage = await requests.getLoginPage()
    let cookie = loginPage.headers["set-cookie"][0]
    let salt = (loginPage.data).match(/CryptoJS.SHA1\('([0-9a-z-]+)'/)[1]
    let salted_password = sha1(salt + password)
    // sleep 1.5s
    await new Promise(resolve => setTimeout(resolve, 1500))
    let loginResult = await requests.login(stuId, salted_password, cookie)
    if (loginResult instanceof AxiosError) loginResult = loginResult.response
    if (loginResult.status === 302) {
        // 登录成功
        return cookie
    }

    let alert_match = loginResult.data.match(/<div class="actionError">\n.*\n.*\n +<span>(.*)<\/span>/)
    if (alert_match) {
        throw new Error(alert_match[1])
    } else {
        throw new Error("request error " + loginResult.status)
    }
}

const getScoreList = async (cookie) => {
    let $ = cheerio.load(await requests.getScoreList(cookie))
    let data = []
    let term = {}
    $($("table.tableStyle")[0]).find("tr").each((index, element) => {
        if (index === 0) return // ignore table header

        let tds = $(element).find("td")
        let num_name = $(tds[1]).text().trim()
        if (num_name === "") return // end of table

        let newTermName = $(tds[0]).text().trim()
        if (newTermName !== "") {
            term = {
                termName: newTermName,
                courses: []
            }
            data.push(term)
        }

        let num_name_match = num_name.match(/\(([A-Z0-9]+)\)(.*)/)
        let num = num_name_match[1]
        let name = num_name_match[2]
        let courseCredit = $(tds[4]).text().trim()
        let category = $(tds[2]).text().trim()
        let courseCategory = category
        let method = ""
        let property = $(tds[7]).text().trim()
        let score = $(tds[3]).text().trim()
        let credit = $(tds[4]).text().trim()
        let GP = $(tds[5]).text().trim()
        let GPA = $(tds[6]).text().trim()
        let remark = $(tds[8]).text().trim()

        term.courses.push({
            num: num,
            name: name,
            courseCredit: courseCredit,
            category: category,
            courseCategory: courseCategory,
            method: method,
            property: property,
            score: score,
            credit: credit,
            GP: GP,
            GPA: GPA,
            remark: remark
        })
    })
    return data
}

module.exports = {
    login,
    getScoreList
}