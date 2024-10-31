import * as SceneTree from "../SceneTree.tsx";
import { SceneRoot } from "../SceneTree/SceneRoot.tsx";
import { Sprite } from "../SceneTree/Sprite.tsx";
import { SpriteComponent } from "../SceneTree/SpriteComponent.ts";

class Bird extends SpriteComponent {
    private y: number = 0;
    private vy: number = 0;

    override start(): void {
        
    }

    override update(): void {
        this.vy += 0.3;
        this.y += this.vy;
        this.setY(this.y);
        //this.setWidth(100);
        //this.setHeight(100);
    }

    override keyPress(_k: string): void {
        if (_k == " ") {
            this.vy = -7;
        }
    }
}

export function TestScene() {
    return <SceneRoot>
        <Sprite x={100} y={500} width={100} height={100} components={[new Bird()]} />
    </SceneRoot>;
}