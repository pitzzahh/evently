// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;
use std::path::{PathBuf};
use tauri_plugin_shell::ShellExt;

#[tauri::command]
async fn run_pocketbase_server(app: tauri::AppHandle) {
  let sidecar_command = app
    .shell()
    .sidecar("pocketbase")
    .unwrap()
    .args(["serve"]);
  let (mut _rx, mut _child) = sidecar_command.spawn().unwrap();
}

#[tauri::command]
async fn create_superuser(app: tauri::AppHandle, email: String, password: String) {
  let sidecar_command = app
    .shell()
    .sidecar("pocketbase")
    .unwrap()
    .args([
      "superuser", 
      "create", 
      email, 
      password
    ]);
  let (mut _rx, mut _child) = sidecar_command.spawn().unwrap();
}

#[tauri::command]
fn get_env_var(key: String) -> String {
    std::env::var(key).unwrap_or(String::from(""))
}

#[tauri::command]
fn get_exe_path() -> PathBuf {
    std::env::current_exe()
        .unwrap()
        .parent()
        .unwrap()
        .to_path_buf()
}

fn main() {
    dotenv::from_read(include_str!("../../.env").as_bytes())
        .unwrap()
        .load();
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
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
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            get_env_var,
            get_exe_path,
            run_pocketbase_server,
            create_superuser
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}