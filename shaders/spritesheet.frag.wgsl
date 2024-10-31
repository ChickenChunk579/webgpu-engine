@group(0) @binding(1) var mySampler: sampler;
@group(0) @binding(2) var myTexture: texture_2d<f32>;

@fragment
fn main(
	@location(0) fragUV: vec2f,
) -> @location(0) vec4f {
	var color: vec4f = textureSample(myTexture, mySampler, fragUV);
	if (color.a == 0.0) {
		discard;
	}
	if (color.r == 0 && color.g == 0 && color.b == 0) {
		discard;
	}
	return color;
}