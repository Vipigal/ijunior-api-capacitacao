/* eslint-disable @typescript-eslint/no-explicit-any */
/*testar funcoes:
    createUser - feita!
    createAdminUser - feita!
    getAll - feita!
    getById - feita!
    update - feita!
    removeUser - feita!
	approveUser - feita!
	sendEmail - feita!
	searchToken - feita!
	changePassword - feita!
*/
import bcrypt from 'bcrypt';
import {QueryError} from 'sequelize';
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { InvalidRouteError } from '../../../../errors/InvalidRouteError';
import { PermissionError } from '../../../../errors/PermissionError';
import User, {UserAttributes, UserModel} from '../models/User';
import { randomString } from '../../../../utils/functions/randomString';
import { sendEmail } from '../../../../utils/functions/sendEmail';
import UserService from './UserService';

jest.mock('../models/User');
jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('../../../../utils/functions/randomString');
jest.mock('../../../../utils/functions/sendEmail');

describe('getAll', ()=>{
	//Necessario em todo describe para resetar os mocks depois de cada teste.
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	test('O metodo eh chamado ==> Retorna todos os usuarios cadastrados', async()=>{
		const registeredUsers = [{}] as UserModel[]; //Esse retorno imita uma array de usuarios nao-vazia, como ocorre quando damos um get no banco
		(User.findAll as jest.MockedFunction<typeof User.findAll>).mockResolvedValue(registeredUsers); //troca o retorno da funcao que busca no bd pelo retorno falso da linha acima
		
		const allUsers = await UserService.getAll(); //uso como usariamos em uma rota qualquer

		expect(User.findAll).toHaveBeenCalledTimes(1);
		expect(allUsers).toStrictEqual(registeredUsers);

	});

	test('Nao existem usuarios cadastrados no banco ==> lanca execao ', async() => {
		const registeredUsers = [] as UserModel[]; //Esse retorno imita uma array de usuarios vazia
		(User.findAll as jest.MockedFunction<typeof User.findAll>).mockResolvedValue(registeredUsers);

		expect(async()=>{
			await UserService.getAll();
		}).rejects.toThrow(new QueryError('Nao ha usuarios cadastrados'));
	});
});

describe('getById', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});
	const mockUser = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'admin'
	} as UserModel;

	test('Recebe o email de um usuario ==> Retorna as informacoes do usuario correspondente no bd', async()=>{
		const userEmail = 'vip@gmail.com';
		const mockFindByPk = (User.findByPk as jest.MockedFunction<typeof User.findByPk>);
		mockFindByPk.mockResolvedValue(mockUser);

		await UserService.getByEmail(userEmail);

		expect(User.findByPk).toHaveBeenCalledTimes(1);
		expect(mockFindByPk.mock.calls[0][0]).toBe(userEmail);

	});

	test('Uma chave correspondente a um usuario nao existente eh recebida ==> lanca excecao', async()=>{
		const userEmail = 'putao22png@emailinexistente.com';
		(User.findByPk as jest.MockedFunction<typeof User.findByPk>).mockResolvedValue(null);

		await expect(async()=>{
			await UserService.getByEmail(userEmail);
		}).rejects.toThrow(new QueryError('Usuário não encontrado'));

	});
});

