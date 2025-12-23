# Creating SpiderHeck Mods

This guide covers creating mods for SpiderHeck using the Silk mod loader.

## Prerequisites

### Required Software

- **.NET 6 SDK or later** - [Download](https://dotnet.microsoft.com/download)
- **Code Editor:**
  - Visual Studio 2022 (Community edition is free)
  - VS Code with C# extension
- **Silk Mod Loader** - [Install guide](../users/Installing-Mods)

### Required Knowledge

Basic C# programming. If you're new to C#, complete these first:
- [Microsoft's C# fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/)
- Basic Unity concepts (GameObjects, Components, Update loop)

---

## Project Setup

### Using the Template

1. Download [SilkTemplateMod](https://github.com/SilkModding/SilkTemplateMod)
2. Rename the folder to your mod name
3. Open the `.csproj` file in your editor

### Project Configuration

Your `.csproj` must target .NET Framework 4.7.2:

```xml
<PropertyGroup>
  <TargetFramework>net472</TargetFramework>
</PropertyGroup>
```

Reference Silk and game libraries:

```xml
<ItemGroup>
  <Reference Include="Silk">
    <HintPath>lib\Silk.dll</HintPath>
  </Reference>
  <Reference Include="UnityEngine">
    <HintPath>lib\UnityEngine.dll</HintPath>
  </Reference>
  <Reference Include="UnityEngine.CoreModule">
    <HintPath>lib\UnityEngine.CoreModule.dll</HintPath>
  </Reference>
</ItemGroup>
```

Copy required DLLs to `lib/` folder from your SpiderHeck installation.

---

## Basic Mod Structure

### Minimal Mod Example

```csharp
using Silk;
using Logger = Silk.Logger;
using HarmonyLib;
using UnityEngine;
using System.Collections.Generic;

namespace MyMod
{
    [SilkMod("My Mod", new[] { "YourName" }, "1.0.0", "0.6.1", "my-mod", 1)]
    public class MyMod : SilkMod
    {
        public const string ModId = "my-mod";
        private Harmony _harmony;

        public override void Initialize()
        {
            Logger.LogInfo("Initializing My Mod");
            
            _harmony = new Harmony("com.yourname.mymod");
            _harmony.PatchAll(typeof(Patches));
        }

        public override void Unload()
        {
            Logger.LogInfo("Unloading My Mod");
            _harmony?.UnpatchSelf();
        }
    }
}
```

### SilkMod Attribute Parameters

```csharp
[SilkMod(modName, authors, modVersion, silkVersion, modId, networkingType)]
```

- `modName`: Display name
- `authors`: String array of creator names
- `modVersion`: Your mod's version (semantic versioning)
- `silkVersion`: Minimum Silk version required
- `modId`: Unique identifier (lowercase, hyphens only)
- `networkingType`: 
  - `0` = None (single-player only)
  - `1` = Client (client-side with sync)
  - `2` = Server (server-authoritative)
  - `3` = Both (hybrid)

---

## Lifecycle Methods

### Initialize()

Called when Silk loads your mod. Use for setup:

```csharp
public override void Initialize()
{
    // Load config
    var config = new Dictionary<string, object> { { "enabled", true } };
    Config.LoadModConfig(ModId, config);
    
    // Setup Harmony patches
    _harmony = new Harmony("com.yourname.mymod");
    _harmony.PatchAll(typeof(Patches));
    
    // Register event handlers
    Logger.LogInfo("Mod initialized");
}
```

### Awake()

Unity's Awake - called after the mod component is added to a GameObject:

```csharp
public void Awake()
{
    // Access Unity components
    // Register for Unity events
}
```

### Update()

Called every frame (60 FPS):

```csharp
public void Update()
{
    // Per-frame logic
    // Use sparingly - performance critical
}
```

### Unload()

Called when the mod is disabled:

```csharp
public override void Unload()
{
    _harmony?.UnpatchSelf();
    // Clean up resources
}
```

---

## Using Harmony Patches

Harmony modifies existing game methods at runtime.

### Prefix Patch

Runs before the original method. Return `false` to skip the original:

```csharp
[HarmonyPatch(typeof(Player), "TakeDamage")]
[HarmonyPrefix]
static bool PreventDamage(Player __instance, float damage)
{
    Logger.LogInfo($"Player taking {damage} damage");
    return false; // Skip original method = no damage
}
```

### Postfix Patch

Runs after the original method:

```csharp
[HarmonyPatch(typeof(WeaponPickup), "PickUp")]
[HarmonyPostfix]
static void OnWeaponPickup(WeaponPickup __instance)
{
    Logger.LogInfo($"Picked up weapon: {__instance.weaponType}");
}
```

### Accessing Private Fields

Use `__instance` and reflection:

```csharp
[HarmonyPatch(typeof(Player), "Update")]
[HarmonyPostfix]
static void ModifyPrivateField(Player __instance)
{
    var health = __instance.GetType()
        .GetField("_health", BindingFlags.NonPublic | BindingFlags.Instance)
        ?.GetValue(__instance);
    
    Logger.LogInfo($"Player health: {health}");
}
```

---

## Configuration System

### Loading Config

```csharp
var defaultConfig = new Dictionary<string, object>
{
    { "damageMultiplier", 2.0f },
    { "enableFeature", true },
    { "nestedConfig", new Dictionary<string, object>
        {
            { "value1", 10 },
            { "value2", "text" }
        }
    }
};

Config.LoadModConfig(ModId, defaultConfig);
```

### Reading Config Values

```csharp
float multiplier = Config.GetValue<float>(ModId, "damageMultiplier");
bool enabled = Config.GetValue<bool>(ModId, "enableFeature");
```

### Nested Config Access

```csharp
var nested = Config.GetValue<Dictionary<string, object>>(ModId, "nestedConfig");
int value1 = (int)(long)nested["value1"]; // Type casting needed
```

Configs are stored as YAML in `Silk/Config/{modId}.yaml`.

---

## Silk APIs

### Logging

```csharp
Logger.LogInfo("Info message");
Logger.LogWarning("Warning message");
Logger.LogError("Error message");
```

### Weapons API

```csharp
using Silk.API;

// Add custom weapon
var weapon = new CustomWeapon("Long Sword", Weapons.WeaponType.ParticleBlade);
Weapons.AddNewWeapon(weapon);

// Listen for weapon init
Weapons.OnInitCompleted += () => 
{
    Logger.LogInfo("Weapons initialized");
};
```

---

## Building and Testing

### Build Your Mod

```bash
dotnet build -c Release
```

Output: `bin/Release/net472/YourMod.dll`

### Testing

1. Copy the `.dll` to `SpiderHeck/Silk/Mods/`
2. Launch SpiderHeck
3. Check `Silk/Logs/latest.log` for errors
4. Verify in-game via the Mods menu

### Debugging

Use dnSpy or attach Visual Studio debugger to `SpiderHeckApp.exe`. Add breakpoints in your mod code.

---

## Best Practices

### Performance

- Minimize work in `Update()` - use timers or conditions
- Cache component references instead of repeated `FindObjectOfType` calls
- Avoid creating new objects every frame

### Compatibility

- Don't assume other mods exist
- Catch exceptions to prevent crashing
- Use unique Harmony IDs
- Document mod dependencies

### Code Quality

```csharp
// Good: Specific, cached
private Player _localPlayer;
void Awake() { _localPlayer = FindLocalPlayer(); }

// Bad: Slow, runs every frame  
void Update() 
{ 
    foreach(var player in FindObjectsOfType<Player>()) 
    {
        // ...
    }
}
```

---

## Distribution

### Packaging

Include:
- Your mod `.dll`
- README with description and version requirements
- LICENSE file

### Sharing

- Upload to [Silk Discord](https://discord.gg/GGv92crcx3)
- Create a GitHub repository
- Submit to the mod database (if available)

---

## Advanced Topics

For game class references, see [Decompiling](Decompiling.md).  
For cosmetic modifications, see [Cosmetics](Cosmetics.md).  
For perks system, see [Perks](Perks.md).

---

## Getting Help

- [Silk Discord](https://discord.gg/GGv92crcx3) - Ask in `#mod-development`
- [GitHub Issues](https://github.com/SilkModding/Silk/issues)
- Check existing mods for examples: [Silk Mods Repo](https://github.com/SilkModding)
