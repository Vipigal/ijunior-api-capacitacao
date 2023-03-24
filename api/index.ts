import app from './config/expressConfig';
import User from './src/domains/User/models/User';
import { hash } from 'bcrypt';
import './config/s3.ts';

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});


// ROTA TEMPORARIA PRA CRIAR USUÁRIO FÁCIL
app.post('/', async (req, res) => {

	
	const hashedPass = await hash(req.body.Senha, 10);
	const user = User.build({
		Email: req.body.Email,
		Nome: req.body.Nome,
		DataNascimento: req.body.DataNascimento,
		Senha: hashedPass,
		Telefone: req.body.Telefone,
		Foto: req.body.Foto,
		Cargo: req.body.Cargo,
		Token: '0'
	});

	user.save().catch((e: Error) => {
		console.log(e);
	});
	res.status(200).end();
});