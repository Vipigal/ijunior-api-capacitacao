import User, {UserAttributes } from '../models/User';
import { QueryError } from '../../../../errors/QueryError';
import { PermissionError } from '../../../../errors/PermissionError';
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { userRoles } from '../../../../utils/constants/userRoles';
import bcrypt from 'bcrypt';
import { InvalidRouteError } from '../../../../errors/InvalidRouteError';
import { randomString } from '../../../../utils/functions/randomString';
import { sendEmail } from '../../../../utils/functions/sendEmail';

async function hashPassword(Senha: string){
	const saltRounds = 10;
	return await bcrypt.hash(Senha, saltRounds);
}

interface loggedUserAttributes{
	Email?: string,
	Cargo?: string
}

class UserService {

	async createUser(body: UserAttributes) {
		if (!body.Nome|| !body.Email || !body.Senha || !body.Telefone || !body.DataNascimento) 
			throw new InvalidParamError('Características de usuário incompletas!');
		
		const user = await User.findOne({ where: { Email: body.Email } });
		if (user) 
			throw new InvalidParamError('E-mail já registrado!');
		
		const newUser: UserAttributes = {
			Email: body.Email,
			Nome: body.Nome,
			Senha: body.Senha,
			DataNascimento: body.DataNascimento,
			Telefone: body.Telefone,
			Foto: body.Foto,
			Cargo: userRoles.PENDING,
		};
		const hashedPass = await hashPassword(body.Senha);
		newUser.Senha = hashedPass;

		return await User.create(newUser);

	}


	async changePassword(email: string, newPassword: string){
		const user = await User.findOne({ where: { Email: email}});
		if(!user)
			throw new QueryError('Usuário não encontrado!');
			
		const equalPasswords = await bcrypt.compare(newPassword, user.Senha);
		if (equalPasswords)
			throw new InvalidParamError('A senha nova não pode ser igual a anterior!');

		const hashedNewPassword = await hashPassword(newPassword);
		
		await user.update({Senha: hashedNewPassword});
	}

	async createAdminUser(body: UserAttributes) {
		if (!body.Nome || !body.Email || !body.Senha || !body.Telefone || !body.DataNascimento)
			throw new InvalidParamError('Caracteristicas de usuário incompletas');

		const user = await User.findOne({ where: { Email: body.Email } });
		if (user)
			throw new InvalidParamError('E-mail já registrado!');

		const newUser: UserAttributes = {
			Email: body.Email,
			Nome: body.Nome,
			Senha: body.Senha,
			DataNascimento: body.DataNascimento,
			Telefone: body.Telefone,
			Foto: body.Foto,
			Cargo: userRoles.ADMIN,
		};
		const hashedPass = await hashPassword(body.Senha);
		newUser.Senha = hashedPass;

		return await User.create(newUser);

	}

	async approveUser(email: string, cargo: string){
		const pendingUser = await User.findByPk(email);
		if(!pendingUser)
			throw new QueryError('Usuario nao encontrado');
		if(pendingUser.Cargo !== userRoles.PENDING)
			throw new InvalidRouteError('Esse usuario ja foi aprovado');
		if(![userRoles.ADMIN, userRoles.MEMBER, userRoles.PENDING, userRoles.TRAINEE].includes(cargo))
			throw new InvalidParamError('O cargo selecionado nao faz parte dos cargos registrados no sistema!');
		
		pendingUser.Cargo = cargo;
		return await pendingUser.save();
	}


	async getAll() {
		const users = await User.findAll({ raw: true, attributes: {
			exclude: ['Senha', 'createdAt', 'updatedAt', 'Token']
		}});
		if (users.length === 0) 
			throw new QueryError('Nao ha usuarios cadastrados');
		return users;
	}	


	async getByEmail(email: string) {
		const currentUser = await User.findByPk(
			email,
			{
				raw: true, 
				attributes: {
					exclude: ['Senha', 'createdAt', 'updatedAt', 'Token']}
			});
		if (!currentUser) 
			throw new QueryError('Usuário não encontrado');

		return currentUser;
	}
  

	async update(email: string, userUpdateData: UserAttributes, loggedUser: loggedUserAttributes) {
		const originalUser = await User.findByPk(email);
		if (!originalUser) {
			throw new QueryError('Usuário não encontrado');
		}

		if (loggedUser.Cargo?.toString() != userRoles.ADMIN && loggedUser.Email != email){
			throw new PermissionError('Você não tem permissão para editar informações de outro usuário!');
		}
		
		if(userUpdateData.Email && userUpdateData.Email !==  originalUser.get('Email')){
			throw new InvalidParamError('Você não pode alterar seu próprio email!');
		}
    
		if(userUpdateData.Cargo && userUpdateData.Cargo !== originalUser.get('Cargo') && loggedUser.Cargo !== userRoles.ADMIN){
			throw new PermissionError('Você não pode alterar um cargo se não for um administrador!');
		}
		
		// QUAL DAS DUAS FORMAS DE VALIDAR SENHA É MAIS ADEQUADA?
		if (userUpdateData.Senha){ 
			// throw new InvalidRouteError('A alteracao de senha deve ser feita pela rota PUT: /users/password');
			userUpdateData.Senha = await hashPassword(userUpdateData.Senha);
		}


		await originalUser.update(userUpdateData, { where: { Email: email } });

		return originalUser;
		
	}

	async removeUser(email: string) {
		const currentUser = await User.findByPk(email);
		if (!currentUser)
			throw new QueryError('Usuário não encontrado');
      
		return await currentUser.destroy();
	}

	async sendTokentoEmail(email:string){
		const user = await User.findByPk(email);
		if(!user){
			throw new QueryError('Usuario nao encontrado');
		}
		const token = randomString(10);
		user.Token = token;
		await user.save();

		const msg = `Your token is: ${token}`;
		
		sendEmail(email, 'Password reset', msg);	
		return token;
	}

	async searchToken(token:string){
		const user = await User.findOne({where: {Token: token}});
		if(!user){
			throw new QueryError('Token nao encontrado');
		}
		return user;
	}
}


export default new UserService();