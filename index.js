const ora = require('ora');
const chalk = require('chalk');
const packageJson = require('./package.json');
const fs = require('fs');
const inquirer = require('inquirer');
const fetch = require("node-fetch");
const open = require("open");
const si = require("systeminformation");
const config = require("./config")
process.on("uncaughtException", err => {
	try {
	console.log(chalk.bold.red("An unexpected error occured! Technical details:\n" + err.message));
	inquirer.prompt({
		name: "exit",
		message: "What do you want to do?",
		type: "list",
		choices: [
			{
				name: "Write to log and exit",
				value: "write_log"
			},
			{
				name: "Exit",
				value: "exit"
			}
		]
	}).then(out => {
		if(out.exit == "exit") process.exit(1)
		else if(out.exit == "write_log") {
			fs.writeFileSync("saladbind_error.txt", `An error occured.\nError: ${err}\n\nStacktrace: ${err.stack}`);
			process.exit(1);
		}
	})
} catch(newError) {
	console.log("ERROR: ", {
		err,
		newError
	});
	process.exit(1);
}
});
var CLImode = false;
var CLIArgs = []
console.clear();
process.title = `SaladBind v${packageJson.version}`;
if(config.get("dev") == "true") console.log(process.argv)
if(process.argv[2]) {
	CLImode = true
	CLIArgs = process.argv.slice(2);
}

const updateCheck = new Promise((resolve, reject) => {
	const spinner = ora('Checking for updates...').start();
	fetch('https://raw.githubusercontent.com/VukkyLtd/SaladBind/main/package.json')
		.then(res => res.json())
		.then(data => {
			if(data.version !== packageJson.version) {
				spinner.succeed(chalk.bold.green(`SaladBind ${data.version} is available!`));
				console.log("Download it from https://bit.ly/saladbind\n");
				setTimeout(() => {
					resolve();
				},3500);
			} else {
				spinner.stop();
				resolve();
			}
		})
		.catch(err => {
			spinner.fail(chalk.bold.red(`Could not check for updates, please try again later.`));
			console.log(err);
			setTimeout(() => {
				resolve();
			},3500);
		});
});

(async () => {
	updateCheck.then(() => {
		if(!CLImode) {
			console.log(chalk.bold.green(`SaladBind v${packageJson.version}`))
			if(config.configCreated) {
				console.log("Looks like this is your first time using SaladBind!\nLet's set it up. :)\n");
				require("./setup").run(false);
			} else {
				menu();
			}
		} else {
			CLIMode()
		}
	})
})();

async function CLIMode() {
	console.log(CLIArgs)
	if(CLIArgs[0] == "-help") {
		console.log(chalk.green(`SaladBind CLI v${packageJson.version}`));
		console.log("Arguments:")
		console.log(`
	-help 	Display this help message

	-miner	Choose miner (for example: "phoenixminer") (REQUIRED)

	-algo	Choose algorithm (for example: "ethash") (REQUIRED)

	-pool	Choose pool (for example: "nicehash") (REQUIRED)

	-wallet	Choose wallet (for example: "0x6ff85749ffac2d3a36efa2bc916305433fa93731.123123123123123")

	-advanced	Choose advanced settings (for example: "-advanced [-w a -u 123 ]")
				Anything put inside these square brackets will be passed to the miner directly.
		`);
	}
}


async function menu(clear) {
	if(clear == undefined || clear == true) {
		console.clear();
	}
	console.log(chalk.bold.green(`SaladBind v${packageJson.version}`));
	const questions = [
		{
			type: 'list',
			name: 'menu',
			message: 'What would you like to do?',
			choices: [
				{
					name: 'Start mining',
					value: 'mining'
				},
				{
					name: 'Configure SaladBind',
					value: 'config'
				},
				{
					name: 'Join the SaladBind Discord',
					value: 'discord'
				},
				{
					name: 'Exit SaladBind',
					value: 'exit'
				}
			]
		}
	];
	const answers = await inquirer.prompt(questions);
	switch (answers.menu) {
		case 'mining':
			require("./mining").run();
			break;
		case 'config':
			require("./setup").run();
			break;
		case 'discord':
			let temp = await si.osInfo()
			if(temp.platform == "linux") {
				console.log("\nhttps://discord.gg/HfBAtQ2afz");
			} else {
				open("https://discord.gg/HfBAtQ2afz");
				console.log("\nOpened the invite in your browser!");
			}
			setTimeout(() => {
				menu();
			}, 3500); 
		break;
		case 'exit':
			console.clear();
			process.exit(0);
		default:
			menu();
			break;
	}
}

module.exports = {
	menu
}
