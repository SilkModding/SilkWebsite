# How to Decompile SpiderHeck Using dnSpyEx

What You Need

1. dnSpyEx
   Download it here: [https://github.com/dnSpyEx/dnSpy/releases](https://github.com/dnSpyEx/dnSpy/releases)
   This tool lets you open and browse compiled game code (.dll files), even if you did not write it.

2. SpiderHeck's DLL File
   For SpiderHeck, the relevant file is usually located at `SpiderHeck_Data/Managed/MyScriptAssembly.dll`.

Step 1: Download and Open dnSpyEx

- Download dnSpyEx from the link above.
- Extract the zip file. No installation is required.
- Run the `dnSpyEx.exe` program.

Step 2: Load SpiderHeck's Code

- Launch dnSpyEx.
- Drag and drop `MyScriptAssembly.dll` into the dnSpyEx window.
- If you do not find the file, look inside the `Managed` folder within the SpiderHeck game directory.

Step 3: Explore the Code

- The left panel shows all classes and methods in the DLL.
- Click a class like `PlayerMovement` to see the code on the right panel. For example, this might show how the player moves or jumps.

This helps you find method names such as `TakeDamage` that you might want to modify for modding.

Step 4: Export the Code (Optional)

- Right-click the DLL in the left panel.
- Select Export to Project to save all the code as a C# project.
- This allows you to open and browse the code in an editor like Visual Studio or VS Code.

Tips for Beginners

- Use the search bar to quickly find methods or variables by typing keywords like `Health` or `Shoot`.
- Spend time browsing the classes to understand how the game works.

Troubleshooting

- If dnSpyEx crashes, update to the latest version.
- If you cannot find the DLL files, double-check the `Managed` folder inside the game directory.

Learn C# Basics

- Microsoft's Official C# Guide: [https://dotnet.microsoft.com/learn/csharp](https://dotnet.microsoft.com/learn/csharp)
- Codecademy's C# Course: [https://www.codecademy.com/learn/learn-c-sharp](https://www.codecademy.com/learn/learn-c-sharp)

Editors

- Visual Studio Community: [https://visualstudio.microsoft.com/](https://visualstudio.microsoft.com/)
- VS Code with C# extension: [https://code.visualstudio.com/](https://code.visualstudio.com/)

Start by exploring familiar classes like `SpiderController`. The more you explore, the easier it becomes to understand. If you get stuck, modding communities are a good place to ask for help.

Enjoy exploring and modding SpiderHeck.
