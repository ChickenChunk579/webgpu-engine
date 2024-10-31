struct Uniforms {
    data: array<vec4f, 128>,
}
@binding(0) @group(0)
var<uniform> uniforms : Uniforms;


struct VertexOutput {
    @builtin(position) Position : vec4f,
    @location(0) fragUV : vec2f,
}

@vertex
fn main(
	@builtin(instance_index) instanceIdx : u32,
	@location(0) position : vec2f,
	@location(1) uv : vec2f
) -> VertexOutput {
	var processedPosition : vec2f;

	if (position.x == 0) { processedPosition.x = uniforms.data[(instanceIdx)].x; }
	if (position.x == 1) { processedPosition.x = uniforms.data[(instanceIdx)].x + uniforms.data[(instanceIdx)].z; }

	if (position.y == 0) { processedPosition.y = uniforms.data[(instanceIdx)].y; }
	if (position.y == 1) { processedPosition.y = uniforms.data[(instanceIdx)].y + uniforms.data[(instanceIdx)].w; }

    var output : VertexOutput;
    output.Position = vec4f(
        (processedPosition.x / 1280.0 * 2.0 - 1.0),
        (-processedPosition.y / 720.0 * 2.0 + 1.0),
        0.0,
        1.0
    );
    output.fragUV = uv;
    return output;
}