describe('createUser',()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const bodyUser = {
		Email: 'vip@gmail.com',
		Senha: '123456',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
	} as UserAttributes;

	const createdUser = {
		Email: 'vip@gmail.com',
		Senha: '', //no caso o novo usuario teria sua senha criptografada aqui. Porem contaremos no teste como se o retorno criptografado do hash fosse igual a um string vazio.
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'pending'
	} as UserModel;

	test('Um objeto contendo informacoes de usuario eh recebido ==> O usuario eh cadastrado no BD', async()=>{
		const mockCreateUser = 	(User.create as jest.MockedFunction<typeof User.create>);
		(User.findOne as any).mockResolvedValue(null);

		const spyHash = jest.spyOn(bcrypt,'hash').mockImplementation(()=>{ //Foi usado spy pois queremos que a funcao externa ainda rode.
			return ''; //Inves de retornar uma senha criptografada, retorna um string vazio
		});

		await UserService.createUser(bodyUser);

		const saltRounds = 10; //este valor deve ser o mesmo usado na criptografia da senha da funcao hashPassword.

		expect(spyHash.mock.calls[0]).toEqual([bodyUser.Senha,saltRounds]);
		expect(mockCreateUser).toBeCalledTimes(1);
		expect(mockCreateUser.mock.calls[0][0]).toEqual(createdUser);
	});
	
	test('O usuario tenta criar uma conta com um Email ja registrado ==> lanca excecao', async()=>{
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(createdUser);

		await expect(async()=>{
			await UserService.createAdminUser(bodyUser);
		}).rejects.toThrow(new InvalidParamError('E-mail já registrado!'));
	});
});

describe('createAdminUser',()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const adminBody = {
		Email: 'vip@gmail.com',
		Senha: '123456',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
	} as UserAttributes;

	const createdAdminUser = {
		Email: 'vip@gmail.com',
		Senha: '', //no caso o novo usuario teria sua senha criptografada aqui. Porem contaremos no teste como se o retorno criptografado do hash fosse igual a um string vazio.
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'admin'
	} as UserModel;

	test('Um objeto contendo informacoes de usuario eh recebido ==> Um usuario administrador eh cadastrado no BD', async()=>{
		const mockCreateUser = 	(User.create as jest.MockedFunction<typeof User.create>);
		(User.findOne as any).mockResolvedValue(null);

		const spyHash = jest.spyOn(bcrypt,'hash').mockImplementation(()=>{ //Foi usado spy pois queremos que a funcao externa ainda rode.
			return ''; //Inves de retornar uma senha criptografada, retorna um string vazio
		});

		await UserService.createAdminUser(adminBody);

		const saltRounds = 10; //este valor deve ser o mesmo usado na criptografia da senha da funcao hashPassword.

		expect(spyHash.mock.calls[0]).toEqual([adminBody.Senha,saltRounds]);
		expect(mockCreateUser).toBeCalledTimes(1);
		expect(mockCreateUser.mock.calls[0]).toEqual([createdAdminUser]);
	});
	

	test('O usuario tenta criar uma conta com um Email ja registrado ==> lanca excecao', async()=>{
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(createdAdminUser);

		await expect(async()=>{
			await UserService.createAdminUser(adminBody);
		}).rejects.toThrow(new InvalidParamError('E-mail já registrado!'));
		
	});
});


