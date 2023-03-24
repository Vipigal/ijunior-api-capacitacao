/* eslint-disable @typescript-eslint/no-explicit-any */
/*testar funcoes:
    createContract - deu bom!
    getContractById - deu bom!
    getAll - deu bom!
    updateContract - deu bom!
    removeContract - deu bom!
*/
import {QueryError} from 'sequelize';
import Contract, {ContractAttributes, ContractModel} from '../models/Contract';
import ContractService from './ContractService';

jest.mock('../models/Contract');
jest.mock('bcrypt');
jest.mock('nodemailer');
jest.mock('../../../../utils/functions/randomString');
jest.mock('../../../../utils/functions/sendEmail');


describe('getAll', () =>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});
    
	test('O metodo é chamado ==> Retorna todos os contratos registrados', async() =>{
		const registredContracts = [{}] as ContractModel[];
		(Contract.findAll as jest.MockedFunction<typeof Contract.findAll>).mockResolvedValue(registredContracts);

		const allContracts = await ContractService.getAll();
        
		expect(Contract.findAll).toHaveBeenCalledTimes(1);
		expect(allContracts).toStrictEqual(registredContracts);
	});

	test('Nao existem contratos cadastrados ==> lanca excecao', async() => {
		const registredContracts = [] as ContractModel[];
		(Contract.findAll as jest.MockedFunction<typeof Contract.findAll>).mockResolvedValue(registredContracts);

		expect(async() =>{
			await ContractService.getAll();            
		}).rejects.toThrow(new QueryError('Nao ha nenhum contrato cadastrado no sistema!'));
	});
});

describe('getContractById', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});
	const mockContract = {
		Id: 10,
		Titulo: 'contrato apple',
		NomeCliente: 'michael douglas',
		Preco: 100000000.00,
		VendidoEm: '30/02/1969',
		Arquivo: 'ntem'
	} as unknown as ContractModel;

	test('Recebe o id de um contrato ==> Retorna as informacoes do contrato correspondente no bd', async()=>{
		const contractId = 10;
		const mockFindByPk = (Contract.findByPk as jest.MockedFunction<typeof Contract.findByPk>);
		mockFindByPk.mockResolvedValue(mockContract);

		await ContractService.getContractById(contractId);

		expect(Contract.findByPk).toHaveBeenCalledTimes(1);
		expect(mockFindByPk.mock.calls[0][0]).toBe(contractId);

	});

	test('Uma chave correspondente a um contrato nao existente eh recebida ==> lanca excecao', async()=>{
		const contractId = 37278313;
		(Contract.findByPk as jest.MockedFunction<typeof Contract.findByPk>).mockResolvedValue(null);

		await expect(async()=>{
			await ContractService.getContractById(contractId);
		}).rejects.toThrow(new QueryError('O contrato com o id recebido nao existe!'));

	});
});

describe('createContract',()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});
	const fileURL = 'boaspessoalaquieoferomonas';
	const bodyContract = {
		Id: 11,
		Titulo: 'contrato samsumg',
		NomeCliente: 'vinicius pinho',
		Preco: 100003000.00,
		VendidoEm: '31/04/1913',
		ArquivoURL: fileURL
	} as unknown as ContractAttributes;

	const createdContract = {
		Titulo: 'contrato samsumg',
		NomeCliente: 'vinicius pinho',
		Preco: 100003000.00,
		VendidoEm: '31/04/1913',
		ArquivoURL: fileURL
	} as unknown as ContractModel;

	test('Um objeto contendo informacoes de contrato eh recebido ==> O contrato eh cadastrado no BD', async()=>{
		const mockCreateContract = (Contract.create as jest.MockedFunction<typeof Contract.create>);
		(Contract.findOne as any).mockResolvedValue(null);

		await ContractService.createContract(bodyContract, fileURL);

		// ta dando erro aqui
		expect(mockCreateContract).toBeCalledTimes(1);
		expect(mockCreateContract.mock.calls[0][0]).toEqual(createdContract);
	});
});

describe('updateContract',() =>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});
	const mockContract = {
		Id: 10,
		Titulo: 'contrato apple',
		NomeCliente: 'michael douglas',
		Preco: 100000000.00,
		VendidoEm: '30/02/1969',
		Arquivo: 'ntem',
		update: jest.fn(),
	};

	const updatedContract = {
		Id: 10,
		Titulo: 'Contrato apple',
		NomeCliente: 'Michael douglas',
		Preco: 10000.00,
		VendidoEm: '30/02/1969',
		Arquivo: 'ntem'
	} as unknown as ContractAttributes;

	test('Recebe um id e um objeto com informacoes do contrato ==> atualiza o contrato com o id correspondente', async()=>{
		const id = 10;
		(Contract.findByPk as any).mockResolvedValue(mockContract);

		await ContractService.updateContract(id, updatedContract);

		expect(Contract.findByPk).toBeCalledWith(id);
		expect(mockContract.update).toBeCalledTimes(1);
	}); 

	test('O contrato com o id registrado nao existe ==> lanca excecao', async()=>{
		const contractId = 372783123;
		(Contract.findByPk as jest.MockedFunction<typeof Contract.findByPk>).mockResolvedValue(null);

		await expect(async()=>{
			await ContractService.getContractById(contractId);
		}).rejects.toThrow(new QueryError('O contrato com o id recebido nao existe!'));

	});
});

describe('removeContract', ()=>{
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	const mockContract = {
		Id: 10,
		Titulo: 'contrato apple',
		NomeCliente: 'michael douglas',
		Preco: 100000000.00,
		VendidoEm: '30/02/1969',
		Arquivo: 'ntem',
		destroy: jest.fn()
	};

	test('Um id de contrato eh recebido ==> remove o contrato correspondente do BD', async()=>{
		const contractId = 10;
		const mockFindByPk = (Contract.findByPk as any);
		mockFindByPk.mockResolvedValue(mockContract);

		await ContractService.removeContract(contractId);

		expect(Contract.findByPk).toHaveBeenCalledTimes(1);
		expect(mockFindByPk.mock.calls[0][0]).toBe(contractId);
		expect(mockContract.destroy).toHaveBeenCalledTimes(1);
	});
});