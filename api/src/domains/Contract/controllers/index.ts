import  ContractService from '../services/ContractService';
import { Router, Request, Response, NextFunction } from 'express';
import { statusCodes } from '../../../../utils/constants/statusCodes';
import { auth, checkRole } from '../../../middlewares/authMiddlewares';
import { userRoles } from '../../../../utils/constants/userRoles';
import { upload } from '../../../../config/s3';
import { InvalidParamError } from '../../../../errors/InvalidParamError';
import { contractCreationRules, contractUpdateRules, validate } from '../../../middlewares/validate';

const router = Router();

//Retorna todos os contratos cadastrados no sistema.
router.get('/', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async(req: Request, res: Response, next: NextFunction) => {
	try {
		const allContracts = await ContractService.getAll();
		res.status(statusCodes.SUCCESS).json(allContracts);
	} catch (error) {
		next(error);
	}
});


//Retorna um contrato especifico pela sua PK ID.
router.get('/:id', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), async (req: Request, res: Response, next: NextFunction)=>{
	try{
		const contract = await ContractService.getContractById(req.params.id as unknown as number);
		res.status(statusCodes.SUCCESS).json(contract);
	}
	catch (error) {
		next(error);
	}
});


//Cria um contrato comum. Recebe um arquivo do tipo PDF por meio do campo 'Arquivo'
router.post('/', auth, checkRole([userRoles.ADMIN, userRoles.MEMBER]), upload.single('Arquivo'), contractCreationRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	try {
		const fileURL = (req.file as Express.MulterS3.File).location;
		if(!fileURL)
			throw new InvalidParamError('Nao foi possivel encontrar a URL do upload realizado!');
		await ContractService.createContract(req.body, fileURL);
		res.status(statusCodes.CREATED).json('O contrato ' + req.body.Titulo + ' foi criado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Atualiza os campos de um contrato pela sua PK id com os dados recebidos no body da requisicao. Pode receber um arquivo do tipo PDF por meio do campo 'Arquivo'
router.put('/:id', auth, checkRole([userRoles.ADMIN]), upload.single('Arquivo'), contractUpdateRules(), validate, async(req: Request, res: Response, next: NextFunction)=>{
	const id = req.params.id;
	const updatedContractData = req.body;
	if(req.file)
		updatedContractData.ArquivoURL = (req.file as Express.MulterS3.File).location;
	try {
		await ContractService.updateContract(id as unknown as number, updatedContractData);
		res.status(statusCodes.SUCCESS).json('O contrato foi alterado com sucesso!');
	} catch (error) {
		next(error);
	}
});


//Deleta um contrato do sistema pela sua PK id.
router.delete('/:id', auth, checkRole([userRoles.ADMIN]), async (req: Request, res: Response, next: NextFunction)=>{
	try{
		await ContractService.removeContract(req.params.id as unknown as number);
		res.status(statusCodes.SUCCESS).json('O contrato de id' + req.params.id + ' foi deletado com sucesso!');
	}catch(error){
		next(error);
	}
});



export default router;