describe('updateUser', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const user = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		Senha: '123456',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'member',
		update: jest.fn(),
		get: (att: string) => {
			return (att == 'Email') ? user.Email : user.Cargo;
		}
	};

	const updateData = {
		Email: 'vip@gmail.com',
		Nome: 'Vinicius',
		DataNascimento: '05/08/2002',
		Foto: 'https:://imgur.com/pic_91',
		Telefone: '(31)3223-3778',
	} as UserAttributes;

	const loggedUser = {
		Email: 'vip@gmail.com',
		Cargo: 'member'
	};

	test('metodo recebe um email, um objeto com informacoes do usuario e o usuario logado ==> atualiza o usuario com o email correspondente', async()=>{
		const email = 'vip@gmail.com';
		(User.findByPk as any).mockResolvedValue(user);

		await UserService.update(email, updateData, loggedUser);

		expect(User.findByPk).toBeCalledWith(email);
		expect(user.update).toBeCalledTimes(1);
		expect(user.update).toBeCalledWith(updateData, { where: { Email: email } });

	});

	test('Metodo recebe usuario comum tentando alterar dados de outros usuarios ==> lanca excecao', async()=>{
		const email = 'vip@gmail.com';
		const otherLoggedUser = {
			Email: 'usuarioMalicioso@gmail.com',
			Cargo: 'member'
		};

		(User.findByPk as any).mockResolvedValue(user);
		await expect(async()=>{
			await UserService.update(email, updateData, otherLoggedUser);
		}).rejects.toThrow(new PermissionError('Você não tem permissão para editar informações de outro usuário!'));
	});

	test('Metodo um usuario tentando alterar o proprio email ==> lanca excecao', async()=>{
		const email = 'vip@gmail.com';
		const updateData = {
			Email: 'vipAlterado@gmail.com',
			Nome: 'Vinicius',
			DataNascimento: '05/08/2002',
			Foto: 'https:://imgur.com/pic_91',
			Telefone: '(31)3223-3778',
		} as UserAttributes;

		(User.findByPk as any).mockResolvedValue(user);
		await expect(async()=>{
			await UserService.update(email, updateData, loggedUser);
		}).rejects.toThrow(new InvalidParamError('Você não pode alterar seu próprio email!'));
	});

	test('O usuario tenta alterar o proprio cargo sem ser um ADMIN ==> lanca excecao', async()=>{
		const email = 'vip@gmail.com';
		(User.findByPk as any).mockResolvedValue(user);
		const updateData = {
			Email: 'vip@gmail.com',
			Nome: 'Vinicius',
			DataNascimento: '05/08/2002',
			Foto: 'https:://imgur.com/pic_91',
			Telefone: '(31)3223-3778',
			Cargo: 'admin'
		} as UserAttributes;
		
		await expect(async()=>{
			await UserService.update(email, updateData, loggedUser);
		}).rejects.toThrow(new PermissionError('Você não pode alterar um cargo se não for um administrador!'));
	});
});


describe('changePassword', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const user = {
		Email: 'vip@gmail.com',
		Senha: '123456',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://imgur.com/pic01.jpg',
		Telefone: '(31)3223-3778',
		Cargo: 'member',
		update: jest.fn()
	};

	const email = 'vip@gmail.com';
	const newPassword = '654321';

	test('O metodo recebe o email de um usuario e uma nova senha para atribui-lo',async () => {
		(User.findOne as any).mockResolvedValue(user);
		const spyCompare = jest.spyOn(bcrypt, 'compare').mockImplementation(() => false); //assumindo q a senha colocada seja diferente da cadastrada.
		const spyHash = jest.spyOn(bcrypt,'hash').mockImplementation(()=> newPassword);
		const saltRounds = 10;

		await UserService.changePassword(email, newPassword);

		expect(user.update).toBeCalledTimes(1);
		expect(user.update.mock.calls[0][0]).toStrictEqual({Senha: newPassword});
		expect(spyHash.mock.calls[0]).toEqual([newPassword, saltRounds]);
		expect(spyCompare.mock.calls[0]).toEqual([newPassword, user.Senha]);
	});

	test('O usuario tenta alterar a senha para a mesma que estava utilizando ==> lanca excecao',async () => {
		(User.findOne as any).mockResolvedValue(user);
		jest.spyOn(bcrypt, 'compare').mockImplementation(() => true); //assumindo q a senha colocada seja igual a cadastrada.

		await expect(async ()=>{
			await UserService.changePassword(email, '123456');
		}).rejects.toThrow(new InvalidParamError('A senha nova não pode ser igual a anterior!'));
	});
});


describe('approveUser', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const user = {
		Email: 'vip@gmail.com',
		Senha: '123456',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://imgur.com/pic01.jpg',
		Telefone: '(31)3223-3778',
		Cargo: 'pending',
		save: jest.fn()
	};
	const email = 'vip@gmail.com';
	const cargo =  'member'; 
	test('O metodo recebe o email de um usuario pendente e um cargo para designa-lo ==> designa o cargo, aprovando o usuario',async () => {
		(User.findByPk as any).mockResolvedValue(user);

		await UserService.approveUser(email, cargo);

		expect(user.Cargo).toBe(cargo);
		expect(user.save).toBeCalledTimes(1);
	});

	test('O usuario ja tinha sido aprovado ==> lanca excecao',async () => {
		user.Cargo = 'member';
		(User.findByPk as any).mockResolvedValue(user);

		await expect(async()=>{
			await UserService.approveUser(email, cargo);
		}).rejects.toThrow(new InvalidRouteError('Esse usuario ja foi aprovado'));
	});
});



