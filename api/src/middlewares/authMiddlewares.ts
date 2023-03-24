import jwt, { JwtPayload} from 'jsonwebtoken';
import { compare } from 'bcrypt';
import User, {UserAttributes } from '../domains/User/models/User';
import { Request, Response, NextFunction } from 'express';
import { NotAuthorizedError } from '../../errors/NotAuthorizedError';
import { InvalidParamError } from '../../errors/InvalidParamError';
import { statusCodes } from '../../utils/constants/statusCodes';
import { TokenError } from '../../errors/TokenError';


function generateJWT(user: UserAttributes, res: Response) {
	const body = {
		Email: user.Email,
		Cargo: user.Cargo
	};

	const token = jwt.sign({ user: body }, process.env.SECRET_KEY, { expiresIn: process.env.JWT_TIME });
	res.cookie('jwt', token, {
		httpOnly: true
	});

}

function extractCookie(req: Request) {
	let token = null;
	if (req && req.cookies)
		token = req.cookies['jwt'];
	return token;
}

export async function login(req: Request, res: Response, next: NextFunction) {
	try {
		const user = await User.findOne({
			where: { Email: req.body.Email }
		});

		if (!user)
			throw new NotAuthorizedError('Usuário incorreto!');

		const rightPassword = await compare(req.body.Senha, user.Senha);
		
		if (!rightPassword)
			throw new NotAuthorizedError('Senha incorreta!');

		generateJWT(user, res);
		res.status(statusCodes.SUCCESS);
		next();
	}
	catch (err) {
		next(err);
	}
}

export async function logout(req: Request, res: Response, next: NextFunction) {
	try {
		const token = extractCookie(req);
		if(!token){
			throw new TokenError('Você não está logado no sistema!');
		}
		res.status(statusCodes.SUCCESS).clearCookie('jwt');
		next();
	}
	catch (err) {
		next(err);
	}
}


export async function checkIfLoggedIn(req: Request, res: Response, next: NextFunction){
	try {
		const token = extractCookie(req);
		if(token){
			throw new InvalidParamError('Você já está logado no sistema!');
		}
		next();
	} catch (error) {
		next(error);
	}
}

export async function auth(req: Request, res: Response, next: NextFunction){
	try {
		const token = extractCookie(req);
		if(token){
			const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
			req.user = decoded.user;
		}

		if (!req.user) {
			throw new NotAuthorizedError('Você precisa logar primeiro!');
		}

		next();
	} catch (error) {
		next(error);
	}
}

export const checkRole = (roles: string[]) => {
	return (req:Request, res:Response, next:NextFunction) => {
		try {
			if(!roles.includes(req.user!.Cargo))
				throw new NotAuthorizedError('Voce não está autorizado a fazer isto');

			res.status(statusCodes.SUCCESS);
			next();
		
		}catch(error){
			next(error);
		}		
	};
};
