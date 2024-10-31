const vertices = [
    0.0,0.0,		0.0,0.0,
    1.0,0.0,		1.0,0.0,
    0.0,1.0,		0.0,1.0,
    0.0,1.0,		0.0,1.0,
    1.0,1.0,		1.0,1.0,
    1.0,0.0,		1.0,0.0,
];
const uniformBufferSize = (8 * 4) * 1024 + 1;

declare global {
    interface CharacterData {
        x: number;
        y: number;
        width: number;
        height: number;
        originX: number;
        originY: number;
        advance: number;
    }

    interface FontMap {
        name: string;
        size: number;
        bold: boolean;
        italic: boolean;
        width: number;
        height: number;
        characters: {
            [key: string]: CharacterData;
        };
        
    }
}

export default class SpriteRenderer {
    private device: GPUDevice | undefined;
    private uniformBuffer: GPUBuffer | undefined;
    private vertexBuffer: GPUBuffer | undefined;
    private texture: GPUTexture | undefined = undefined;
    private sampler: GPUSampler | undefined;
    private pipeline: GPURenderPipeline | undefined;
    private uniformBindGroup: GPUBindGroup | undefined;

    private fontMap: FontMap;

    data = new Float32Array(8 * 1024);
	private i = 0;
    private frame = 0;

    constructor(platform: Platform) {
        this.fontMap = JSON.parse(platform.readFile("./assets/font-map.json")) as FontMap;
        console.log(this.fontMap);
    }

    drawCharacter(x: number, y: number, character: string) {
		this.data[this.i++] = x;
		this.data[this.i++] = y;
		this.data[this.i++] = this.fontMap.characters[character].width;
		this.data[this.i++] = this.fontMap.characters[character].height;

        const characterData = this.fontMap.characters[character];

        this.data[this.i++] = characterData.x;
		this.data[this.i++] = characterData.y;
		this.data[this.i++] = characterData.width;
		this.data[this.i++] = characterData.height;
	}

    drawString(x: number, y: number, str: string) {
        let currentX = x;
        for (let i = 0; i < str.length; i++) {
            this.drawCharacter(currentX, y - this.fontMap.characters[str[i]].originY, str[i]);
            currentX += this.fontMap.characters[str[i]].advance;
        }
    }

    async create(device: GPUDevice, platform: Platform, presentationFormat: GPUTextureFormat) {
        this.device = device;
        
        this.uniformBuffer = device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.vertexBuffer = device.createBuffer({
            size: new Float32Array(vertices).byteLength ,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();

        this.texture = await platform.loadTexture(device, "./assets/font.png")

        this.sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear"
        });


        this.pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    code: platform.readFile("./shaders/text.vert.wgsl"),
                }),
                buffers: [
                    {
                        arrayStride: 16,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            },
                            {
                                // uv
                                shaderLocation: 1,
                                offset: 8,
                                format: "float32x2",
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: device.createShaderModule({
                    code: platform.readFile("./shaders/spritesheet.frag.wgsl"),
                }),
                targets: [
                    {
                        format: presentationFormat as GPUTextureFormat,
                    },
                ],
            },
            primitive: {
                topology: "triangle-list",
            },
        });

        this.uniformBindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                {
                    binding: 0,
                    resource: {
                        buffer: this.uniformBuffer,
                    },
                },
                {
                    binding: 1,
                    resource: this.sampler,
                },
                {
                    binding: 2,
                    resource: this.texture.createView(),
                },
            ],
        });
    }


    startFrame() {
        this.data = new Float32Array(8 * 1024);
        this.i = 0;
    }

    endFrame() {
        this.device!.queue.writeBuffer(
			this.uniformBuffer!,
			0,
			this.data.buffer,
			this.data.byteOffset,
			this.data.byteLength,
		);

        this.frame++;
    }

    render(passEncoder: GPURenderPassEncoder) {
        passEncoder.setPipeline(this.pipeline!);
		passEncoder.setVertexBuffer(0, this.vertexBuffer!);

		passEncoder.setBindGroup(0, this.uniformBindGroup!);

		passEncoder.draw(vertices.length / 4, this.i / 8, 0, 0);
    }
}