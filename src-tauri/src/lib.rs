use std::sync::atomic::{AtomicBool, Ordering};
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{AppHandle, Manager, State, WebviewWindow};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};

/// Whether the user has pinned Float above other windows. Re-applied on every
/// summon because macOS can drop the level when the window is hidden.
struct Pinned(AtomicBool);

/// Raises the window above full-screen apps. Tauri's always-on-top uses the
/// floating level and sets it asynchronously, which can race with this; the
/// status level plus FullScreenAuxiliary is what lets the window sit over a
/// full-screen Space. It only works because the app runs with the Accessory
/// activation policy (see `run`), otherwise macOS switches Spaces instead.
#[cfg(target_os = "macos")]
fn apply_overlay_level(window: &WebviewWindow, on_top: bool) {
    use objc2_app_kit::{NSNormalWindowLevel, NSStatusWindowLevel, NSWindow, NSWindowCollectionBehavior};

    let handle = window.clone();
    let _ = window.run_on_main_thread(move || {
        let Ok(ptr) = handle.ns_window() else { return };
        let ns_window: &NSWindow = unsafe { &*(ptr as *const NSWindow) };
        let behavior = NSWindowCollectionBehavior::CanJoinAllSpaces
            | NSWindowCollectionBehavior::FullScreenAuxiliary
            | NSWindowCollectionBehavior::Stationary;
        ns_window.setCollectionBehavior(behavior);
        ns_window.setLevel(if on_top { NSStatusWindowLevel } else { NSNormalWindowLevel });
    });
}

#[tauri::command]
fn set_always_on_top(window: WebviewWindow, pinned: State<Pinned>, always_on_top: bool) -> Result<(), String> {
    pinned.0.store(always_on_top, Ordering::Relaxed);
    #[cfg(target_os = "macos")]
    apply_overlay_level(&window, always_on_top);
    #[cfg(not(target_os = "macos"))]
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())?;
    Ok(())
}

fn show_window(window: &WebviewWindow) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let on_top = window.state::<Pinned>().0.load(Ordering::Relaxed);
        apply_overlay_level(window, on_top);
    }
    let _ = window.unminimize();
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())
}

#[tauri::command]
fn toggle_window(window: WebviewWindow) -> Result<(), String> {
    let is_visible = window.is_visible().map_err(|e| e.to_string())?;
    if is_visible {
        window.hide().map_err(|e| e.to_string())?;
    } else {
        show_window(&window)?;
    }
    Ok(())
}

#[tauri::command]
fn hide_window(window: WebviewWindow) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn minimize_window(window: WebviewWindow) -> Result<(), String> {
    // As an accessory app Float has no Dock to minimise into, so hide instead.
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
fn open_url(url: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/c", "start", &url])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(&url)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn get_default_notes_dir() -> Result<String, String> {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    let path = std::path::Path::new(&home).join("Documents").join("Float");
    let _ = std::fs::create_dir_all(&path);
    Ok(path.to_string_lossy().to_string())
}

#[tauri::command]
fn save_note_file(file_path: String, content: String) -> Result<(), String> {
    if let Some(parent) = std::path::Path::new(&file_path).parent() {
        let _ = std::fs::create_dir_all(parent);
    }
    std::fs::write(&file_path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_note_file(file_path: String) -> Result<(), String> {
    if std::path::Path::new(&file_path).exists() {
        let _ = std::fs::remove_file(&file_path);
    }
    Ok(())
}

#[tauri::command]
fn reveal_in_finder(path: String) -> Result<(), String> {
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("explorer")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open")
            .arg(&path)
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn pick_folder(_default_path: Option<String>) -> Result<Option<String>, String> {
    #[cfg(target_os = "macos")]
    {
        let script = r#"POSIX path of (choose folder with prompt "Select folder to store Float notes:")"#;
        let output = std::process::Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| e.to_string())?;
        if output.status.success() {
            let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !path.is_empty() {
                let _ = std::fs::create_dir_all(&path);
                return Ok(Some(path));
            }
        }
        Ok(None)
    }
    #[cfg(not(target_os = "macos"))]
    {
        Ok(default_path)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(Pinned(AtomicBool::new(true)))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app: &AppHandle, _shortcut: &Shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = toggle_window(window);
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Register global shortcut (Option+Space or Alt+Space)
            if let Ok(shortcut) = "Alt+Space".parse::<Shortcut>() {
                if let Err(err) = app.global_shortcut().register(shortcut) {
                    eprintln!("Failed to register global shortcut Alt+Space: {}", err);
                }
            }

            // Accessory apps (like Spotlight and Raycast) can draw over another
            // app's full-screen Space. Regular apps make macOS switch Spaces.
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                apply_overlay_level(&window, true);
            }

            let show = MenuItem::with_id(app, "show", "Show Float (⌥Space)", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit Float", true, Some("CmdOrCtrl+Q"))?;
            let menu = Menu::with_items(app, &[&show, &PredefinedMenuItem::separator(app)?, &quit])?;
            let tray = TrayIconBuilder::with_id("float-tray")
                .tooltip("Float")
                .menu(&menu)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = show_window(&window);
                        }
                    }
                    "quit" => app.exit(0),
                    _ => {}
                });
            // Template image: macOS tints it to match light and dark menu bars.
            let tray_icon = tauri::image::Image::from_bytes(include_bytes!("../icons/tray-template.png"))?;
            tray.icon(tray_icon).icon_as_template(true).build(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            set_always_on_top,
            toggle_window,
            hide_window,
            minimize_window,
            open_url,
            get_default_notes_dir,
            save_note_file,
            delete_note_file,
            reveal_in_finder,
            pick_folder
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
