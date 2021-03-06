const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { SECRET_KEY } = process.env;
const SALT = 10;
exports.users = async function ({ filter = {} }) {
    return await User.find({ ...filter })
        .select(['-password', '-__v'])
        .sort({ createdAt: 1 })
        .exec();
}
exports.user = async function ({ filter = {} }) {
    const u = await User
        .findOne({ ...filter })
        .select('-password -__v')
        .exec();
    if (!u) {
        throw new Error('Không tìm thấy người dùng');
    }
    return u;
}
exports.register = async function ({ userInput = {} }) {
    const { name, userName, password, email } = userInput;
    const user = new User();
    user.name = name;
    user.userName = userName;
    user.password = bcrypt.hashSync(password, SALT);
    user.email = email;
    await user.save();
    return user;
}
exports.deleteUser = async function (args) {
    let id = args._id;
    const result = await User.remove({ _id: id });
    return result;
}

exports.login = async function ({ userInput = {} }) {
    const { userName, password } = userInput;
    const user = await User.findOne({ $or: [{ email: userName }, { userName: userName }] });
    if (!user || !user.comparePassword(password)) throw new Error("Tài khoản hoặc mật khẩu không đúng")
    return {
        userId: user._id,
        token: jwt.sign({ email: user.email, _id: user._id }, SECRET_KEY, { expiresIn: '7d' })
    };
}