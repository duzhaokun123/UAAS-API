const createRequest = require("../util/request")

const getLoginPage = () => {
    return createRequest({
        url: "/login.action",
    }, {
        returnDataType: "all",
        notInterceptor: true
    })
}

const login = (stuId, salted_password, cookie) => {
    return createRequest({
        url: "/login.action",
        method: "POST",
        data: {
            username: stuId,
            passText: "请输入密码",
            password: salted_password,
            encodedPassword: "",
            session_locale: "zh_CN"
        },
        headers: {
            Cookie: cookie,
            Origin: "https://jwxt.xsyu.edu.cn",
            Referer: "https://jwxt.xsyu.edu.cn/eams/login.action",
        }
    }, {
        returnDataType: "all",
        redirect: true,
        notInterceptor: true
    })
}

const getScoreList = (cookie) => {
    return createRequest({
        url: "/teach/grade/course/person!personGrade.action",
        method: "POST",
        headers: {
            Cookie: cookie,
        }
    })
}

module.exports = {
    getLoginPage,
    login,
    getScoreList
}