describe('removeUser', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const mockUser = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		Senha: '123456',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'admin',
		destroy: jest.fn()
	};

	test('Um email de usuario eh recebido ==> remove o usuario correspondente do BD', async()=>{
		const userEmail = 'vip@gmail.com';
		const mockFindByPk = (User.findByPk as any);
		mockFindByPk.mockResolvedValue(mockUser);

		await UserService.removeUser(userEmail);

		expect(User.findByPk).toHaveBeenCalledTimes(1);
		expect(mockFindByPk.mock.calls[0][0]).toBe(userEmail);
		expect(mockUser.destroy).toHaveBeenCalledTimes(1);
	});
});

describe('searchToken', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const mockUser = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'admin',
		Token: 'xYz1234aSd'
	} as UserModel;

	test('Metodo recebe um token de mudanca de senha ==> Retorna o usuario correspondente ao token', async()=>{
		const token = 'xYz1234aSd';
		const mockFindOne = (User.findOne as jest.MockedFunction<typeof User.findOne>);
		mockFindOne.mockResolvedValue(mockUser);

		await UserService.searchToken(token);

		expect(User.findOne).toHaveBeenCalledTimes(1);
		expect(mockFindOne).toBeCalledWith({where: {Token: token}});

	});

	test('Um token que nao corresponde a nenhum usuario eh recebido ==> lanca excecao', async()=>{
		const token = 'aweAWSEijhod2134';
		(User.findOne as jest.MockedFunction<typeof User.findOne>).mockResolvedValue(null);

		await expect(async()=>{
			await UserService.searchToken(token);
		}).rejects.toThrow(new QueryError('Token nao encontrado'));

	});
});


describe('sendTokenToEmail', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const user = {
		Email: 'vip@gmail.com',
		Nome: 'vinicius',
		DataNascimento: '01/01/2000',
		Foto: 'https:://fota',
		Telefone: '(31)32233778',
		Cargo: 'admin',
		Token: '0',
		save: jest.fn()
	};

	const email = 'vip@gmail.com';

	test('O metodo recebe o email de um usuario ==> manda um token de recuperacao de senha no email do usuario', async()=>{
		(User.findByPk as any).mockResolvedValue(user);
		const newToken = 'awsWEj23';
		(randomString as jest.MockedFunction<typeof randomString>).mockImplementation(()=> newToken);


		await UserService.sendTokentoEmail(email);

		expect(user.save).toHaveBeenCalledTimes(1);
		expect(user.Token).toBe(newToken);
		expect(sendEmail).toBeCalledWith(email, 'Password reset', `Your token is: ${newToken}`);

		//escrevi de bobo um teste pra funcao sendEmail do utils, se precisarmos testar ela. Mas acho que foge do escopo do teste do userService por isso comentei.
		// const transporterMock = {} as nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

		// const spyMailTransporter = jest.spyOn(nodemailer, 'createTransport');
		// const mockMailTransporter = (nodemailer.createTransport as  jest.MockedFunction<typeof nodemailer.createTransport>);
		// (transporterMock.sendMail as jest.MockedFunction<typeof transporterMock.sendMail>);

		// expect(mockMailTransporter).toBeCalledWith({
		// 	service: 'gmail',
		// 	auth: {
		// 		user: process.env.EMAIL,
		// 		pass: process.env.EMAIL_PASSWORD,
		// 	}
		// });
		// expect(transporterMock.sendMail).toBeCalledWith({
		// 	from: process.env.EMAIL,
		// 	to: email,
		// 	subject: 'Password reset',
		// 	text: `Your token is: ${newToken}`
		// });

	});
});