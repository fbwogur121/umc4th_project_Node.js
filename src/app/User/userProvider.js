const { pool } = require("../../../config/database");
const { logger } = require("../../../config/winston");

const userDao = require("./userDao");

// Provider: Read 비즈니스 로직 처리

exports.retrieveUserList = async function (email) {
  if (!email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUser(connection);
    connection.release();

    return userListResult;

  } else {
    const connection = await pool.getConnection(async (conn) => conn);
    const userListResult = await userDao.selectUserEmail(connection, email);
    connection.release();

    return userListResult;
  }
};

exports.retrieveUser = async function (userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userResult = await userDao.selectUserId(connection, userId);

  connection.release();

  return userResult[0];
};

exports.emailCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const emailCheckResult = await userDao.selectUserEmail(connection, email);
  connection.release();

  return emailCheckResult;
};

exports.passwordCheck = async function (selectUserPasswordParams) {
  const connection = await pool.getConnection(async (conn) => conn);
  const passwordCheckResult = await userDao.selectUserPassword(
      connection,
      selectUserPasswordParams
  );
  connection.release();
  return passwordCheckResult[0];
};

exports.accountCheck = async function (email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const userAccountResult = await userDao.selectUserAccount(connection, email);
  connection.release();

  return userAccountResult;
};



// const { pool } = require("../../../config/database");
// const { logger } = require("../../../config/winston");
// const userDao = require("./userDao");

// // check redundant user ID
// exports.idActiveCheck = async function (id) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const userActive = await userDao.selectActiveId(connection, id);
//     connection.release();

//     return userActive[0];
// };

// // check redundant of user nickname
// exports.nicknameActiveCheck = async function (nickname) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const userActive = await userDao.selectActiveNickname(connection, nickname);
//     connection.release();

//     return userActive[0];
// };

// // check user status
// exports.accountCheck = async function (id) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const userAccountResult = await userDao.selectUserAccount(connection, id);
//     connection.release();

//     return userAccountResult;
// };

// // get address range
// exports.countAddress1 = async function () {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const addressCount = await userDao.selectCountFromAddress1(connection);
//     connection.release();

//     return addressCount[0];
// };

// // retrieve a user
// exports.retrieveUser = async function (userId) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const userResult = await userDao.selectUserFromId(connection, userId);
//     connection.release();

//     return userResult[0];
// };

// // check
// exports.passwordCheck = async function (userId) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const passwordCheckResult = await userDao.selectUserPassword(connection, userId);
//     connection.release();

//     return passwordCheckResult[0];
// };

// exports.getUserLocation = async function (userIdx, addressType) {
//     const connection = await pool.getConnection(async (conn) => conn);
//     const locationResult = await userDao.selectUserLocation(connection, userIdx);
//     connection.release();

//     return locationResult[0][0][addressType];
// };