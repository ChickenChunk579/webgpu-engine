const vertices = [
    0.0,0.0,		0.0,0.0,
    1.0,0.0,		1.0,0.0,
    0.0,1.0,		0.0,1.0,
    0.0,1.0,		0.0,1.0,
    1.0,1.0,		1.0,1.0,
    1.0,0.0,		1.0,0.0,
];
const uniformBufferSize = (4 * 4) * 128 + 1;

export default class SpriteRenderer {
    private device: GPUDevice | undefined;
    private uniformBuffer: GPUBuffer | undefined;
    private vertexBuffer: GPUBuffer | undefined;
    private texture: GPUTexture | undefined = undefined;
    private sampler: GPUSampler | undefined;
    private pipeline: GPURenderPipeline | undefined;
    private uniformBindGroup: GPUBindGroup | undefined;

    data = new Float32Array(uniformBufferSize);
	private i = 0;
    private frame = 0;

    drawSprite(x: number, y: number, width: number, height: number) {
		this.data[this.i++] = x;
		this.data[this.i++] = y;
		this.data[this.i++] = width;
		this.data[this.i++] = height;
	}

    async create(device: GPUDevice, platform: Platform, presentationFormat: GPUTextureFormat) {
        this.device = device;
        
        this.uniformBuffer = device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.vertexBuffer = device.createBuffer({
            size: new Float32Array(vertices).byteLength * 128,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        new Float32Array(this.vertexBuffer.getMappedRange()).set(vertices);
        this.vertexBuffer.unmap();

        this.texture = await platform.loadTexture(device, "./assets/webgpu.png")

        this.sampler = device.createSampler({
            magFilter: "linear",
            minFilter: "linear"
        });


        this.pipeline = device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: device.createShaderModule({
                    code: platform.readFile("./shaders/batch.vert.wgsl"),
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
                    code: platform.readFile("./shaders/uv.frag.wgsl"),
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
        this.data = new Float32Array(4 * 128);
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

    drawSpriteElement(sprite: JSX.Element) {
        this.drawSprite(sprite.props.x, sprite.props.y, sprite.props.width, sprite.props.height);
    }

    render(passEncoder: GPURenderPassEncoder) {
        passEncoder.setPipeline(this.pipeline!);
		passEncoder.setVertexBuffer(0, this.vertexBuffer!);

		passEncoder.setBindGroup(0, this.uniformBindGroup!);

		passEncoder.draw(vertices.length / 4, this.i / 4, 0, 0);
    }
}