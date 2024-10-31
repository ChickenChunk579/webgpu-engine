import { Component } from "./Component.ts";

export class SpriteComponent extends Component {
    setPosition(x: number, y: number) {
        this.jsx!.props.x = x;
        this.jsx!.props.y = y;
    }

    setSize(width: number, height: number) {
        this.jsx!.props.width = width;
        this.jsx!.props.height = height;
    }

    setX(x: number) {
        this.jsx!.props.x = x;
    }

    setY(y: number) {
        this.jsx!.props.y = y;
    }

    getX() {
        return this.jsx!.props.x;
    }

    getY() {
        return this.jsx!.props.y;
    }


    setWidth(width: number) {
        this.jsx!.props.width = width;
    }

    setHeight(height: number) {
        this.jsx!.props.height = height;
    }

    getWidth() {
        return this.jsx!.props.width;
    }

    getHeight() {
        return this.jsx!.props.height;
    }
}