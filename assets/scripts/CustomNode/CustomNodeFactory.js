import { CustomNodeWidget } from './CustomNodeWidget';
import { CustomNodeModel } from './CustomNodeModel';
import * as React from 'react';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class CustomNodeFactory extends AbstractReactFactory {
    constructor(props) {
        super('custom_question_node');
    }

    generateReactWidget(event) {
        return <CustomNodeWidget engine={this.engine} size={50} node={event.model} />;
    }

    generateModel(event) {
        return new CustomNodeModel(event.initialConfig);
    }
}