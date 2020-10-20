
const AuthService = require("./services/AuthService");
const LoginController = require('./controllers/LoginController')


function run() {
    const authService = new AuthService('')
    const loginController = new LoginController(authService)
}


module.exports = run
