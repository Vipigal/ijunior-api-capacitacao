import { QueryError } from 'sequelize';
import Contract, {ContractAttributes} from '../models/Contract';
import { s3 } from '../../../../config/s3';
import {DeleteObjectCommand} from '@aws-sdk/client-s3';
import { InvalidParamError } from '../../../../errors/InvalidParamError';


class ContractService{

	async createContract(body: ContractAttributes, fileURL: string){
		const {Titulo, NomeCliente, VendidoEm, Preco} = body;
		const repeatedContract = await Contract.findOne({where: {Titulo: Titulo}});
		if(repeatedContract)
			throw new InvalidParamError('Ja existe um contrato com esse titulo!');

		const contract = {
			Titulo: Titulo,
			NomeCliente: NomeCliente,
			VendidoEm: VendidoEm,
			Preco: Preco,
			ArquivoURL: fileURL
		} as ContractAttributes;

		return await Contract.create(contract);
	}

	async getContractById(id: number){
		const contract = await Contract.findByPk(id);
		if(!contract)
			throw new QueryError('O contrato com o id recebido nao existe!');
		return contract;
	}

	async getAll(){
		const allContracts = await Contract.findAll();
		if(!allContracts.length)
			throw new QueryError('Nao ha nenhum contrato cadastrado no sistema!');
		return allContracts;
	}

	async updateContract(id: number, updateData: ContractAttributes){
		const originalContract = await Contract.findByPk(id);
		if(!originalContract)
			throw new QueryError('O contrato com o id recebido nao existe!');
		
		await originalContract.update(updateData);
	}

	async removeContract(id: number){
		const result = await Contract.findByPk(id);
		if(!result)
			throw new QueryError('O contrato com o id recebido nao existe!');
		
		if(result.ArquivoURL){
			const AWSKey = result.ArquivoURL.slice(58); //a partir da posicao 58 aparece a key na url da aws.
			s3.send(
				new DeleteObjectCommand({
					Bucket: process.env.AWS_BUCKET_NAME,
					Key: AWSKey
				})
			);
		}
		await result.destroy();
	}

}


export default new ContractService();