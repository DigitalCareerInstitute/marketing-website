import { DefaultNodeModel } from '@projectstorm/react-diagrams';
export class CustomNodeModel extends DefaultNodeModel {
    constructor(props) {
        super({
            name: props.name,
            extras: {
                questionidentifier: props.extras.questionidentifier,
                customType: props.extras.customType,
            },
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