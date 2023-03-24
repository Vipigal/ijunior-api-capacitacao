import { sequelize } from '../../../../database/index';
import { CreationOptional, DataTypes, DoubleDataType, Model} from 'sequelize';


export interface ContractAttributes {
	Id: CreationOptional<number>
	Titulo: string,
    NomeCliente: string,
    Preco: DoubleDataType,
    VendidoEm: string,
    ArquivoURL: string
}

export interface ContractModel extends Model<ContractAttributes>, ContractAttributes { }

const Contract = sequelize.define<ContractModel, ContractAttributes>('Contrato', {
	Id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		allowNull: false,
		autoIncrement: true,
	},
	Titulo: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	NomeCliente: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	Preco: {
		type: DataTypes.DOUBLE,
		allowNull: false,
	},
	VendidoEm: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	ArquivoURL: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});


// Contract.sync({ alter: true})
// 	.then(() => console.log('A tabela de Contratos foi sincronizada'))
// 	.catch((error: Error) => console.log(error));

export default Contract;