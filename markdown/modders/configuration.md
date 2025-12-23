# Mod Configuration System

Silk provides a YAML-based configuration system for mods. This allows users to customize mod behavior without editing code.

## For Mod Developers

### Creating a Configuration

Define default configuration in your mod's `Initialize()` method:

```csharp
public override void Initialize()
{
    var defaultConfig = new Dictionary<string, object>
    {
        { "enabled", true },
        { "damageMultiplier", 1.5f },
        { "maxItems", 10 },
        { "playerName", "DefaultPlayer" }
    };
    
    Config.LoadModConfig(ModId, defaultConfig);
}
```

The first time your mod runs, this creates `Silk/Config/{modId}.yaml` with these defaults.

### Reading Configuration Values

```csharp
// Simple types
bool enabled = Config.GetValue<bool>(ModId, "enabled");
float damage = Config.GetValue<float>(ModId, "damageMultiplier");
int maxItems = Config.GetValue<int>(ModId, "maxItems");
string name = Config.GetValue<string>(ModId, "playerName");
```

### Nested Configuration

For complex settings, use nested dictionaries:

```csharp
var defaultConfig = new Dictionary<string, object>
{
    { "weapons", new Dictionary<string, object>
        {
            { "sword", new Dictionary<string, object>
                {
                    { "damage", 25.0f },
                    { "speed", 1.2f }
                }
            },
            { "gun", new Dictionary<string, object>
                {
                    { "damage", 15.0f },
                    { "fireRate", 0.5f }
                }
            }
        }
    }
};

Config.LoadModConfig(ModId, defaultConfig);
```

Reading nested values:

```csharp
var weapons = Config.GetValue<Dictionary<string, object>>(ModId, "weapons");
var sword = (Dictionary<string, object>)weapons["sword"];
float swordDamage = Convert.ToSingle(sword["damage"]);
```

### Lists/Arrays

```csharp
var defaultConfig = new Dictionary<string, object>
{
    { "allowedWeapons", new List<string> { "Sword", "Gun", "Bow" } },
    { "spawnTimes", new List<float> { 1.0f, 2.5f, 5.0f } }
};

Config.LoadModConfig(ModId, defaultConfig);

// Reading
var weapons = Config.GetValue<List<object>>(ModId, "allowedWeapons");
foreach (var weapon in weapons)
{
    Logger.LogInfo($"Allowed: {weapon}");
}
```

### Best Practices

**Use descriptive keys:**
```csharp
// Good
{ "enableInvincibility", true }
{ "maxPlayerSpeed", 10.0f }

// Bad
{ "e", true }
{ "mps", 10.0f }
```

**Validate config values:**
```csharp
float speed = Config.GetValue<float>(ModId, "playerSpeed");
if (speed < 0 || speed > 100)
{
    Logger.LogWarning($"Invalid speed {speed}, using default 5.0");
    speed = 5.0f;
}
```

**Handle missing keys gracefully:**
```csharp
try
{
    var value = Config.GetValue<int>(ModId, "optionalSetting");
}
catch
{
    Logger.LogWarning("Optional setting not found, using default");
    var value = 10;
}
```

### Dynamic Reload

Configs are read at startup. To support runtime changes:

```csharp
private float _cachedMultiplier;

public void Update()
{
    // Reload every 5 seconds (expensive, use sparingly)
    if (Time.frameCount % 300 == 0)
    {
        _cachedMultiplier = Config.GetValue<float>(ModId, "damageMultiplier");
    }
}
```

---

## For Users

### Editing Configurations

1. Navigate to `SpiderHeck/Silk/Config/`
2. Open `{mod-id}.yaml` in a text editor
3. Modify values
4. Save and restart the game

### YAML Format

Configs use YAML syntax:

```yaml
# Boolean
enabled: true

# Numbers
damageMultiplier: 2.5
maxItems: 10

# Strings
playerName: "CustomName"

# Lists
allowedWeapons:
  - Sword
  - Gun
  - Bow

# Nested objects
weapons:
  sword:
    damage: 25.0
    speed: 1.2
  gun:
    damage: 15.0
    fireRate: 0.5
```

### Common Issues

**Config not loading:**
- Check YAML syntax (indentation matters)
- Ensure the file name matches the mod ID
- Check `Silk/Logs/latest.log` for errors

**Changes not taking effect:**
- Restart the game after editing
- Some mods cache values and require longer to update
- Verify you edited the correct mod's config file

**Reset to defaults:**
- Delete the `.yaml` file
- Restart the game
- The mod will regenerate defaults

---

## Using Entwine

Entwine provides a GUI for config editing:

1. Open Entwine
2. Go to the "Config" tab
3. Select a mod from the list
4. Edit values using the form interface
5. Click "Save" and restart the game

Entwine validates config types and provides better error messages than manual editing.

---

## Advanced: Custom Config Handlers

For complex configuration needs, implement your own config system:

```csharp
public class ModConfig
{
    public bool Enabled { get; set; }
    public float DamageMultiplier { get; set; }
    public List<string> AllowedWeapons { get; set; }
}

private ModConfig _config;

public override void Initialize()
{
    string configPath = Path.Combine(Utils.GetConfigFolder(), $"{ModId}.json");
    
    if (File.Exists(configPath))
    {
        string json = File.ReadAllText(configPath);
        _config = JsonConvert.DeserializeObject<ModConfig>(json);
    }
    else
    {
        _config = new ModConfig
        {
            Enabled = true,
            DamageMultiplier = 1.5f,
            AllowedWeapons = new List<string> { "Sword", "Gun" }
        };
        
        File.WriteAllText(configPath, JsonConvert.SerializeObject(_config, Formatting.Indented));
    }
}
```

This approach gives you more control but requires more code and isn't compatible with Entwine's GUI editor.
