use std::path::PathBuf;

use clap::{Parser, Subcommand};
use solwear_st_core::{
    detect_devices,
    device::{resolve_profile, PROTOTYPES},
    flash::flash_firmware,
    Command, SerialSession,
};

#[derive(Debug, Parser)]
#[command(name = "solwear_st", about = "SolWear SDK and service-tool CLI")]
struct Cli {
    #[command(subcommand)]
    command: CliCommand,
}

#[derive(Debug, Subcommand)]
enum CliCommand {
    Devices {
        #[arg(long)]
        json: bool,
    },
    Connect {
        #[arg(long)]
        port: String,
    },
    Status {
        #[arg(long)]
        port: String,
        #[arg(long)]
        json: bool,
    },
    Logs {
        #[arg(long)]
        port: String,
    },
    Send {
        #[arg(long)]
        port: String,
        command: Vec<String>,
    },
    Flash {
        #[arg(long)]
        target: String,
        #[arg(long)]
        port: String,
        #[arg(long)]
        firmware: PathBuf,
    },
    BackupReport,
    Doctor,
}

fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();
    match cli.command {
        CliCommand::Devices { json } => {
            let devices = detect_devices()?;
            if json {
                println!("{}", serde_json::to_string_pretty(&devices)?);
            } else if devices.is_empty() {
                println!("No serial devices detected");
            } else {
                for device in devices {
                    println!(
                        "{}  {:04x}:{:04x}  {}  {}",
                        device.port,
                        device.vid.unwrap_or(0),
                        device.pid.unwrap_or(0),
                        device.profile.id,
                        device.description
                    );
                }
            }
        }
        CliCommand::Connect { port } => {
            SerialSession::new(&port).send(Command::StatusNow)?;
            println!("Connected command channel on {port}; requested status");
        }
        CliCommand::Status { port, json } => {
            SerialSession::new(&port).send(Command::StatusNow).ok();
            match SerialSession::new(&port).read_status()? {
                Some(status) if json => println!("{}", serde_json::to_string_pretty(&status)?),
                Some(status) => println!(
                    "battery={}%, voltage={:.2}V, heap={}, uptime={}s, proto={}, mcu={}, display={}",
                    status.battery_pct, status.voltage, status.heap_bytes, status.uptime_sec, status.proto, status.mcu, status.display
                ),
                None => anyhow::bail!("no status heartbeat received from {port}"),
            }
        }
        CliCommand::Logs { port } => {
            SerialSession::new(&port).stream_logs(|line| println!("{line}"))?;
        }
        CliCommand::Send { port, command } => {
            let command = command.join(" ");
            SerialSession::new(&port).send(Command::Raw(command.clone()))?;
            println!("sent: {command}");
        }
        CliCommand::Flash {
            target,
            port,
            firmware,
        } => {
            let profile = PROTOTYPES
                .iter()
                .find(|profile| profile.id == target || profile.id.contains(&target))
                .cloned()
                .unwrap_or_else(|| resolve_profile(&target, "", "", &[]));
            flash_firmware(&profile, &port, &firmware)?;
            println!("flashed {} to {port}", firmware.display());
        }
        CliCommand::BackupReport => {
            println!("legacy service tool: service-tool-legacy-20260528");
            println!("legacy firmware: cxx-stable-20260528");
            println!("local archives: E:\\SOLWEAR\\old_and_zips");
        }
        CliCommand::Doctor => doctor()?,
    }
    Ok(())
}

fn doctor() -> anyhow::Result<()> {
    println!("solwear_st doctor");
    println!("rust/cargo: run `cargo --version`");
    println!("serial devices: {}", detect_devices()?.len());
    println!("required firmware protocol: SolWearOS v1.5R or compatible");
    Ok(())
}
