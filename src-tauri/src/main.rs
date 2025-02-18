// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri_plugin_shell::ShellExt;
use std::env;

#[tauri::command]
fn get_env_var(key: String) -> String {
    std::env::var(String::from(key)).unwrap_or(String::from(""))
}

#[tauri::command]
fn get_exe_path() -> PathBuf {
    std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

#[tauri::command]
async fn create_pocketbase_superuser(app: tauri::AppHandle, email: String, password: String) {
  let os = env::consts::OS;
  let binary_name = match os {
    "windows" => "pocketbase_windows_amd64.exe",
    "macos" => if cfg!(target_arch = "aarch64") {
      "pocketbase_darwin_arm64"
    } else {
      "pocketbase_darwin_amd64"
    },
    "linux" => "pocketbase_linux_amd64",
    _ => panic!("Unsupported OS"),
  };

  let sidecar_command = app
    .shell()
    .sidecar(binary_name)
    .unwrap()
    .args(["superuser", "create", "--email", &email, "--password", &password]);
  let (mut _rx, mut _child) = sidecar_command.spawn().unwrap();
}

fn main() {
  dotenv::from_read(include_str!("../../.env").as_bytes())
  .unwrap()
  .load();
  tauri::Builder::default()
    .plugin(
        tauri_plugin_log::Builder::new()
            .target(tauri_plugin_log::Target::new(
                tauri_plugin_log::TargetKind::Folder {
                    path: dirs::home_dir().unwrap(),
                    file_name: Some("evently-app".to_string()),
                },
            ))
            .format(|out, message, record| {
                out.finish(format_args!(
                    "[{} {}] {}",
                    record.level(),
                    record.target(),
                    message
                ))
            })
            .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
            .build(),
    )
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_updater::Builder::new().build())
    .invoke_handler(tauri::generate_handler![
      create_pocketbase_superuser,
      get_env_var,
      get_exe_path
      ])
    .setup(|app| {
      // Check if it's the first run and call the create_pocketbase_superuser command
      let first_run = true; // Replace with actual first run check logic
      if first_run {
        let app_handle = app.handle();
        tauri::async_runtime::spawn(async move {
          create_pocketbase_superuser(app_handle, "admin@pocketbase.com".into(), "12345678".into()).await;
        });
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}