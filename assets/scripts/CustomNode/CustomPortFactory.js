import { AbstractFactory } from '@projectstorm/react-canvas-core';
export class CustomPortFactory extends AbstractFactory {
    CustomPortFactory(type, cb) {
        _this = _super.call(this, type) || this;
        this.cb = cb;
    }

    generateModel = function (event) {
        return this.cb(event.initialConfig);
    };
}
