# SpiderHeck Modding Guide

Hey there! Want to make SpiderHeck do wild new things? This guide will help you create your first mod using **Silk**, a tool that lets you tweak the game’s code with C#.

---

## **What You Need**

1. **.NET 6 SDK** (download [here](https://dotnet.microsoft.com/download/dotnet/6.0))
   - This lets your computer _build_ your mod into a file the game can read.
2. **Silk Loader** (get it [here](https://github.com/SilkModding/Silk/releases))
   - Unzip the `Silk` folder into your SpiderHeck game folder. This is what _loads_ your mods.
3. **A Code Editor**
   - Use [Visual Studio Community](https://visualstudio.microsoft.com/) (free, works great) or [VS Code](https://code.visualstudio.com/) (simpler). These are like fancy notepads for writing code.

_Never coded before?_  
Check out [C# for Beginners](https://dotnet.microsoft.com/learn/csharp) or [Codecademy’s C# Course](https://www.codecademy.com/learn/learn-c-sharp). You’ll need the basics.

---

## **Your First Mod**

Let’s break down the example code. We’ll make a mod that kills all enemies every second (because why not?).

### Step 1: Set Up the Project

1. Download the **mod template** [here](https://github.com/SilkModding/SilkTemplateMod).
2. Rename the folder to your mod’s name (like `CoolMod`).
3. Open the `.csproj` file (right-click → Edit) and make sure it says:
   ```xml
   <TargetFramework>net472</TargetFramework>
   ```
   This tells your computer to build the mod in a way SpiderHeck understands.

---

### Step 2: The Code Explained

Here’s what’s happening in the example mod:

```csharp
using System;
using Silk;
using HarmonyLib;

namespace CoolMod
{
    // This line defines your mod’s name, version, etc.
    // Format: "Name", ["List", "of", "authors"], "Mod version", "Silk Version", "mod-id"
    [SilkMod("Cool Mod", new[] { "YourName" }, "1.0.0", "0.4.0", "cool-mod")]
    public class CoolMod : SilkMod
    {
        private float timer = 0;

        // Runs when the mod loads
        public override void Initialize()
        {
            Logger.LogInfo("Mod is alive!");
            var harmony = new Harmony("com.you.coolmod");
            harmony.PatchAll(); // Applies any "patches" you write
        }

        // Runs every frame (about 60 times per second!)
        public void Update()
        {
            timer += Time.deltaTime; // Tracks time since the last frame
            if (timer > 1)
            {
                timer = 0;
                // Kill all enemies:
                foreach (var enemy in UnityEngine.Object.FindObjectsOfType<EnemyHealthSystem>())
                {
                    enemy.Disintegrate();
                }
            }
        }

        // Runs when the mod is unloaded
        public override void Unload()
        {
            Logger.LogInfo("Mod is gone :(");
            Harmony.UnpatchID("com.you.coolmod");
        }
    }
}
```

- **`Initialize()`**: This is where you set up your mod. The `harmony.PatchAll()` line tells Harmony (a library that modifies game code) to look for any patches you’ve written.
- **`Update()`**: Runs constantly. Here, we check if 1 second has passed, then kill all enemies.
- **`Unload()`**: Cleans up when the mod is turned off.

---

### Step 3: Build & Test Your Mod

4. Open your project folder in **Command Prompt** (or Terminal).
5. Type:
   ```bash
   dotnet build -c Release
   ```
   This creates a `.dll` file in `bin/Release/net472/`.
6. Copy that `.dll` into `SpiderHeck/Mods/`.
7. Launch the game! Your mod should load automatically.

---

## **Need Help?**

- **Logs**: Check `Silk/Logs/Silk.log` if your mod crashes.
- **Harmony Patches**: To change how the game works (like giving infinite health), read [Harmony’s Basics](https://harmony.pardeike.net/articles/intro.html).
- **Stuck?** Ask in the [Silk Modding Discord](https://discord.gg/GGv92crcx3)!

---

## **Tips for New Coders**

8. Start small. Modify numbers first (like player speed).
9. Use `Logger.LogInfo("Message")` to print to the log file, it’s your best friend for debugging.
10. Google is your teacher. Search things like “C# how to loop through a list.”

---

Go make something awesome! And don’t worry, breaking the game is part of the fun.
