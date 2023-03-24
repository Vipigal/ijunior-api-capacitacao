import { sequelize } from '../../../../database/index';
import { DataTypes, Model} from 'sequelize';
import { userRoles } from '../../../../utils/constants/userRoles';


export interface UserAttributes {
	Email: string
	Nome: string,
	Senha: string,
	DataNascimento: string,
	Telefone: string,
	Foto: string,
	Cargo: string,
	createdAt?: string,
	updatedAt?: string,
	Token?: string
}

export interface UserModel extends Model<UserAttributes>, UserAttributes { }

const User = sequelize.define<UserModel, UserAttributes>('Usuario', {
	Email: {
		type: DataTypes.STRING,
		primaryKey: true,
		allowNull: false,
		get() {
			return this.getDataValue('Email');
		}
	},
	Nome: {
		type: DataTypes.STRING,
		allowNull: false,
		get() {
			return this.getDataValue('Nome');
		}
	},
	DataNascimento: {
		type: DataTypes.STRING,
		allowNull: false,
		get() {
			return this.getDataValue('DataNascimento');
		}
	},
	Telefone: {
		type: DataTypes.STRING,
		allowNull: false,
		get() {
			return this.getDataValue('Telefone');
		}
	},
	Senha: {
		type: DataTypes.STRING,
		allowNull: false,
		get() {
			return this.getDataValue('Senha');
		}
	},
	Foto: {
		type: DataTypes.STRING,
		allowNull: false,
		get() {
			return this.getDataValue('Foto');
		}
	},
	Cargo: {
		type: DataTypes.STRING,
		values: [userRoles.ADMIN, userRoles.MEMBER, userRoles.TRAINEE, userRoles.PENDING],
		get(): string {
			return this.getDataValue('Cargo');
		}
	},
	createdAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: () => new Date()
	},
	updatedAt: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: () => new Date()
	},
	Token: {
		type: DataTypes.STRING,
		defaultValue: null
	}
});

export default User;
// User.sync({ alter: true})
// 	.then(() => console.log('A tabela de Usuarios foi sincronizada'))
// 	.catch((error: Error) => console.log(error));



