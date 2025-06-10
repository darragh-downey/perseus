// Tauri type declarations
declare global {
  interface Window {
    __TAURI__?: {
      tauri: {
        invoke: (cmd: string, args?: any) => Promise<any>;
      };
    };
  }
}

export {};
