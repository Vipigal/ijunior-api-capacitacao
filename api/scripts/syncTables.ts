import {sequelize} from '../database/index';

sequelize.sync({alter: true})
	.then(()=>console.log('As tabelas foram sincronizadas'))
	.catch((e: Error) => console.log(e));
