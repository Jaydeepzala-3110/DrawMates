interface IResponse {
  code: number;
  success: boolean;
  message: any;
  data: any;
  err: any;
}

const responses: IResponse = {
  code: 200,
  success: true,
  message: null,
  data: null,
  err: null,
};

function successResponse(res: any, message: string, data = {}) {
  const response = responses;
  response.code = 200;
  response.success = true;
  response.message = message;
  response.data = data;
  response.err = null;
  return res.status(response.code).send(response);
}

function badRequestResponse(res: any, message: string) {
  const response = responses;
  response.code = 400;
  response.success = false;
  response.message = message;
  response.data = null;
  response.err = message;
  return res.status(response.code).send(response);
}

function unauthorizedResponse(res: any, message: string) {
  const response = responses;
  response.code = 401;
  response.success = false;
  response.message = message;
  response.data = null;
  response.err = message;
  return res.status(response.code).send(response);
}

function notFoundResponse(res: any, message: string) {
  const response = responses;
  response.code = 404;
  response.success = false;
  response.message = message;
  response.data = null;
  response.err = message;
  return res.status(response.code).send(response);
}

function internalServerErrorResponse(res: any, message: string, err: any) {
  const response = responses;
  response.code = 500;
  response.success = false;
  response.message = message;
  response.data = null;
  response.err = err;
  return res.status(response.code).send(response);
}

function validationFailResponse(res: any, message: string, err: any) {
  const response = responses;
  response.code = 422;
  response.success = false;
  response.message = message;
  response.data = null;
  response.err = err;
  return res.status(response.code).send(response);
}

export {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  unauthorizedResponse,
  internalServerErrorResponse,
  validationFailResponse,
};
