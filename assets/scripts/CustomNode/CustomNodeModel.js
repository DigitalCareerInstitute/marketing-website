import { DefaultNodeModel } from '@projectstorm/react-diagrams';
export class CustomNodeModel extends DefaultNodeModel {
    constructor(props) {
        super({
            name: props.name,
            color: props.color,
            extras: props.extras,
            type: 'custom_question_node'
        });
    }
    serialize() {
        return {
            ...super.serialize(),
        };
    }
    deserialize(event, engine) {
        super.deserialize(event, engine);
    }
}