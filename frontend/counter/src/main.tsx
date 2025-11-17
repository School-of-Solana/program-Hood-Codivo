import { createRoot } from "react-dom/client";
// Ensure Buffer/global are available for Anchor/web3 in browser
import { Buffer } from "buffer";
// @ts-ignore: make Buffer/global visible on window/globalThis
if (!(globalThis as any).Buffer) (globalThis as any).Buffer = Buffer;
// Some libs expect `global` to exist in browser
// @ts-ignore
if (!(globalThis as any).global) (globalThis as any).global = globalThis;
import "./index.css";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(<App />);
