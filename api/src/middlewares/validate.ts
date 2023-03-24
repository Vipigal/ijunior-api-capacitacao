import { NextFunction, Request, Response } from 'express';

import { body, validationResult } from 'express-validator';
import { userRoles } from '../../utils/constants/userRoles';

export const userCreationRules = () => {
	return [
		body('Email', 'Você deve inserir um email valido').isEmail(),
		body('Nome', 'Seu nome deve ter no mínimo 5 caracteres e no máximo 12').isLength({ min: 5, max: 12 }),
		body('Nome', 'Seu nome deve conter apenas letras do alfabeto romano').isAlpha('pt-BR', {ignore: ' '}),
		body('Senha', 'A senha deve ter no mínimo 8 caracteres e no máximo 12').isLength({ min: 8, max: 12 }),
		body('Senha', 'A senha deve conter pelo menos um número').matches(/\d/),
		body('Senha', 'A senha deve conter pelo menos uma letra maiúscula').matches(/[A-Z]/),
		body('Senha', 'A senha deve conter pelo menos uma letra minúscula').matches(/[a-z]/),
		body('Senha', 'A senha deve conter pelo menos um caractere especial').matches(/[^a-zA-Z0-9]/),
		body('DataNascimento', 'A data de nascimento deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ),
		body('Telefone', 'Você deve inserir um telefone válido').isMobilePhone( 'pt-BR' ),
		body('Cargo', 'Você deve inserir um cargo válido').isIn(Object.values(userRoles)).optional( ),
	];
};

export const userUpdateRules = () => {
	return [
		body('Senha', 'A senha deve ter no mínimo 8 caracteres e no máximo 12').isLength({ min: 8, max: 12 }).optional(),
		body('Senha', 'A senha deve conter pelo menos um número').matches(/\d/).optional(),
		body('Senha', 'A senha deve conter pelo menos uma letra maiúscula').matches(/[A-Z]/).optional(),
		body('Senha', 'A senha deve conter pelo menos uma letra minúscula').matches(/[a-z]/).optional(),
		body('Senha', 'A senha deve conter pelo menos um caractere especial').matches(/[^a-zA-Z0-9]/).optional(),
		body('Nome', 'O nome deve ter no mínimo 5 caracteres e no máximo 15').isLength({ min: 5, max: 15 }).optional(),
		body('Nome', 'Seu nome deve conter apenas letras do alfabeto romano').isAlpha('pt-BR', {ignore: ' '}).optional(),
		body('DataNascimento', 'A data de nascimento deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ).optional( ),
		body('Telefone', 'Você deve inserir um telefone válido').isMobilePhone( 'pt-BR', ).optional( ),
		body('Cargo', 'Você deve inserir um cargo válido').isIn([userRoles]).optional(),
	];
};

export const userUpdatePasswordRules = () => {
	return [
		body('Senha', 'A senha deve ter no mínimo 8 caracteres e no máximo 12').isLength({ min: 8, max: 12 }),
		body('Senha', 'A senha deve conter pelo menos um número').matches(/\d/),
		body('Senha', 'A senha deve conter pelo menos uma letra maiúscula').matches(/[A-Z]/),
		body('Senha', 'A senha deve conter pelo menos uma letra minúscula').matches(/[a-z]/),
		body('Senha', 'A senha deve conter pelo menos um caractere especial').matches(/[^a-zA-Z0-9]/),
	];
};

export const projectCreationRules = () => {
	return [
		body('DataEntrega', 'A data de nascimento deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ).optional( {nullable: true} ),
	];
};

export const projectUpdateRules = () => {
	return [
		body('DataEntrega', 'A data de nascimento deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ).optional( {nullable: true} ),
	];
};

export const contractCreationRules = () => {
	return [
		body('Titulo', 'O título deve ter no mínimo 5 caracteres e no máximo 12').isLength({ min: 5, max: 12 }),
		body('NomeCliente', 'O nome do cliente deve ter no mínimo 5 caracteres e no máximo 12').isLength({ min: 5, max: 12 }),
		body('NomeCliente', 'O nome deve conter apenas letras do alfabeto romano').isAlpha('pt-BR', {ignore: ' '}),
		body('Preco', 'O preço deve ser um número').isNumeric(),
		body('VendidoEm', 'A data deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ),
	];
};

export const contractUpdateRules = () => {
	return [
		body('Titulo', 'O título deve ter no mínimo 5 caracteres e no máximo 12').isLength({ min: 5, max: 12 }).optional(),
		body('NomeCliente', 'O nome do cliente deve ter no mínimo 5 caracteres e no máximo 12').isLength({ min: 5, max: 12 }).optional(),
		body('NomeCliente', 'O nome deve conter apenas letras do alfabeto romano').isAlpha('pt-BR', {ignore: ' '}).optional(),
		body('Preco', 'O preço deve ser um número').isNumeric().optional(),
		body('VendidoEm', 'A data deve estar no formato DD-MM-YYYY').isDate( {format : 'DD-MM-YYYY'} ).optional(),
	];
};

export const validate = (req: Request, res: Response, next: NextFunction) => {
	const errors = validationResult(req);
	console.log(errors);
	if (errors.isEmpty()) {
		return next();
	}

	const extractedErrors = [] as Array<{ [key: string]: string }>;
	errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

	return res.status(422).json({
		errors: extractedErrors,
	});
};
