module.exports = () => ({
  emailTest(email) {
    const regx = /\w{6,12}@[0-9a-zA-Z]+\.com/gi;
    return regx.test(email);
  },
  usernameTest(username) {
    const regx = /^[0-9a-zA-Z\_\-]{6,18}$/gi;
    return regx.test(username);
  },
  pwdTest(password) {
    const regx = /^(?=.{6,16})(?=.*\d)(?=.*[a-zA-Z])/gi;
    return regx.test(password);
  }
});
