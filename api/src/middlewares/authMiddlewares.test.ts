import User, { UserModel } from '../domains/User/models/User';
import { auth, checkIfLoggedIn, checkRole, login, logout } from './authMiddlewares';
import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { TokenError } from '../../errors/TokenError';
import { InvalidParamError } from '../../errors/InvalidParamError';
import { userRoles } from '../../utils/constants/userRoles';


jest.mock('../domains/User/models/User');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('express');


/* 
	Auth - feito!
	CheckRole - feito!
	checkIfLoggedIn - feito!
	login - feito!
	logout - feito!

*/

//licoes aprendidas:
//cuidado com colocar implementacoes de funcoes mockadas dentro dos describes pois esses podem ser resetadas quando o teste comeca
//tente nao compartilhar os objetos entre os testes pois pode causar dependencia entre eles e casos como um teste so falha/passa dependendo de outro
//ao tentar mockar funcoes encadeadas, a primeira funcao deve retornar o proprio objeto pelo meio do MockReturnThis para continuar o encadeamento


describe('login', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	//Mock do request/response -> O tipo Partial torna opcional todos os campos nao inicializados do tipo Request/Response
	const mockRequest: Partial<Request> = {
		body: {
			Email: 'vip@gmail.com',
			Senha: '123456'
		}
	};
	const mockResponse: Partial<Response> = {
		json: jest.fn(),
		cookie: jest.fn(),
		status: jest.fn()
	};
	//Funcao Next do middleware mockada do jeito simples
	const mockNextFunction: NextFunction = jest.fn();

	const mockUser = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		Senha: '', //imagine que aqui fosse a senha 123456 porem criptografada
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)3223-3778',
		Cargo: 'admin'
	} as UserModel;

	//Esse body representa o que utilizaremos para assinar o token JWT
	const body = {
		Email: mockUser.Email,
		Cargo: mockUser.Cargo
	};

	const mockJWT = 'ISSO_ERA_PRA_SER_UMA_AUTORIZACAO_JWT';
	
	test('O middleware eh chamado recebendo um email e senha do body da requisicao ==> loga o usuario no sistema, gerando um cookie jwt especifico para ele', async()=>{
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockImplementation(()=>true);
		(jwt.sign as jest.MockedFunction<typeof jwt.sign>).mockImplementation(()=> mockJWT);

		await login(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(jwt.sign).toBeCalledWith({ user: body }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_TIME });
		expect(mockResponse.cookie).toBeCalledWith('jwt', mockJWT, {httpOnly: true});
		expect(mockNextFunction).toBeCalledWith();
	});

	test('O usuario passa um email que nao existe no BD ==> lanca excecao',async () => {
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(null);

		await login(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith(new NotAuthorizedError('Usuário incorreto!'));

	});

	test('O usuario passa uma senha que nao existe corresponde a do usuario cadastrado no BD ==> lanca excecao',async () => {
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(mockUser);
		(bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>).mockImplementation(() => false);

		await login(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith(new NotAuthorizedError('Senha incorreta!'));

	});
});


