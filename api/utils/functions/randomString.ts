export function randomString(size: number){
	const chars = '0123456789abcdefghijklmnopqrstuvwxyz!@#$%^&*()ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let password = '';

	for (let i = 0; i < size; i++){
		const randomNum = Math.floor((Math.random()) * chars.length);
		password += chars.substring(randomNum, randomNum+1);
	}
	return password;
}