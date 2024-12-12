import { Response } from 'express';

export const RESTResponse = {
  success: (data: any, response: Response) => {
    return response.status(200).json({ status: 'success', statusCode: 200, data });
  },
  created: (data: any, response: Response) => {
    return response.status(201).json({ status: 'success', statusCode: 201, data });
  },
  deleted: (response: Response) => {
    return response.status(204).json({ status: 'success', statusCode: 204, data: null });
  },
  fail: (message: string, response: Response) => {
    return response.status(400).json({ status: 'fail', statusCode: 400, message });
  },
  notFound: (documentName: string, documentId: string, response: Response) => {
    return response
      .status(404)
      .json({
        status: 'fail',
        statusCode: 404,
        message: `Couldn't find a ${documentName} with an id of: ${documentId}`,
      });
  },
  unauthorized: (response: Response) => {
    return response
      .status(401)
      .json({ status: 'error', statusCode: 401, message: 'You are not logged in, please log in to have access!' });
  },
  error: (message: string, response: Response) => {
    return response.status(500).json({ status: 'error', statusCode: 500, message });
  },
  forbidden: (response: Response) => {
    return response
      .status(403)
      .json({ status: 'fail', statusCode: 403, message: 'You do not have permission to perform this action!' });
  },
  conflict: (message: string, response: Response) => {
    return response.status(403).json({ status: 'fail', statusCode: 403, message });
  },
};
