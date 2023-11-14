import * as vscode from 'vscode';
import * as updateChmod from './updateChmod';

export function activate(context: vscode.ExtensionContext) {

	console.log('The extension "git-chmod" is now active!');

	let disposable = vscode.commands.registerCommand('git-chmod.update', async (resourceUri:vscode.Uri, resourceUriList : vscode.Uri[]) => {
        updateChmod.updateForResourceUriList(resourceUri, resourceUriList);
	});

	context.subscriptions.push(disposable);

	let disposable2 = vscode.commands.registerCommand('git-chmod.updateFromSCM', async (...resourceStates: vscode.SourceControlResourceState[]) => {
		updateChmod.updateFromSCM(resourceStates);
	});

	context.subscriptions.push(disposable2);
}

export function deactivate() {}
