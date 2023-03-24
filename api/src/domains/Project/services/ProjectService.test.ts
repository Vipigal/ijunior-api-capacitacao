import User from '../../User/models/User';
import Project, { ProjectAttributes } from '../models/Project';
import ProjectService from './ProjectService';

jest.mock('../models/Project');


describe('getAll', () => {
	test('Deve retornar todos os projetos ==> retorna todos os projetos registrados', async () => {
		const mockProjects = [{
			Nome: 'Projeto 1',
			DataEntrega: new Date(),
		},
		{
			Nome: 'Projeto 2',
			DataEntrega: new Date(),
		}] as ProjectAttributes[];
  
		(Project.findAll as jest.MockedFunction<typeof Project.findAll>).mockResolvedValue(mockProjects);
  
		const projects = await ProjectService.getAll();
  
		expect(projects).toEqual(mockProjects);
	});
});


describe('getProjectById', () => {
	test('Deve retornar um projeto', async () => {
		const mockProject = {
			Id: 42,
			Nome: 'Projeto 1',
			DataEntrega: new Date(),
		};

		// Mocking the findByPk method on the Project model
		(Project.findByPk as jest.Mock).mockResolvedValue(mockProject);

		const project = await ProjectService.getProjectById(42);

		expect(project).toEqual(mockProject);
	});
});

describe('updateProject', () => {
	beforeEach(()=>{
		jest.resetAllMocks();
	});

	test('Deve atualizar um projeto ==> atualiza o projeto com o id especificado', async () => {
		const mockProject = {
			Id: 42,
			Nome: 'Projeto 1',
			DataEntrega: new Date(),
			update: jest.fn()
		};
		const updatedMockProject = {
			Id: 42,
			Nome: 'Projeto Atualizado',
			DataEntrega: new Date(),
		} as ProjectAttributes;
		const developers = ['user1@gmail.com', 'user2@email.com'];

		// Mocking the findByPk method on the Project model
		(Project.findByPk as jest.Mock).mockResolvedValue(mockProject);

		await ProjectService.updateProject(42, updatedMockProject, developers, undefined);

		expect(Project.findByPk).toBeCalledWith(42, {include: User});
		expect(mockProject.update).toBeCalledTimes(1);
	});
});

describe('deleteProject', () => {
	test('Deve deletar um projeto ==> deleta um projeto com id especificado', async () => {
		const mockProject = {
			Id: 42,
			Nome: 'Projeto 1',
			DataEntrega: new Date(),
			destroy: jest.fn()
		};

		// Mocking the findByPk method on the Project model
		(Project.findByPk as jest.Mock).mockResolvedValue(mockProject);

		await ProjectService.removeProject(42);

		expect(Project.findByPk).toBeCalledWith(42);
		expect(mockProject.destroy).toBeCalledTimes(1);
	});
});
