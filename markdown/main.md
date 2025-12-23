# Silk Modding Documentation

Silk is a mod loader for SpiderHeck that enables code modifications through runtime patching. This documentation covers installation, mod development, and usage.

## What is Silk?

Silk uses HarmonyX to patch SpiderHeck at runtime, allowing custom code execution without modifying game files. Mods are C# assemblies (.dll files) loaded automatically on game start.

**Key Features:**
- Runtime code patching via Harmony
- Mod configuration system (YAML)
- In-game mod menu
- API for common game modifications
- Logging and debugging tools
- Version management and compatibility checking

## What is Entwine?

Entwine is a cross-platform desktop application for managing Silk and mods. It provides a graphical interface for:
- Installing and updating Silk
- Browsing and installing mods
- Editing mod configurations
- Version management
- Game launching

**Platform Support:** Windows, macOS, Linux

---

## Getting Started

### For Players

Want to use mods in SpiderHeck? Start here:

1. [Installing Silk and Mods](users/Installing-Mods) - Installation guide for both Entwine and manual setup
2. [FAQ](users/FAQ) - Common questions and troubleshooting
3. [Issue Reporting](users/Issue-Report-Guide) - How to report bugs

### For Mod Developers

Want to create mods? Start here:

1. [Making Mods](modders/Making-Mods) - Complete mod development guide
2. [Configuration System](modders/Configuration) - Implementing mod settings
3. [Utilities](modders/Utilities) - Helper functions and APIs
4. [Decompiling](modders/Decompiling) - Exploring game code

### For Contributors

Contributing to Silk itself:

1. [Development Setup](developers/Welcome) - Setting up the development environment
2. [Build Scripts](developers/Scripts) - Building Silk from source

---

## Architecture

### Silk Loader

The core mod loader:
- **Doorstop injection** - `winhttp.dll` bootstraps Silk before game initialization
- **Assembly scanning** - Discovers mods via `[SilkMod]` attribute
- **Mod lifecycle** - Manages initialization, updates, and cleanup
- **Harmony integration** - Applies runtime patches to game code

### Mod Structure

Each mod:
- Inherits from `SilkMod` base class
- Declares metadata via `[SilkMod]` attribute
- Implements `Initialize()` and `Unload()` methods
- Optionally uses Unity lifecycle methods (`Awake()`, `Update()`, etc.)
- Can apply Harmony patches to game methods

### Configuration

- Mods define default configs as dictionaries
- Silk serializes to YAML in `Silk/Config/`
- Configs load at startup
- Entwine provides GUI editing

---

## Technical Details

### Versions

- **Silk:** Currently 0.6.1
- **Target Framework:** .NET Framework 4.7.2
- **Unity Version:** 2020.3.x (SpiderHeck's engine version)
- **Harmony:** HarmonyX 2.13.0+

### Mod Compatibility

Mods specify minimum Silk version via the `[SilkMod]` attribute. Silk loads mods with matching or newer versions. Incompatible mods log errors and skip loading.

### Networking

Mods can specify networking behavior:
- **None (0):** Single-player only, no sync
- **Client (1):** Runs on client with data sync
- **Server (2):** Server-authoritative logic
- **Both (3):** Runs on both client and server

Online-enabled mods flag leaderboard submissions to prevent cheating.

---

## Directory Structure

```
SpiderHeck/
├── SpiderHeckApp.exe
├── winhttp.dll              # Doorstop injector
├── doorstop_config.ini      # Doorstop configuration
└── Silk/
    ├── Library/             # Silk DLLs and dependencies
    │   ├── Silk.dll
    │   └── HarmonyX.dll
    ├── Mods/                # Installed mods (.dll files)
    │   ├── ExampleMod.dll
    │   └── AnotherMod.dll
    ├── Config/              # Mod configurations (.yaml files)
    │   ├── silk.yaml
    │   └── AnotherMod
            └── another-mod.yaml
    ├── Logs/                # Log files
    │   ├── mod-manager.log
    │   └── doorstop.log
    └── Updater/             # Silk auto-updater
```

---

## Resources

### Links

- [GitHub Repository](https://github.com/SilkModding/Silk)
- [Discord Community](https://discord.gg/GGv92crcx3)
- [Entwine Mod Manager](https://github.com/SilkModding/Entwine)
- [Example Mods](https://github.com/SilkModding/Silk/tree/main/Mods)
- [Silk Searcher](https://github.com/SilkModding/SilkSearcher) - Runtime game inspector

### Documentation Sections

**Users:**
- [Installing Mods](users/installing-mods)
- [FAQ](users/FAQ)
- [Issue Report Guide](users/issue-report-guide)

**Mod Developers:**
- [Making Mods](modders/making-mods)
- [Configuration](modders/configuration)
- [Utilities](modders/utilities)
- [Perks System](modders/perks)
- [Cosmetics](modders/cosmetics)
- [Decompiling](modders/decompiling)

**Contributors:**
- [Development Guide](developers/welcome)
- [Build Scripts](developers/Scripts)

---

## Credits

**Silk Developers:**
- Abstractmelon
- Wackymoder

**Special Thanks:**
- pardeike for Harmony
- SpiderHeck community

---

## Support

**Issues and Bugs:** [GitHub Issues](https://github.com/SilkModding/Silk/issues)  
**Community Support:** [Discord](https://discord.gg/GGv92crcx3)  
**Documentation:** This website
