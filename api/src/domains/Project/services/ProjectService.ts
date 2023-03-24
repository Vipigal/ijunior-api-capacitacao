import Project, {ProjectAttributes} from '../models/Project';
import {QueryError} from 'sequelize';
import User from '../../User/models/User';
import Contract from '../../Contract/models/Contract';


class ProjectService{

	async createProject(body: ProjectAttributes, contractTitle: string, developers: string[]){
		const contract = await Contract.findOne({where: {Titulo: contractTitle}});
		if(!contract)
			throw new QueryError('Nao existe um contrato com o nome selecionado!');
		
		const users = await User.findAll({where: {
			Email: developers
		}});
	
		const project = {
			Nome: body.Nome,
			DataEntrega: body.DataEntrega,
			ContratoId: contract.get('Id'),
		};

		const newProject = await Project.create(project);
		newProject.addUsuarios(users);

	}

	async getProjectById(id: number){
		const project = await Project.findByPk(id, {
			include: {
				model: User,
				attributes: ['Email', 'Nome'],
				through: {
					attributes: []
				}
			}
		});
		if (!project) 
			throw new QueryError('Não foi possível encontrar um projeto com o id recebeido!');

		return project;
	}

	async getAll(){
		const all_projects = await Project.findAll({
			include: {
				model: User,
				attributes: ['Email', 'Nome'],
				through: {
					attributes: []
				}
			}
		});
		if (!all_projects.length) 
			throw new QueryError('Nenhum projeto foi encontrado!');

		return all_projects;
	}

	async updateProject(id: number, updateData: ProjectAttributes, developers: string[], newContractTtile: string | undefined){
		//Salva o projeto original com os usuarios cadastrados nele
		const originalProject = await Project.findByPk(id, {
			include: User
		});
		if (!originalProject)
			throw new QueryError('Não foi possível encontrar um projeto com o id recebeido!'); 

		//Atualiza desenvolvedores do projeto
		if(!developers){
			originalProject.Usuarios?.forEach(user => originalProject.removeUsuario(user));
		}
		const newUsers = await User.findAll({where: {
			Email: developers
		}});
		//Para cada usuario novo que nao faz parte do projeto, associa-lo ao projeto
		newUsers.forEach(user => {
			if(!originalProject.Usuarios?.includes(user)){
				originalProject.addUsuario(user);
			}
		});
		//Para cada usuario do projeto que nao esta na lista de desenvolvedores atualizada, remove-lo do projeto
		originalProject.Usuarios?.forEach(user =>{
			if(!developers.includes(user.Email)){
				originalProject.removeUsuario(user);
			}
		});

		//Atualiza o contrato associado ao projeto
		if(newContractTtile){
			const contract = await Contract.findOne({where: {Titulo: newContractTtile}});
			if(!contract)
				throw new QueryError('Nao existe um contrato com o nome selecionado!');
			updateData.ContratoId = contract.get('Id');
			
		}
		await originalProject.update(updateData);
	}

	async removeProject(id: number){
		const original_project = await Project.findByPk(id);
		if (!original_project) 
			throw new QueryError('Não foi possível encontrar um projeto com o id recebeido!'); 
        
		await original_project.destroy();
	}

	
	async addUser(idProject: number, developers: string[]){ 
		const users = await User.findAll({where: {
			Email: developers
		}});
		const project = await Project.findByPk(idProject);
		if(!users || !project){
			throw new QueryError('Não foi possível encontrar um projeto ou usuário com os dados recebidos');
		}

		await project.addUsuarios(users);

	}
	
	async removeUser(idProject: number, developers: string[]){ 
		const users = await User.findAll({where: {
			Email: developers
		}});
		const project = await Project.findByPk(idProject);
		if(!users || !project){
			throw new QueryError('Não foi possível encontrar um projeto ou usuário com os dados recebidos');
		}

		await project.removeUsuarios(users);
	}
}

export default new ProjectService();