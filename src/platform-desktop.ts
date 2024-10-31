import { EventType, WindowBuilder, Window } from "jsr:@divy/sdl2@0.13.0";
import { decode } from "https://deno.land/x/pngs/mod.ts";
import { createTextureWithData } from "jsr:@std/webgpu";

declare global {
	interface Navigator {
		readonly gpu: GPU;
	}
}

let currentWindow: Window;
let currentSurface: Deno.UnsafeWindowSurface;
let mainLoopFunction: (() => void);
let keyDownFunction: ((k: string) => void)
let keyPressFunction: ((k: string) => void)
let keyUpFunction: ((k: string) => void)

export default {
    createWindow: () => {
        const win = new WindowBuilder("Relic", 1280, 720).build();
        currentWindow = win;
    },

    createWebGPUSurface: (device: GPUDevice) => {
        const surface = currentWindow.windowSurface(1280, 720);
        const context = surface.getContext("webgpu");

        currentSurface = surface;

        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: presentationFormat
        });

        return [presentationFormat, context];
    },

    setMainLoop: (func: (() => void)) => {
        mainLoopFunction = func;
    },

    run: async () => {
        for await (const event of currentWindow.events()) {
            switch (event.type) {
                case EventType.Quit: {
                    Deno.exit(0);
                    break;
                }
                case EventType.Draw: {
                    mainLoopFunction();
                    break;
                }
            }
        }
    },

    present: () => {
        currentSurface.present();
    },

    readFile: (path: string) => {
        return Deno.readTextFileSync(path);
    },

    loadTexture: async (device: GPUDevice, path: string) => {
        const file = await Deno.readFile(path);
        const decodedImage = await decode(file);

        let format: GPUTextureFormat = "rgba8unorm";

        const texture = createTextureWithData(device, {
            size: { width: decodedImage.width, height: decodedImage.height},
            format: format,
            usage: GPUTextureUsage.TEXTURE_BINDING,
        }, decodedImage.image);

        return texture;
    },

    setKeyDown: (func: (k: string) => void) => {
        keyDownFunction = func;
    },

    setKeyPress: (func: (k: string) => void) => {
        keyPressFunction = func;
    },

    setKeyUp: (func: (k: string) => void) => {
        keyUpFunction = func;
    },
};