# Frequently Asked Questions

## General Questions

### What is Silk?

Silk is a mod loader for SpiderHeck that allows you to run custom modifications. It uses runtime patching via HarmonyX to modify game behavior without altering game files.

### What is Entwine?

Entwine is a desktop mod manager for SpiderHeck. It provides a graphical interface for installing Silk, downloading mods, and managing configurations.

### Is modding safe?

Modding is safe for your game installation. Silk does not modify any original game files. However:
- Use mods only in single-player or private sessions
- Online-enabled mods are flagged and may affect leaderboard eligibility
- Only download mods from trusted sources

### Do mods work in multiplayer?

Mods work in local multiplayer. For online play:
- All players need the same mods installed
- Networking-enabled mods are required for synchronization
- Some mods are client-side only and won't sync

---

## Installation Issues

### Silk doesn't load when I launch the game

**Check these:**
1. `winhttp.dll` must be in the same folder as `SpiderHeckApp.exe`
2. The `Silk/` folder must be present
3. Check `Silk/Logs/latest.log` for errors
4. Verify you extracted all files (don't just copy the `.zip`)

### Game crashes on startup

**Common causes:**
- Conflicting mods - Remove recently installed mods one at a time
- Corrupted Silk installation - Delete `Silk/` folder and reinstall
- Outdated mods - Check mod compatibility with your Silk version
- Check logs in `Silk/Logs/` for the actual error

### Mods don't appear in the Mods menu

**Solutions:**
1. Verify `.dll` files are directly in `Silk/Mods/` (not in subfolders)
2. Check the mod's Silk version requirement matches your installation
3. Review `Silk/Logs/latest.log` for loading errors
4. Ensure the mod file isn't corrupted (re-download if necessary)

---

## Mod Management

### How do I update Silk?

**With Entwine:**
- Open Entwine
- Check for updates in the Settings tab
- Click "Update Silk" if available

**Manual:**
1. Download the latest release
2. Delete old `Silk/` folder and `winhttp.dll`
3. Extract and copy new files
4. Your mods and configs are preserved if you keep the `Silk/Mods/` folder

### How do I disable a mod without uninstalling?

**With Entwine:**
- Toggle the switch next to the mod name

**Manual:**
- Rename the mod file extension from `.dll` to `.dll.disabled`
- Or move it out of the `Silk/Mods/` folder temporarily

### Where are mod configurations stored?

Configs are in `Silk/Config/` as `.yaml` files. Each mod has its own config file named by its mod ID.

### How do I reset a mod's configuration?

Delete the mod's `.yaml` file in `Silk/Config/` and restart the game. The mod will regenerate defaults.

---

## Development Questions

### What programming language do I use?

C# targeting .NET Framework 4.7.2. SpiderHeck is built with Unity.

### Do I need Unity to make mods?

No. You need:
- .NET 6+ SDK
- A code editor (Visual Studio or VS Code)
- Silk installed in your game folder for testing

### Where can I find game classes and methods?

Use [Silk Searcher](https://github.com/SilkModding/SilkSearcher) to explore SpiderHeck's code at runtime. Game reference files are also available in the Silk repository.

### Can I use external libraries?

Yes. Include them as dependencies in your `.csproj` file. Commonly used:
- HarmonyX (included with Silk)
- UnityEngine (game's Unity version)
- Newtonsoft.Json

---

## Performance and Compatibility

### Will mods affect performance?

Depends on the mod. Most mods have minimal impact. Poorly optimized mods that run heavy operations every frame may cause lag.

### Can I run mods made for older Silk versions?

Usually yes, but compatibility isn't guaranteed. Check the mod's `ModSilkVersion` attribute. The Silk version must be equal or higher than the mod requires.

### What happens if two mods conflict?

Silk loads all mods. If they patch the same methods, behavior is unpredictable. Check logs for errors and disable one of the conflicting mods.

---

## Support

### Where can I get help?

- [Silk Discord](https://discord.gg/GGv92crcx3) - Active community support
- [GitHub Issues](https://github.com/SilkModding/Silk/issues) - Bug reports and feature requests

### How do I report a bug?

See [Issue Report Guide](Issue%20Report%20Guide.md) for detailed instructions. Always include:
- Silk version
- Log files from `Silk/Logs/`
- List of installed mods
- Steps to reproduce