describe('auth', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockJWT = 'ISSO_ERA_PRA_SER_UMA_AUTORIZACAO_JWT';
	const mockDecodedJwt = {
		user: {
			Email: 'vip@gmail.com',
			Cargo: 'admin'
		}
	};

	//Outro jeito de criar mocks de requisicoes/respostas
	//Esse jeito eh mais "correto" pois deixa cada teste mais independente. 
	//Os objetos mockados nao sao compartilhados entre os testes, ha um metodo para a criacao desses mocks q serao usados em varios testes.
	const createMockRequest = ()=>{
		const req: Partial<Request> = {};
		req.cookies = null;
		return req;
	};
	const createMockResponse = ()=>{
		const res: Partial<Response> = {};
		return res;
	};
	const mockNextFunction: NextFunction = jest.fn();

	test('O middleware checa e verifica se o usuario possui o cookie jwt correto em sua requisicao ==> o deixa passar pela rota',async () => {
		const mockRequest = createMockRequest();
		const mockResponse = createMockResponse();
		mockRequest.cookies = {'jwt': mockJWT}; //Apos criar o mock da req/res, devemos adicionar todos os atributos que desejamos a ele diretamente e unicamente no teste.
		(jwt.verify as jest.MockedFunction<typeof jwt.verify>).mockImplementation(() => mockDecodedJwt);

		await auth(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(jwt.verify).toBeCalledWith(mockJWT, process.env.SECRET_KEY);
		expect(mockNextFunction).toBeCalledWith();
	});

	test('O usuario nao possui o cookie de autorizacao em sua requisicao ==> lanca excecao', async () => {
		const mockRequest = createMockRequest();
		const mockResponse = createMockResponse();

		await auth(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith(new NotAuthorizedError('Você precisa logar primeiro!'));
	});

});



describe('logout', ()=>{
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockJWT = 'ISSO_ERA_PRA_SER_UMA_AUTORIZACAO_JWT';
	const mockRequest: Partial<Request> = {};
	const mockResponse: Partial<Response> = {};
	const mockNextFunction: NextFunction = jest.fn();

	test('O usuario entra na rota de logout ==> seu cookie de autenticacao eh destruido, se houver', async()=>{
		mockResponse.status = jest.fn().mockReturnThis(); //representa o res.status().clearCookie -> o metodo status tem que retornar a reposta novamente para podermos encadear a prox funcao.
		mockResponse.clearCookie = jest.fn();
		mockRequest.cookies = {'jwt': mockJWT};

		await logout(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockResponse.clearCookie).toBeCalledWith('jwt');
		expect(mockNextFunction).toBeCalledWith();
	});

	test('O usuario tenta fazer logout sem possuir o cookie de autorizacao ==> lanca excecao', async()=>{
		mockRequest.cookies = null;

		await logout(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith(new TokenError('Você não está logado no sistema!'));
	});
});


describe('checkIfLoggedIn', () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	const mockJWT = 'ISSO_ERA_PRA_SER_UMA_AUTORIZACAO_JWT';
	const createMockRequest = ()=>{
		const req: Partial<Request> = {};
		req.cookies = null;
		return req;
	};
	const createMockResponse = ()=>{
		const res: Partial<Response> = {};
		return res;
	};
	const mockNextFunction: NextFunction = jest.fn();

	test('O usuario nao estao logado no sistema ==> o deixa passar pela rota', async()=>{
		const mockRequest = createMockRequest();
		const mockResponse = createMockResponse();

		await checkIfLoggedIn(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith();
	});

	test('O usuario ja esta logado no sistema ==> lanca excecao', async()=>{
		const mockRequest = createMockRequest();
		const mockResponse = createMockResponse();
		mockRequest.cookies = {'jwt': mockJWT};

		await checkIfLoggedIn(mockRequest as Request, mockResponse as Response, mockNextFunction);

		expect(mockNextFunction).toBeCalledWith(new InvalidParamError('Você já está logado no sistema!'));
	});

});

describe('checkRole', ()=>{
	describe('Recebe um array de cargos que podem acessar a rota ==> Testa se o usuario logado pertence a um desses cargos', ()=>{
		beforeEach(() => {
			jest.resetAllMocks();
		});
		//Este é outro metodo de criar a Request que leva o email e o cargo que supostamente estariam no token JWT para criar um mock especifico para cada teste.
		const createMockRequestWithUser = (email: string, cargo: string)=>{ 
			const req: Partial<Request> = {};
			req.user = {
				Email: email,
				Cargo: cargo
			};
			return req;
		};
		const createMockResponse = ()=>{
			const res: Partial<Response> = {};
			res.status = jest.fn();
			return res;
		};
		const mockNextFunction: NextFunction = jest.fn();
	
		test.each([
			{
				permittedRoles: [userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE],
				mockReq: createMockRequestWithUser('vip@gmail.com', userRoles.PENDING),
				mockRes: createMockResponse(),
				expectedError: new NotAuthorizedError('Voce não está autorizado a fazer isto')
			},
			{
				permittedRoles: [userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE],
				mockReq: createMockRequestWithUser('vip@gmail.com', userRoles.MEMBER),
				mockRes: createMockResponse(),
				expectedError: undefined
			},
			{
				permittedRoles: [userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE],
				mockReq: createMockRequestWithUser('vip@gmail.com', userRoles.ADMIN),
				mockRes: createMockResponse(),
				expectedError: undefined
			},
			{
				permittedRoles: [userRoles.ADMIN],
				mockReq: createMockRequestWithUser('vip@gmail.com', userRoles.ADMIN),
				mockRes: createMockResponse(),
				expectedError: undefined
			},
			{
				permittedRoles: [userRoles.ADMIN],
				mockReq: createMockRequestWithUser('vip@gmail.com', userRoles.MEMBER),
				mockRes: createMockResponse(),
				expectedError: new NotAuthorizedError('Voce não está autorizado a fazer isto')
			},

	
		])('%j', ({permittedRoles, mockReq, mockRes, expectedError})=>{
			checkRole(permittedRoles as string[])(mockReq as Request, mockRes as Response, mockNextFunction);
			expect((mockNextFunction as jest.MockedFunction<typeof mockNextFunction>).mock.calls[0][0]).toEqual(expectedError);
		});
	});
});