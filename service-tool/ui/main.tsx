import React from "react";
import { createRoot } from "react-dom/client";
import { Activity, Bug, Cpu, HardDriveDownload, Play, Search, Send, Settings, Terminal } from "lucide-react";
import "./styles.css";

const logs = [
  "[BOOT] SolWearOS v1.5R proto=prototype-2-esp32s3-lcd13",
  "[HAL] display init st7789 240x240 spi_mode=3 invert=1 dma=1",
  "[STATUS] batt=67 volt=3.81 heap=196608 uptime=3 charging=0 caps=status,nfc,battery",
  "[RESULT] topic=clock status=ok message=\"synced\"",
];

function App() {
  return (
    <main className="shell">
      <aside className="rail">
        <button title="Devices"><Cpu size={20} /></button>
        <button title="Console"><Terminal size={20} /></button>
        <button title="Firmware"><HardDriveDownload size={20} /></button>
        <button title="Diagnostics"><Bug size={20} /></button>
        <button title="Settings"><Settings size={20} /></button>
      </aside>
      <section className="workspace">
        <header className="toolbar">
          <div className="brand">solwear_st</div>
          <select aria-label="Device">
            <option>COM8 - Prototype 2 ESP32-S3</option>
          </select>
          <button><Play size={16} /> Connect</button>
          <button><Send size={16} /> status now</button>
          <div className="search"><Search size={16} /><input placeholder="Filter logs" /></div>
        </header>
        <section className="grid">
          <section className="panel inspector">
            <h2><Activity size={18} /> Device Inspector</h2>
            <dl>
              <dt>Prototype</dt><dd>Prototype 2</dd>
              <dt>MCU</dt><dd>ESP32-S3</dd>
              <dt>Display</dt><dd>ST7789 240x240</dd>
              <dt>Battery</dt><dd>67% / 3.81V</dd>
              <dt>NFC</dt><dd>PN532 Type 4 target</dd>
              <dt>Flash</dt><dd>Serial / esptool</dd>
            </dl>
          </section>
          <section className="panel console">
            <h2><Terminal size={18} /> Logcat</h2>
            <pre>{logs.join("\n")}</pre>
          </section>
          <section className="panel command">
            <h2><Send size={18} /> Command Palette</h2>
            <div className="commands">
              <button>status now</button>
              <button>nav home</button>
              <button>app wallet</button>
              <button>bri 80</button>
              <button>clock sync</button>
              <button>reboot bootsel</button>
            </div>
          </section>
          <section className="panel firmware">
            <h2><HardDriveDownload size={18} /> Firmware Manager</h2>
            <p>Prototype-aware flashing for RP2040 UF2 and ESP32/ESP32-S3 serial workflows.</p>
            <button>Pick Firmware</button>
            <button>Flash Prototype 2</button>
          </section>
        </section>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
