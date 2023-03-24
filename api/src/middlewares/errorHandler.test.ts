import { JsonWebTokenError } from 'jsonwebtoken';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { InvalidParamError } from '../../errors/InvalidParamError';
import { TokenError } from '../../errors/TokenError';
import { QueryError } from '../../errors/QueryError';
import { statusCodes } from '../../utils/constants/statusCodes';
import { NextFunction, Request, Response } from 'express';
import { InvalidRouteError } from '../../errors/InvalidRouteError';
import { errorHandler } from './errorHandler';

describe('errorHandler', ()=>{
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const createMockRequest = ()=>{
		const req: Partial<Request> = {};
		return req;
	};
	const createMockResponse = ()=>{
		const res: Partial<Response> = {};
		res.json = jest.fn();
		return res;
	};
	const mockNextFunction: NextFunction = jest.fn();


	test.each([
		{
			Error: new InvalidParamError('Parametros invalidos!'),
			expectedStatusCode: statusCodes.BAD_REQUEST
		},
		{
			Error: new InvalidRouteError('Rota Invalida!'),
			expectedStatusCode: statusCodes.BAD_REQUEST
		},
		{
			Error: new QueryError('Pesquisa Invalida!'),
			expectedStatusCode: statusCodes.BAD_REQUEST
		},
		{
			Error: new JsonWebTokenError('Token JWT Invalido!'),
			expectedStatusCode: statusCodes.FORBIDDEN
		},
		{
			Error: new NotAuthorizedError('Nao autorizado!'),
			expectedStatusCode: statusCodes.FORBIDDEN
		},
		{
			Error: new TokenError('Token Invalido!'),
			expectedStatusCode: statusCodes.NOT_FOUND
		},
	])('%j', ({Error, expectedStatusCode})=>{
		const mockRes = createMockResponse();
		const mockReq = createMockRequest();
		mockRes.status = jest.fn().mockReturnThis();

		errorHandler(Error!, mockReq as Request, mockRes as Response, mockNextFunction);

		expect(mockRes.status).toBeCalledWith(expectedStatusCode);
		expect(mockRes.json).toBeCalledWith(Error.message);
		expect(mockNextFunction).toBeCalledWith();
	});
});