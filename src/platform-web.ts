declare global {
	interface Navigator {
		readonly gpu: GPU;
	}
}

let canvas: HTMLCanvasElement;
let mainLoopFunction: (() => void);
let keyDownFunction: ((k: string) => void)
let keyPressFunction: ((k: string) => void)
let keyUpFunction: ((k: string) => void)

export default {
    createWindow: () => {
        canvas = document.querySelector("canvas") as HTMLCanvasElement;
        canvas.width = 1280;
        canvas.height = 720;

        document.body.addEventListener("keydown", (event: KeyboardEvent) => {
            keyDownFunction(event.key)
        });

        document.body.addEventListener("keypress", (event: KeyboardEvent) => {
            keyPressFunction(event.key)
        });

        document.body.addEventListener("keyup", (event: KeyboardEvent) => {
            keyUpFunction(event.key)
        });
    },

    createWebGPUSurface: (device: GPUDevice) => {
        // deno-lint-ignore no-explicit-any
        const context: GPUCanvasContext = (canvas.getContext("webgpu") as any) as GPUCanvasContext;
        const presentationFormat = navigator.gpu.getPreferredCanvasFormat();

        context.configure({
            device,
            format: presentationFormat
        });

        return [presentationFormat, context];
    },

    setMainLoop: (func: () => void) => {
        mainLoopFunction = func;
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

    run: () => {
        const loop = () => {
            mainLoopFunction();
            requestAnimationFrame(loop);
        };
        loop();
    },

    present: () => {},

    readFile: (path: string) => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", path, false); // Set third argument to `false` for synchronous request

        try {
            xhr.send();
            if (xhr.status === 200) {
                return xhr.responseText;
            } else {
                throw new Error(`HTTP error! Status: ${xhr.status}`);
            }
        } catch (error) {
            console.error('Error reading file:', error);
            throw new Error("Faled to read file!");
        }

    },
    loadTexture: async (device: GPUDevice, path: string) => {
        const response = await fetch(path);
        const imageBitmap = await createImageBitmap(await response.blob());
        
        // deno-lint-ignore prefer-const
        let texture: GPUTexture = device.createTexture({
            size: [imageBitmap.width, imageBitmap.height],
            format: "rgba8unorm",
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });

        // deno-lint-ignore no-explicit-any
        (device.queue as any).copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: texture },
            [imageBitmap.width, imageBitmap.height]
        );

        return texture;
    }
};