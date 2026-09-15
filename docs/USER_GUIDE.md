# CoastLink Setup and Run Guide

This guide explains how to run the CoastLink prototype on Windows. The client
and server run in two separate PowerShell windows.

## 1. Check and install Node.js

The server requires Node.js 24 or later.

Open Windows PowerShell and check whether Node.js and npm are available:

```powershell
node --version
npm --version
```

If both commands display version numbers and the Node.js version is 24 or
later, continue to the next section.

If PowerShell says that `node` is not recognised:

1. Open the [official Node.js download page](https://nodejs.org/en/download).
2. Select Node.js 24 LTS or a later LTS release.
3. Download the Windows Installer (`.msi`). Most Windows computers use the
   `x64` installer.
4. Run the installer and keep the default options, including the option that
   adds Node.js to `PATH`.
5. Finish the installation and close every open PowerShell window.

## 2. Start a new PowerShell window

Open the Start menu, type `PowerShell`, and open Windows PowerShell. Administrator
access is not required.

Check the installation again:

```powershell
node --version
npm --version
```

If the commands are still not recognised, restart Windows and try again.

## 3. Install pnpm

Install pnpm 11 using npm:

```powershell
npm install -g pnpm@11
```

Check that pnpm is available:

```powershell
pnpm --version
```

If PowerShell blocks `pnpm.ps1` because script execution is disabled, use
`pnpm.cmd` instead of `pnpm` in the commands below.

## 4. Start the back end

Use the first PowerShell window for the server. Change to the project's
`server` folder. For example:

```powershell
cd C:\Users\user\Desktop\CSIT214\csit214-project\server
pnpm install
pnpm dev
```

`pnpm install` downloads the server packages and normally only needs to be run
after the project is downloaded or its packages change.

The server is ready when PowerShell displays:

```text
CoastLink API listening at http://127.0.0.1:3000
```

Keep this PowerShell window open while using the system.

## 5. Start the front end

Open a second PowerShell window and change to the project's `client` folder:

```powershell
cd C:\Users\user\Desktop\CSIT214\csit214-project\client
pnpm install
pnpm dev
```

The client is ready when PowerShell displays an address similar to:

```text
Local: http://127.0.0.1:5173/
```

Keep the second PowerShell window open as well.

## 6. Open and check the system

Open a browser and visit:

[http://127.0.0.1:5173/](http://127.0.0.1:5173/)

To test the resident workflow:

1. Select **Report an issue**.
2. Complete the required fields and select **Continue**.
3. Check that the confirmation page displays a request number.
4. Select **View request** and confirm that the submitted information appears.

The tracking page can also be tested with the sample request number:

```text
CL-2026-00125
```

The API health check is available at:

[http://127.0.0.1:3000/api/health](http://127.0.0.1:3000/api/health)

## 7. Stop the system

Return to each PowerShell window and press `Ctrl + C`. If PowerShell asks for
confirmation, enter `Y` and press Enter.

## Current prototype limitation

The report form checks selected photo names, file types, sizes, and quantity in
the browser, but photo files are not stored by the server in this version.
