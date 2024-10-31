struct Uniforms {
    data: array<vec4f, 256>,
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

	if (position.x == 0) { processedPosition.x = uniforms.data[(instanceIdx * 2)].x; }
	if (position.x == 1) { processedPosition.x = uniforms.data[(instanceIdx * 2)].x + uniforms.data[(instanceIdx * 2)].z; }

	if (position.y == 0) { processedPosition.y = uniforms.data[(instanceIdx * 2)].y; }
	if (position.y == 1) { processedPosition.y = uniforms.data[(instanceIdx * 2)].y + uniforms.data[(instanceIdx * 2)].w; }

    var characterAtlasBase = uniforms.data[(instanceIdx * 2) + 1].xy;
    var characterAtlasSize = uniforms.data[(instanceIdx * 2) + 1].zw;
    var atlasSize = vec2f(350, 125);

    var uvBase = characterAtlasBase / atlasSize;
    var uvSize = characterAtlasSize / atlasSize;

    var output : VertexOutput;
    output.Position = vec4f(
        (processedPosition.x / 1280.0 * 2.0 - 1.0),
        (-processedPosition.y / 720.0 * 2.0 + 1.0),
        0.0,
        1.0
    );
    output.fragUV = uvBase + vec2f((uvSize * uv).x, (uvSize * uv).y);
    return output;
}