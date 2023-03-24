
//Declara o tipo dos parametros recebidos em tempo de execucao para o usuario.
interface PaylodParams{
    Email: string;
    Cargo: string;
}

namespace Express{
    interface Request{
        user?: PaylodParams;
    }
}

namespace NodeJS {
    interface ProcessEnv {
        DB: string;
        DB_USER: string;
        DB_HOST: string;
        PORT: string;
        DB_PASSWORD: string;
        SECRET_KEY: string;
        JWT_TIME: string;
	    	EMAIL: string;
		    EMAIL_PASSWORD: string;
        AWS_ACCESS_KEY: string;
        AWS_SECRET_KEY: string;
        AWS_BUCKET_NAME: string;
        AWS_BUCKET_REGION: string;
    }
}

