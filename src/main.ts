// deno-lint-ignore-file no-explicit-any
import SpriteRenderer from "./SpriteRenderer.ts";
import { TestScene } from "./scenes/FlappyBirdScene.tsx";
import * as SceneTree from "./SceneTree.tsx";
import { Component } from "./SceneTree/Component.ts";
import TextRenderer from "./text/TextRenderer.ts";

declare global {
	interface Platform {
		createWindow(): void;
		createWebGPUSurface(
			device: GPUDevice,
		): [GPUTextureFormat, GPUCanvasContext];
		present(): void;
		readFile(filename: string): string;
		setMainLoop(fn: () => void): void;
		run(): void;
		loadTexture(device: GPUDevice, filename: string): Promise<GPUTexture>,

		setKeyDown(fn: (k: string) => void): void,
		setKeyUp(fn: (k: string) => void): void,
		setKeyPress(fn: (k: string) => void): void
	}
}
/// <reference types="@webgpu/types" />
// hi

const currentScene: JSX.Element = TestScene();

function renderElement(child: JSX.Element) {
	if (SceneTree.React.isValidElement(child)) {
		switch (new (child.type as any)().name) {
			case "Sprite": {
				((child.props as any).components as Component[]).forEach(component => {
					component.jsx = child;
					component.update();
				});
				spriteRenderer.drawSpriteElement(child);
				break;
			}
		}
	}
}

function drawScene() {
	if ((currentScene.props.children as JSX.Element[]).forEach) {
		(currentScene.props.children as JSX.Element[]).forEach(child => {
			renderElement(child);
		});
	} else {
		renderElement((currentScene.props.children as JSX.Element));
	}
	
}

let spriteRenderer: SpriteRenderer;
let textRenderer: TextRenderer;

export default async function run(platform: Platform) {
	platform.createWindow();

	const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
	const device = await adapter?.requestDevice() as GPUDevice;

	const [presentationFormat, context] = platform
		.createWebGPUSurface(device);

	spriteRenderer = new SpriteRenderer();
	await spriteRenderer.create(device, platform, presentationFormat);
	textRenderer = new TextRenderer(platform);
	await textRenderer.create(device, platform, presentationFormat);

	let passEncoder: GPURenderPassEncoder;

	if ((currentScene.props.children as JSX.Element[]).forEach) {
		(currentScene.props.children as JSX.Element[]).forEach(child => {
			if (SceneTree.React.isValidElement(child)) {
				((child.props as any).components as Component[]).forEach(component => {
					component.jsx = child;
					component.start();
				});
			}
		});
	} else {
		const child: JSX.Element = currentScene.props.children;
		if (SceneTree.React.isValidElement(child)) {
			((child.props as any).components as Component[]).forEach(component => {
				component.jsx = child;
				component.start();
			});
		}
	}

	platform.setKeyDown((k: string) => {
		if ((currentScene.props.children as JSX.Element[]).forEach) {
			(currentScene.props.children as JSX.Element[]).forEach(child => {
				if (SceneTree.React.isValidElement(child)) {
					((child.props as any).components as Component[]).forEach(component => {
						component.jsx = child;
						component.keyDown(k);
					});
				}
			});
		} else {
			const child: JSX.Element = currentScene.props.children;
			if (SceneTree.React.isValidElement(child)) {
				((child.props as any).components as Component[]).forEach(component => {
					component.jsx = child;
					component.keyDown(k);
				});
			}
		}
	});

	platform.setKeyUp((k: string) => {
		if ((currentScene.props.children as JSX.Element[]).forEach) {
			(currentScene.props.children as JSX.Element[]).forEach(child => {
				if (SceneTree.React.isValidElement(child)) {
					((child.props as any).components as Component[]).forEach(component => {
						component.jsx = child;
						component.keyUp(k);
					});
				}
			});
		} else {
			const child: JSX.Element = currentScene.props.children;
			if (SceneTree.React.isValidElement(child)) {
				((child.props as any).components as Component[]).forEach(component => {
					component.jsx = child;
					component.keyUp(k);
				});
			}
		}
	});

	platform.setKeyPress((k: string) => {
		if ((currentScene.props.children as JSX.Element[]).forEach) {
			(currentScene.props.children as JSX.Element[]).forEach(child => {
				if (SceneTree.React.isValidElement(child)) {
					((child.props as any).components as Component[]).forEach(component => {
						component.jsx = child;
						component.keyPress(k);
					});
				}
			});
		} else {
			const child: JSX.Element = currentScene.props.children;
			if (SceneTree.React.isValidElement(child)) {
				((child.props as any).components as Component[]).forEach(component => {
					component.jsx = child;
					component.keyPress(k);
				});
			}
		}
	});

	function mainLoop() {
		spriteRenderer.startFrame();

		drawScene();

		spriteRenderer.endFrame();

		textRenderer.startFrame();

		textRenderer.drawString(100, 100, "hello, world!");

		textRenderer.endFrame();

		const commandEncoder = device.createCommandEncoder();
		const textureView = (context as GPUCanvasContext).getCurrentTexture()
			.createView();

		passEncoder = commandEncoder.beginRenderPass({
			colorAttachments: [
				{
					view: textureView,
					clearValue: [0, 1, 0, 1],
					loadOp: "clear",
					storeOp: "store",
				},
			],
			
		});

		
		spriteRenderer.render(passEncoder);
		textRenderer.render(passEncoder);

		passEncoder.end();

		device.queue.submit([commandEncoder.finish()]);
		platform.present();
	}

	platform.setMainLoop(mainLoop);
	await platform.run();
}
