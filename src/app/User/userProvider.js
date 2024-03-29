const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");
const userDao = require("./userDao");

// check redundant user ID
exports.idActiveCheck = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userActive = await userDao.selectActiveId(connection, id);
    connection.release();

    return userActive[0];
};

// check redundant of user nickname
exports.nicknameActiveCheck = async function (nickname) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userActive = await userDao.selectActiveNickname(connection, nickname);
    connection.release();

    return userActive[0];
};

// check redudant userEmail
exports.emailActiveCheck = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userActive = await userDao.selectActiveEmail(connection, email);
    connection.release();

    return userActive[0];
};


// check user status by id
exports.accountCheck = async function (id) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userAccountResult = await userDao.selectUserAccount(connection, id);
    connection.release();

    return userAccountResult;
};

// check user status by email
exports.accountCheck2 = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userAccountResult = await userDao.selectUserAccount2(connection, email);
    connection.release();
  
    return userAccountResult;
  };

exports.emailCheck = async function (email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const emailCheckResult = await userDao.selectUserEmail(connection, email);
    connection.release();
  
    return emailCheckResult;
};

// get address range
exports.countAddress1 = async function () {
    const connection = await pool.getConnection(async (conn) => conn);
    const addressCount = await userDao.selectCountFromAddress1(connection);
    connection.release();

    return addressCount[0];
};

// retrieve a user
exports.retrieveUser = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userResult = await userDao.selectUserFromId(connection, userId);
    connection.release();

    return userResult[0];
};

// check
exports.passwordCheck = async function (userId) {
    const connection = await pool.getConnection(async (conn) => conn);
    const passwordCheckResult = await userDao.selectUserPassword(connection, userId);
    connection.release();

    return passwordCheckResult[0];
};

exports.getUserLocation = async function (userIdx, addressType) {
    const connection = await pool.getConnection(async (conn) => conn);
    const locationResult = await userDao.selectUserLocation(connection, userIdx);
    connection.release();

    return locationResult[0][0][addressType];
};

exports.retrieveUserList = async function (userId) {
    if (!userId) {
      const connection = await pool.getConnection(async (conn) => conn);
      const userListResult = await userDao.selectUser(connection);
      connection.release();
  
      return userListResult;
  
    } else {
      const connection = await pool.getConnection(async (conn) => conn);
      const userListResult = await userDao.selectUserId(connection, userId);
      connection.release();
  
      return userListResult;
    }
  };

