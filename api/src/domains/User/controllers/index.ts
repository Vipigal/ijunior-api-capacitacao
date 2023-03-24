import  UserService from '../services/UserService';
import { Router, Request, Response, NextFunction } from 'express';
import {statusCodes} from '../../../../utils/constants/statusCodes';
import { auth, checkIfLoggedIn, checkRole, login, logout } from '../../../middlewares/authMiddlewares';
import { userRoles } from '../../../../utils/constants/userRoles';
import { upload } from '../../../../config/s3';
import { userCreationRules, userUpdatePasswordRules, userUpdateRules, validate } from '../../../middlewares/validate';


const router = Router();

router.post('/login', checkIfLoggedIn, login, (req: Request, res: Response) => {
	res.json('Login bem sucedido!');
});

router.post('/logout', logout, (req: Request, res: Response)=>{
	res.json('Logout bem sucedido!');
});

//Retorna todos os usuarios cadastrados no sistema.
router.get('/',auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async(req: Request, res: Response, next: NextFunction) => {
	try {
		const allUsers = await UserService.getAll();
		res.status(statusCodes.SUCCESS).json(allUsers);
	} catch (error) {
		next(error);
	}
});

//Retorna as informacoes da conta logada
router.get('/myAccount', auth, async (req: Request, res: Response, next: NextFunction)=>{
	try {		
		const user = await UserService.getByEmail(req.user!.Email);
		res.status(statusCodes.SUCCESS).json(user);
	} catch (error) {
		next(error);
	}
});

//Retorna um usuario especifico pela sua PK email.
router.get('/:email', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async (req: Request, res: Response, next: NextFunction)=>{
	try {
		const user = await UserService.getByEmail(req.params.email);
		res.status(statusCodes.SUCCESS).json(user);
	} catch (error) {
		next(error);
	}
});


//Cria um usuario comum.
router.post('/', upload.single('Foto'), userCreationRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	try {
		if(req.file)
			req.body.Foto = (req.file as Express.MulterS3.File).location;
		
		await UserService.createUser(req.body);
		res.status(statusCodes.CREATED).json('O usuario ' + req.body.Nome + ' foi criado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Rota de criacao de usuarios para os admins
router.post('/admin', auth, checkRole([userRoles.ADMIN]), upload.single('Foto'), async(req: Request, res: Response, next: NextFunction)=>{
	try {
		if(req.file)
			req.body.Foto = (req.file as Express.MulterS3.File).location;
		
		await UserService.createAdminUser(req.body);
		res.status(statusCodes.CREATED).json('O usuario administrador ' + req.body.Nome + ' foi criado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Rota para mandar o email com o token de redefinicao de senha para o usuario
router.post('/forgotPassword', async(req: Request, res: Response, next: NextFunction) => {
	try {
		UserService.sendTokentoEmail(req.body.Email);
		res.status(statusCodes.SUCCESS).json('O token foi enviado para o email ' + req.body.email + ' com sucesso!');
	} catch (error) {
		next(error);
	}
});

//Rota para resetar a senha do usuario utilizando o token
router.put('/resetPassword', userUpdatePasswordRules(), validate, async(req: Request, res: Response, next: NextFunction) => {

	const insertedToken = req.body.Token;
	const newPassword = req.body.Senha;

	try {
		const user = await UserService.searchToken(insertedToken);
		await UserService.changePassword(user.Email, newPassword);
		user.Token = '0';
		await user.save();
		res.status(statusCodes.ACCEPTED).json('Senha alterada com sucesso');
	}
	catch (error) {
		next(error);
	}
});


//Rota de alteração da senha do usuário sem a utilizacao do token (usuario deve estar logado no sistema)
router.put('/password', userUpdatePasswordRules(), validate, auth, async(req:Request, res:Response, next:NextFunction)=>{
	const email = req.body.Email;
	const newPassword = req.body.Senha;
	try{
		await UserService.changePassword(email, newPassword);
		res.status(statusCodes.SUCCESS).json('Senha alterada com sucesso');
	}catch(error){
		next(error);
	}
});

//Rota para aprovar um usuario.
router.put('/approve', auth, checkRole([userRoles.ADMIN]), async(req: Request, res: Response, next: NextFunction)=>{
	const email = req.body.Email;
	const cargo = req.body.Cargo;
	try {
		await UserService.approveUser(email, cargo);
		res.status(statusCodes.SUCCESS).json('O usuario foi aprovado com sucesso');
	} catch (error) {
		next(error);
	}
});

//Atualiza os campos de um usuario pela sua PK email com os dados recebidos no body da requisicao.
router.put('/myAccount',  upload.single('Foto'), userUpdateRules(), validate, auth, async(req: Request, res: Response, next: NextFunction)=>{
	const updatedUserData = req.body;
	if(req.file)
		updatedUserData.Foto = (req.file as Express.MulterS3.File).location;
	try {
		await UserService.update(req.user!.Email, updatedUserData, req.user!);
		res.status(statusCodes.SUCCESS).json('Sua conta foi alterada com sucesso!');
	} catch (error) {
		next(error);
	}
});

//Atualiza os campos de um usuario pela sua PK email com os dados recebidos no body da requisicao.
router.put('/:email', upload.single('Foto'), userUpdateRules(), validate, auth, checkRole([userRoles.ADMIN]), async(req: Request, res: Response, next: NextFunction)=>{
	const email=req.params.email;
	const updatedUserData = req.body;
	if(req.file)
		updatedUserData.Foto = (req.file as Express.MulterS3.File).location;
	try {		
		await UserService.update(email,updatedUserData,req.user!);
		res.status(statusCodes.SUCCESS).json('O usuario foi alterado com sucesso!');
	} catch (error) {
		next(error);
	}
});



//Deleta um usuario do sistema pela sua PK email.
router.delete('/:email', auth, checkRole([userRoles.ADMIN]), async (req: Request, res: Response, next: NextFunction)=>{
	try{
		await UserService.removeUser(req.params.email);
		res.status(statusCodes.SUCCESS).json('O usuario ' + req.body.Nome + ' foi deletado com sucesso!');
	}catch(error){
		next(error);
	}
});



export default router;