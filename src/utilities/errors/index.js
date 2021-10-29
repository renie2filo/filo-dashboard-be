import path from 'path';

let errorMessage;
let page404 = "",
  page401 = "",
  page403 = "",
  page400 = "",
  page500 = "";

const notFound = async (err, req, res, next) => {
  if (err.httpStatusCode === 404) {
    err.message ? (errorMessage = err.message) : (errorMessage = "Not Found");
    if (page404 !== "")
      res
        .status(404)
        .send(errorMessage)
        .sendFile(path.join(__dirname + page404));
    else res.status(404).send(errorMessage);
  }
  next(err);
};

const unAuthorized = async (err, req, res, next) => {
  if (err.httpStatusCode === 401) {
    err.message
      ? (errorMessage = err.message)
      : (errorMessage = "UnAuthorized");
    if (page401 !== "")
      res
        .status(401)
        .send(errorMessage)
        .sendFile(path.join(__dirname + page401));
    else res.status(401).send(errorMessage);
  }
  next(err);
};

const forbidden = async (err, req, res, next) => {
  if (err.httpStatusCode === 403) {
    err.message ? (errorMessage = err.message) : (errorMessage = "Forbidden");
    if (page403 !== "")
      res
        .status(403)
        .send(errorMessage)
        .sendFile(path.join(__dirname + page403));
    else res.status(403).send(errorMessage);
  }
  next(err);
};

const badRequest = async (err, req, res, next) => {
  if (err.httpStatusCode === 400) {
    err.message ? (errorMessage = err.message) : (errorMessage = "Bad Request");
    if (page404 !== "")
      res
        .status(404)
        .send(errorMessage)
        .sendFile(path.join(__dirname + page400));
    else res.status(404).send(errorMessage);
  }
  next(err);
};

const generalError = async (err, req, res, next) => {
  if (!res.headerSent) {
    err.message
      ? (errorMessage = err.message)
      : (errorMessage = "General Server Error");
    if (page500)
      res
        .status(err.httpStatusCode || 500)
        .send(errorMessage)
        .sendFile(path.join(__dirname + page500));
    else res.status(err.httpStatusCode || 500).send(errorMessage);
  }
};

export {
  notFound,
  unAuthorized,
  forbidden,
  badRequest,
  generalError,
};
