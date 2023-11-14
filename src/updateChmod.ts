import { execSync } from "child_process";
import fs = require("fs");
import path = require("path");
import * as vscode from "vscode";

let ERR_MSG_NO_FILE_SELECTED: string = [
  "git-chmod : No file selected/ No matching file in folder.",
  "Please click on the file to select it and then right click on it for context menu",
].join(" ");

export async function updateForResourcePathList(resourcePathList: string[]) {
  // Get the configurations
  const configuration = vscode.workspace.getConfiguration("gitChmod");

  // If any folder, get all file paths recursively and remove the folder path from list
  let dirFiles: string[] = (
    await getDirFiles(resourcePathList, configuration.recursiveFileSuffix)
  )?.flat();

  // Remove any empty and folder paths
  resourcePathList = resourcePathList.filter(
    (filePath) =>
      filePath.trim() !== "" && !fs.lstatSync(filePath).isDirectory()
  );
  dirFiles = dirFiles.filter((str) => str.trim() !== "");
  const allFiles: Set<string> = new Set([...resourcePathList, ...dirFiles]);

  // validate List is not empty
  if (allFiles.size === 0) {
    displayErrorMessage();
    return;
  }

  // Get the new mode
  const newMode = await vscode.window.showQuickPick(["+x", "-x"], {
    placeHolder: "Select Permissions",
  });

  if (newMode === "") {
    console.log(newMode);
    vscode.window.showErrorMessage(
      "A search query is mandatory to execute this action"
    );
    return;
  }

  // Run the command for each path
  const promises: Promise<void>[] = [];
  allFiles.forEach((resourcePath) => {
    promises.push(updateForResourcePath(resourcePath, configuration, newMode));
  });

  await Promise.all(promises);
  displayDoneMessage();
}

export async function updateForResourcePath(
  resourcePath: string,
  configuration: vscode.WorkspaceConfiguration,
  newMode: string = "+x"
) {
  // validate resourcePath
  if (
    resourcePath === undefined ||
    resourcePath === null ||
    resourcePath.length === 0
  ) {
    displayErrorMessage();
    return;
  }
  console.log("git-chmod: resource uri = " + resourcePath);

  const resourceDir = path.dirname(resourcePath);
  const options = configuration.options.trim();

  // Run the command
  if (newMode !== undefined) {
    const gitCommand =
      'git -C "' +
      resourceDir +
      '" update-index ' +
      options +
      " --chmod=" +
      newMode +
      ' "' +
      resourcePath +
      '"';

    console.log("git-chmod: git command - " + gitCommand);
    try {
      execSync(gitCommand);
    } catch (error: unknown) {
      console.error("git-chmod: " + error);
      if (error instanceof Error) {
        vscode.window.showErrorMessage(
          "git-chmod: " + error
        );
      }
    }
  }
}

async function getDirFiles(resourcePathList: string[], fileSuffix: string) {
  const dirCheckPromises: Promise<string[]>[] = [];

  // Check if there are any directories
  // globbing is not supported by bash versions < 4
  // Hence we need to run the command for each file
  resourcePathList.forEach((resourcePath) => {
    dirCheckPromises.push(
      new Promise<string[]>((resolve) => {
        setTimeout(() => {
          let files: string[] = [];
          if (fs.lstatSync(resourcePath).isDirectory()) {
            let result = execSync(
              'git -C "' + resourcePath + '" ls-files'
            ).toString();
            result += execSync(
              'git -C "' + resourcePath + '" ls-files -o '
            ).toString();
            files = result
              .split("\n")
              .filter((str) => str.endsWith(fileSuffix))
              .map((str) => `${resourcePath + "/"}${str}`);
          }
          resolve(files);
        }, 1000);
      })
    );
  });
  let files: string[] = (await Promise.all(dirCheckPromises))?.flat();
  return files;
}

export async function updateForResourceUriList(
  resourceUri: vscode.Uri,
  resourceUriList: vscode.Uri[]
) {
  console.log("git-chmod: resource uri = " + resourceUri);
  resourceUriList = [...resourceUriList, resourceUri];
  if (resourceUriList?.length > 1) {
    await updateForResourcePathList(resourceUriList.map((uri) => uri.fsPath));
  } else {
    displayErrorMessage();
    return;
  }
}

export async function updateFromSCM(
  resourceStates: vscode.SourceControlResourceState[]
) {
  if (resourceStates && resourceStates.length > 0) {
    await updateForResourcePathList(
      resourceStates.map((resourceState) => resourceState?.resourceUri?.fsPath)
    );
  } else {
    displayErrorMessage();
    return;
  }
}

export async function displayDoneMessage() {
  vscode.window.showInformationMessage("git-chmod: Done");
}

export async function displayErrorMessage() {
  vscode.window.showErrorMessage(ERR_MSG_NO_FILE_SELECTED);
}
