# **Decompiling SpiderHeck (or Any Game Code) with dnSpyEx**

### **What You Need**

1. **dnSpyEx** ([Download Here](https://github.com/dnSpyEx/dnSpy/releases))
   - Think of this as a "code viewer" for .dll files. It lets you look at the game’s code, even if you didn’t write it.
2. **The Game’s .dll File**
   - For Unity games like SpiderHeck, this is usually in `SpiderHeck_Data/Managed/`. Look for `MyScriptAssembly.dll`.

---

### **Step 1: Get dnSpyEx**

1. Download dnSpyEx from the link above.
2. Unzip the folder. No installation needed—just open `dnSpyEx.exe`.

---

### **Step 2: Open the Game’s Code**

1. Launch dnSpyEx.
2. Drag `MyScriptAssembly.dll` into the dnSpyEx window.
   - If you can’t find the file, check the game’s `Managed` folder (it’s where Unity keeps code).

---

### **Step 3: Browse the Code**

- **Left Panel**: Shows all classes and methods. View the files to explore
- **Middle Panel**: Shows the actual code. For example, click `PlayerMovement` to see how jumping or running works.

_Why this matters_:

- Modders use this to find method names (like `TakeDamage`) to patch with Harmony.

---

### **Step 4: Save the Code (Optional)**

1. Right-click the DLL in the left panel.
2. Choose **Export to Project...** to save all code as a C# project.
   - This lets you read the code in an editor like VS Code later.

---

### **Tips for Newbies**

- **Search Bar**: Use it! Type things like `Health` or `Shoot` to find relevant code fast.

---

### **Wait, Is This Legal?**

- **Maybe not**. Decompiling often breaks the game’s terms of service. Only do this for learning or modding _if the game allows it_. Don’t share copyrighted code.

---

### **Troubleshooting**

- **dnSpyEx crashes?** Try the latest version.
- **No .dll files?** Check the `Managed` folder again, you might have missed it.

---

### **Why Bother?**

- **Modding**: Find method names (e.g., `SeasonChecker`) to tweak with Silk.
- **Learning**: See how pros structure code for games.

---

### **Learn C# Basics**

- **Free Courses**:
  - [C# Basics for Beginners](https://dotnet.microsoft.com/learn/csharp) (Microsoft’s official guide).
  - [Codecademy’s C# Course](https://www.codecademy.com/learn/learn-c-sharp) (interactive, great for total beginners).
- **Need an Editor?**
  - **Visual Studio Community** ([Download](https://visualstudio.microsoft.com/)): Full-featured, free for personal use.
  - **VS Code** ([Download](https://code.visualstudio.com/)): Lightweight. Add the [C# extension](https://marketplace.visualstudio.com/items?itemName=ms-dotnettools.csharp) for coding.

---

### **Final Advice**

Start small. Look for a class like `SpiderController` and see how it works. The more you poke around, the more sense it’ll make. And if you get stuck, ask for help in modding communities, most folks are happy to explain!

---

Now go explore, enjoy modding!
