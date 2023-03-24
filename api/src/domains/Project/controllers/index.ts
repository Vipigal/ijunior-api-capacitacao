import ProjectService from '../services/ProjectService';
import { Router, Request, Response, NextFunction } from 'express';
import { statusCodes } from '../../../../utils/constants/statusCodes';
import { auth, checkRole } from '../../../middlewares/authMiddlewares';
import { userRoles } from '../../../../utils/constants/userRoles';
import { projectCreationRules, projectUpdateRules, validate } from '../../../middlewares/validate';


const router = Router();

router.get('/', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE]), async(req: Request, res: Response, next: NextFunction) => {
	try {
		const all_projects = await ProjectService.getAll();
		res.status(statusCodes.SUCCESS).json(all_projects);
	} catch (error) {
		next(error);
	}
});

//Retorna um projeto especifico pela sua PK ID.
router.get('/:id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE]), async (req: Request, res: Response, next: NextFunction)=>{
	try{
		const project = await ProjectService.getProjectById(req.params.id as unknown as number);
		res.status(statusCodes.SUCCESS).json(project);
	}
	catch (error) {
		next(error);
	}
});


//Cria um projeto comum. 
router.post('/', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), projectCreationRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	try {
		const contractName: string = req.body.NomeContrato;
		const developers: string[] = req.body.Usuarios;
		await ProjectService.createProject(req.body, contractName, developers);
		res.status(statusCodes.CREATED).json('O projeto ' + req.body.Nome+ ' foi criado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Atualiza os campos de um projeto pela sua PK id com os dados recebidos no body da requisicao.
router.put('/:id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), projectUpdateRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	const id = req.params.id;
	const updatedProjectData = req.body;
	const developers: string[] = req.body.Usuarios;
	const contractName: string = req.body.NomeContrato;

	try {
		await ProjectService.updateProject(id as unknown as number, updatedProjectData, developers, contractName);
		res.status(statusCodes.SUCCESS).json('O projeto foi alterado com sucesso!');
	} catch (error) {
		next(error);
	}
});

//Adiciona um usuário novo no projeto.
router.put('/user/:project_id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async(req: Request, res: Response, next: NextFunction) => {
	try{
		const project_id = req.params.project_id as unknown as number;
		const developers: string[] = req.body.Usuarios;
		await ProjectService.addUser(project_id, developers);
		res.status(statusCodes.SUCCESS).json('O(s) usuário(s) de email ' + developers + ' foi(foram) adicionado(s) com sucesso');
	}catch(error){
		next(error);
	}
});


//Atualiza os campos de um projeto pela sua PK id com os dados recebidos no body da requisicao.
router.put('/:id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), projectUpdateRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	try {
		const id = req.params.id;
		const updatedProjectData = req.body;
		const developers: string[] = req.body.Usuarios;
		const contractName: string = req.body.NomeContrato;
		await ProjectService.updateProject(id as unknown as number, updatedProjectData, developers, contractName);
		res.status(statusCodes.SUCCESS).json('O projeto foi alterado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Deleta um usuário da equipe.
router.delete('/user/:project_id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async(req: Request, res: Response, next: NextFunction)=> {
	try{
		const project_id = req.params.project_id as unknown as number;
		const developers: string[] = req.body.Usuarios;
		await ProjectService.removeUser(project_id, developers);
		res.status(statusCodes.SUCCESS).json('O(s) usuário(s) de email ' + developers + ' foi(foram) deletado(s) com sucesso');
	}catch(error){
		next(error);
	}
});

//Deleta um projeto do sistema pela sua PK id.
router.delete('/:id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async (req: Request, res: Response, next: NextFunction)=>{
	try{
		await ProjectService.removeProject(req.params.id as unknown as number);
		res.status(statusCodes.SUCCESS).json('O projeto de id ' + req.params.id + ' foi deletado com sucesso!');
	}catch(error){
		next(error);
	}
});



export default router;