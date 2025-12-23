# Architecture

Understanding how Silk works internally.

## Silk Loader

The core mod loader handles all mod lifecycle operations.

### Doorstop Injection

`winhttp.dll` acts as a proxy DLL that bootstraps Silk before Unity initializes:

1. Game loads `winhttp.dll` (Windows system DLL)
2. Doorstop intercepts and loads the Mono/IL2CPP runtime
3. Silk.dll is injected into the game process
4. Silk initializes before any game code runs

### Assembly Scanning

Silk discovers mods by scanning DLL files:

```csharp
// Silk looks for this attribute
[SilkMod("Mod Name", new[] { "Author" }, "1.0.0", "0.6.1", "mod-id", 0)]
public class MyMod : SilkMod { }
```

Scan process:
1. Read all `.dll` files in `Silk/Mods/`
2. Use Mono.Cecil to inspect assemblies without loading
3. Find classes with `[SilkMod]` attribute
4. Extract metadata (name, version, dependencies)
5. Load compatible mods in dependency order

### Mod Lifecycle

Each mod goes through these stages:

**1. Discovery**
- File found in Mods folder
- Metadata extracted
- Compatibility checked

**2. Loading**
- Assembly loaded into AppDomain
- Mod class instantiated
- Added to ModManager registry

**3. Initialization**
- `Initialize()` method called
- Harmony patches applied
- Config loaded
- Unity GameObject created

**4. Runtime**
- Unity lifecycle methods active (`Awake`, `Update`, etc.)
- Harmony patches intercept game methods
- Event handlers respond to game events

**5. Unloading**
- `Unload()` method called
- Harmony patches removed
- Resources cleaned up

### Harmony Integration

HarmonyX modifies game methods at runtime:

```csharp
[HarmonyPatch(typeof(Player), "TakeDamage")]
[HarmonyPrefix]
static bool PreventDamage(Player __instance, float damage)
{
    // Runs before Player.TakeDamage
    return false; // Skip original method
}
```

Patch types:
- **Prefix**: Run before original method, can skip it
- **Postfix**: Run after original method
- **Transpiler**: Modify IL code directly
- **Finalizer**: Run after method even if it throws

## Mod Structure

### Base Class

All mods inherit from `SilkMod`:

```csharp
public abstract class SilkMod : MonoBehaviour
{
    public abstract void Initialize();
    public abstract void Unload();
}
```

This gives mods:
- Unity component lifecycle (`Awake`, `Start`, `Update`, etc.)
- Access to Unity APIs
- GameObject parent for organization

### Metadata Attribute

The `[SilkMod]` attribute provides:

- **ModName**: Display name in UI
- **ModAuthors**: Creator attribution
- **ModVersion**: Semantic version (1.0.0)
- **ModSilkVersion**: Minimum Silk version required
- **ModId**: Unique identifier (kebab-case)
- **ModNetworkingType**: Online behavior flags

### Entry Point

`Initialize()` is the entry point:

```csharp
public override void Initialize()
{
    // Load configuration
    Config.LoadModConfig(ModId, defaults);
    
    // Apply Harmony patches
    harmony = new Harmony("unique.id");
    harmony.PatchAll(typeof(Patches));
    
    // Register event handlers
    Events.OnGameStart += HandleGameStart;
}
```

Common initialization tasks:
- Load mod configuration
- Apply Harmony patches
- Subscribe to game events
- Register custom content
- Initialize mod state

## Configuration System

### YAML Storage

Configs are stored as YAML files:

```yaml
# Silk/Config/mod-id.yaml
enabledFeature: true
damageMultiplier: 1.5
maxItems: 10
```

### Loading Process

1. Mod defines defaults in `Initialize()`
2. Silk checks if config file exists
3. If missing, create from defaults
4. If exists, load and merge with defaults
5. Return merged config to mod

### Type Handling

Silk serializes these types:
- Primitives: bool, int, float, string
- Collections: List, Dictionary
- Nested: Dictionary<string, object>

Type conversions handle YAML -> C# mapping automatically.

## Event System

Silk provides events for game lifecycle:

```csharp
// Game events
Events.OnGameStart += () => { };
Events.OnLevelLoad += (levelName) => { };
Events.OnPlayerSpawn += (player) => { };

// Mod events
Events.OnModLoaded += (modData) => { };
Events.OnModUnloaded += (modId) => { };
```

Events use C# delegates for type-safe callbacks.

## Logging System

Centralized logging to `Silk/Logs/`:

```csharp
Logger.LogInfo("Information");
Logger.LogWarning("Warning");
Logger.LogError("Error");
```

Log format:
```
[HH:MM:SS] [INFO] [ModName] Message
[HH:MM:SS] [WARN] [ModName] Message
[HH:MM:SS] [ERROR] [ModName] Message
```

Logs rotate:
- `latest.log` - Current session
- `previous.log` - Last session
- Older logs archived with timestamp

## Performance Considerations

### Mod Loading

- Assembly scanning is fast (Mono.Cecil inspection)
- Only compatible mods are loaded
- Dependencies loaded first

### Runtime Impact

- Harmony patches add minimal overhead
- IL manipulation happens once at patch time
- Patched methods have ~5-10ns overhead per call

### Memory Usage

- Each mod is a Unity GameObject component
- Mods share the same AppDomain
- No isolation between mods (by design)

### Best Practices

- Cache expensive lookups in `Awake()`
- Use coroutines for background work
- Minimize `Update()` work
- Unsubscribe from events in `Unload()`
