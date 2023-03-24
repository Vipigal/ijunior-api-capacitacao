import { sequelize } from '../../../../database/index';
import { CreationOptional, DataTypes, Model, InferAttributes,
	InferCreationAttributes,
	HasManyAddAssociationsMixin, 
	HasManyAddAssociationMixin,
	HasManyRemoveAssociationMixin, 
	HasManyRemoveAssociationsMixin } from 'sequelize';
import User, { UserModel } from '../../User/models/User';
import Contract from '../../Contract/models/Contract';

export interface ProjectAttributes extends Model<InferAttributes<ProjectAttributes>, InferCreationAttributes<ProjectAttributes>> {
	Id: CreationOptional<number>,
	Nome: string,
	DataEntrega: CreationOptional<Date>,
	createdAt?: CreationOptional<Date>;
	updatedAt?: CreationOptional<Date>;
	addUsuario: HasManyAddAssociationMixin<UserModel, string>;
	addUsuarios: HasManyAddAssociationsMixin<UserModel, string>;
	removeUsuario: HasManyRemoveAssociationMixin<UserModel, string>;
	removeUsuarios: HasManyRemoveAssociationsMixin<UserModel, string>;
	Usuarios?: UserModel[];
	ContratoId?: number;
}

const Project = sequelize.define<ProjectAttributes>('Projeto', {
	Id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true,
		allowNull: false
	},
	Nome: {
		type: DataTypes.STRING,
		allowNull: false
	},
	DataEntrega: {
		type: DataTypes.STRING,
		allowNull: true
	}
});

export const ProjetoUsuario = Project.belongsToMany(User, {
	through: 'UsuarioProjeto',
	constraints: true
});
User.belongsToMany(Project, {
	through: 'UsuarioProjeto',
	constraints: true
});

Project.belongsTo(Contract, {
	constraints: true,
});
Contract.hasOne(Project);

// Project.sync({alter: true, force: true})
// 	.then(()=> console.log('A tabela de Projetos foi sincronizada'))
// 	.catch((e: Error) => console.log(e));




export default Project;