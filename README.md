# Installing Nova Editor on macOS

This guide explains how to build and install Nova Editor as a native macOS application from this source code.

## Prerequisites

1.  **Node.js**: Ensure you have Node.js (v18 or newer) installed on your Mac.
2.  **Git**: (Optional) To clone the repository if you haven't downloaded the source.

## Step 1: Prepare the Source Code

If you haven't already, download the project files to your local machine and open your terminal in the project root directory.

## Step 2: Install Dependencies

Run the following command to install all necessary packages. This creates the `node_modules` folder which contains the `vite` and `electron` binaries:

```bash
npm install
```

> **Note**: If you encounter errors like `sh: vite: command not found`, it means the installation didn't complete or the binaries weren't linked correctly. Try a "Clean Install" (see Troubleshooting below).

## Step 3: Build the Application

To generate the macOS installer (`.dmg`), run the build script:

```bash
npm run electron:build
```

This command will:
1.  Compile the frontend assets using Vite.
2.  Package the application using Electron.
3.  Create a production-ready `.dmg` file.

## Step 4: Locate the Installer

Once the build process completes, a new folder named `release` will appear in your project directory.

1.  Open the `release` folder.
2.  Find the file named `Nova Editor-1.0.4.dmg` (the version number might vary).

## Step 5: Install on macOS

1.  **Double-click** the `.dmg` file to mount it.
2.  A window will appear showing the **Nova Editor** icon and the **Applications** folder shortcut.
3.  **Drag and drop** the Nova Editor icon into the Applications folder.
4.  You can now eject the disk image and launch **Nova Editor** from your Launchpad or Applications folder.

---

## Troubleshooting

### "sh: vite: command not found" or "electron: command not found"
This happens if `npm install` failed or was skipped. To fix:
1.  **Delete** the `node_modules` folder and `package-lock.json` file.
2.  Run a clean installation:
    ```bash
    npm install
    ```
3.  Verify vite is available:
    ```bash
    ./node_modules/.bin/vite --version
    ```

### Permission Errors
If you get permission errors on macOS, avoid using `sudo npm install`. Instead, ensure you have ownership of the folder:
```bash
sudo chown -R $(whoami) .
npm install
```

### "Unidentified Developer"
Because the app is not signed with an Apple Developer certificate, macOS might block it initially:
1.  Right-click (or Control-click) the app in your Applications folder.
2.  Select **Open**.
3.  In the dialog that appears, click **Open** again.
4.  You will only need to do this once.
