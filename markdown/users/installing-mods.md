# Installing Silk and Mods

## Using Entwine (Recommended)

Entwine is a graphical mod manager that handles Silk installation and mod management automatically.

### Download Entwine

1. Get the latest version from the [Entwine releases page](https://github.com/SilkModding/Entwine/releases)
2. Extract and run the application
3. Follow the setup wizard to locate your SpiderHeck installation

### Installing Mods with Entwine

1. Open Entwine
2. Browse the mod list or search for specific mods
3. Click "Install" on any mod you want
4. Launch SpiderHeck from Entwine or Steam

Entwine handles mod updates, configuration, and compatibility checking automatically.

---

## Manual Installation

### Installing Silk

1. Locate your SpiderHeck game folder:
   - Right-click SpiderHeck in Steam
   - Select Properties → Installed Files → Browse
   
2. Download [Silk from releases](https://github.com/SilkModding/Silk/releases)

3. Extract the archive

4. Copy these files to your SpiderHeck folder (where `SpiderHeckApp.exe` is):
   - `winhttp.dll`
   - `doorstop_config.ini` 
   - `Silk/` (entire folder)

5. Launch SpiderHeck normally

### Installing Mods Manually

1. Download mod `.dll` files from:
   - [Silk Discord](https://discord.gg/GGv92crcx3)
   - Mod repositories

2. Place `.dll` files in `SpiderHeck/Silk/Mods/`

3. Launch the game

4. Verify installation via the in-game Mods button (main menu)

### Troubleshooting

**Silk not loading:**
- Verify `winhttp.dll` is in the same folder as `SpiderHeckApp.exe`
- Check `Silk/Logs/` for error messages
- Ensure you extracted all files from the Silk archive

**Mods not appearing:**
- Confirm `.dll` files are directly in `Silk/Mods/` (not in subfolders)
- Check mod compatibility with your Silk version
- Review logs in `Silk/Logs/latest.log`
