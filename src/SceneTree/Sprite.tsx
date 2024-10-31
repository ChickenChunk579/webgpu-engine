import * as SceneTree from "../SceneTree.tsx";
import { Component } from "./Component.ts";

export class Sprite
    extends SceneTree.React.Component<
        { x: number; y: number; width: number; height: number, components: Component[] }
    > {
    
    name: string = "Sprite";
    
    override render() {
        const { x, y, width, height, components } = this.props;
        return (
            <div
                data-x={x}
                data-y={y}
                data-width={width}
                data-height={height}
                data-components={components}
            >
            </div>
        );
    }
}
