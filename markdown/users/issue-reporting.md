# Issue Reporting

How to report bugs and issues effectively.

## Before Reporting

### Check Existing Issues

1. Search [GitHub Issues](https://github.com/SilkModding/Silk/issues)
2. Check [Discord](https://discord.gg/GGv92crcx3) #support channel
3. Review [FAQ](faq) for common problems

### Gather Information

Collect before reporting:
- Silk version
- Game version
- Operating system
- List of installed mods
- Log files
- Steps to reproduce

## Where to Report

### GitHub Issues

**For:**
- Silk loader bugs
- Feature requests
- Documentation errors
- Build issues

**Link:** [github.com/SilkModding/Silk/issues](https://github.com/SilkModding/Silk/issues)

### Discord

**For:**
- General support
- Mod conflicts
- Usage questions
- Community help

**Link:** [discord.gg/GGv92crcx3](https://discord.gg/GGv92crcx3)

### Mod-Specific Issues

**For mod bugs:**
- Check mod's GitHub repository
- Contact mod author directly
- Report in Discord #mod-support

## Issue Template

### Bug Report

```markdown
**Bug Description**
Clear description of the issue.

**Steps to Reproduce**
1. Launch game
2. Do action X
3. Observe behavior Y

**Expected Behavior**
What should happen instead.

**Actual Behavior**
What actually happens.

**Environment**
- Silk version: 0.6.1
- Game version: 1.1.0
- OS: Windows 11
- Mods: ModA v1.0, ModB v2.1

**Logs**
Attach `Silk/Logs/latest.log` or paste relevant sections.

**Additional Context**
Screenshots, videos, or other helpful information.
```

### Feature Request

```markdown
**Feature Description**
Clear description of the proposed feature.

**Use Case**
Why is this feature needed? What problem does it solve?

**Proposed Implementation**
How might this work? (optional)

**Alternatives**
Other solutions considered.

**Additional Context**
Examples from other mod loaders, mockups, etc.
```

## Required Information

### Silk Version

Find in log file:
```
[INFO] [Silk] Initializing Silk v0.6.1
```

Or check `Silk/Library/Silk.dll` properties.

### Game Version

In game:
- Main menu → Settings → About
- Look for version number

Or check Steam:
- Properties → Updates → Build ID

### Operating System

Provide:
- OS name (Windows, Linux)
- Version (Windows 11, Ubuntu 22.04)
- Architecture (x64, x86)

### Installed Mods

List all mods in `Silk/Mods/`:
```
- ModA v1.0.0 (enabled)
- ModB v2.1.0 (enabled)
- ModC v1.5.0 (disabled)
```

### Log Files

**Location:** `Silk/Logs/latest.log`

**What to include:**
- Error messages
- Stack traces
- Surrounding context (20 lines before/after)

**How to attach:**
- GitHub: Drag and drop file to issue
- Discord: Upload as file attachment
- Or paste relevant sections in code blocks

## Log Analysis

### Finding Errors

Look for lines with:
```
[ERROR]
[WARN]
Exception
Failed to
```

### Reading Stack Traces

```
[ERROR] Failed to load mod: ExampleMod
System.IO.FileNotFoundException: Could not load file or assembly
   at Silk.Loader.LoadMod(String path)
   at Silk.Loader.LoadAllMods()
```

This shows:
- Error type: `FileNotFoundException`
- Error message: `Could not load file or assembly`
- Call stack: Where the error occurred

### Common Log Patterns

**Mod not loading:**
```
[ERROR] Failed to load mod: ModName
[ERROR] Could not load file or assembly
```
Solution: Missing dependency DLL

**Harmony patch failed:**
```
[ERROR] Exception in Harmony patch
[ERROR] Method not found: Player.TakeDamage
```
Solution: Game version mismatch

**Config error:**
```
[WARN] Config key not found: invalidKey
```
Solution: Check config file syntax

## Debugging Steps

### Isolate the Problem

1. **Remove all mods**
2. **Test if Silk loads**
   - If fails: Silk installation issue
   - If works: Mod conflict
3. **Add mods one by one**
4. **Identify problematic mod**

### Test in Clean Environment

1. Backup `Silk/Mods/` and `Silk/Config/`
2. Delete Silk folder
3. Reinstall Silk fresh
4. Test without mods
5. Add mods back gradually

### Enable Debug Mode

Edit `doorstop_config.ini`:
```ini
debug_enabled=true
```

This adds detailed logging for:
- Assembly loading
- Patch application
- Method interception

## Common Issues

### Silk Not Loading

**Symptoms:**
- No `Silk/` folder created
- No logs generated
- Mods button missing in game

**Solutions:**
1. Verify `winhttp.dll` is present
2. Check `doorstop_config.ini` exists
3. Ensure `enabled=true` in config
4. Review game launch logs

### Mod Not Appearing

**Symptoms:**
- DLL in Mods folder
- No entry in mods menu
- No log messages about mod

**Solutions:**
1. Check file extension is `.dll`
2. Verify Silk version compatibility
3. Ensure mod has `[SilkMod]` attribute
4. Review logs for load errors

### Game Crashes

**Symptoms:**
- Game closes immediately
- No error message
- Crash during specific action

**Solutions:**
1. Check logs for exceptions
2. Test without mods
3. Identify conflicting mods
4. Report crash dump if available

### Performance Issues

**Symptoms:**
- Low FPS
- Stuttering
- Memory usage high

**Solutions:**
1. Check Update() methods in mods
2. Look for memory leaks in logs
3. Reduce number of active mods
4. Profile with dnSpy or similar

## Information to Include

### Minimal Bug Report

**Required:**
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Silk version
- Log excerpt

### Ideal Bug Report

**Everything above plus:**
- Full log file
- List of all mods
- Screenshots/video
- System specifications
- Attempted solutions

## Follow-Up

### After Reporting

**Maintainers may ask for:**
- Additional logs
- Specific testing
- Modified configurations
- Version changes

**Be prepared to:**
- Test proposed fixes
- Provide more information
- Try workarounds
- Wait for updates

### Status Updates

Issues are labeled:
- `bug` - Confirmed bug
- `enhancement` - Feature request
- `help wanted` - Community input needed
- `wontfix` - Not planned
- `duplicate` - Already reported

### Resolution

Issues are closed when:
- Fixed in new release
- Workaround provided
- Cannot reproduce
- Won't be fixed

## Contributing Fixes

Found the issue yourself?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit pull request
6. Reference original issue

See [Development Guide](../developers/contributing) for details.

## Support Channels

### Priority

1. **Search first** - FAQ and existing issues
2. **Discord** - Quick help and discussion
3. **GitHub Issues** - Formal bug reports
4. **Email** - Security issues only

### Response Times

- Discord: Usually minutes to hours
- GitHub: Usually 1-3 days
- Pull requests: Usually 3-7 days

### Best Practices

- Be patient and respectful
- Provide all requested information
- Test suggested solutions
- Update the issue with results
- Thank helpers

## Example Reports

### Good Bug Report

```markdown
Title: Silk fails to load mods with spaces in filename

Description:
Mods with spaces in their DLL names don't load.

Steps:
1. Place "My Mod.dll" in Silk/Mods/
2. Launch game
3. Check mods menu

Expected: Mod appears in list
Actual: Mod doesn't load, no error in logs

Environment:
- Silk 0.6.1
- SpiderHeck 1.1.0
- Windows 11
- No other mods

Logs:
[INFO] Scanning Silk/Mods/
[INFO] Found: MyOtherMod.dll
[INFO] Loaded 1 mods

(No mention of "My Mod.dll")
```

### Bad Bug Report

```markdown
Title: doesnt work

mods dont load help
```

(Missing: description, steps, environment, logs)
