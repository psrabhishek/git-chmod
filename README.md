# git-chmod README

This is a Visual Studio Code Extension that provides context menu shortcut to set the execute permissions on files under a git SCM.

## Features

It allows to set the execution permission in the following scenarios

### File(s) in Explorer View

![File(s) in Explorer View](images/explorer_files.gif)

### Folder(s) in Explorer View

![Folder(s) in Explorer View](images/explorer_folders.gif)

### File(s) in SCM View

![File(s) in SCM View](images/scm_files.gif)

## Requirements

- The files must be a part of a git repository

## Extension Settings

This extension contributes the following settings:

- `gitChmod.recursiveFileSuffix`: Set the file pattern for which the permission is updated recursively in case of a folder.
- `gitChmod.options`: Additional options for the [`git update-index`](https://git-scm.com/docs/git-update-index) command

## Known Issues

- In the SCM menu, the selection will not work unless it is highlighted.
  sometimes the context menu will appear without any file highlighted, in such running the shortcut will not do anything.

## Release Notes

### 0.0.1

Initial release.
