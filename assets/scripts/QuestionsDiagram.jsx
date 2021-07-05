import React, { useState, useEffect, useRef } from 'react';
import createEngine, {
  DiagramModel
} from '@projectstorm/react-diagrams';
import {
  CanvasWidget,
  DeleteItemsAction
} from '@projectstorm/react-canvas-core';
import styled from '@emotion/styled';
import { CustomNodeModel } from './CustomNode/CustomNodeModel';
import { CustomNodeFactory } from './CustomNode/CustomNodeFactory';
import { CustomPortFactory } from './CustomNode/CustomPortFactory';
import { CustomPortModel } from './CustomNode/CustomPortModel';
const engine = createEngine({ registerDefaultDeleteItemsAction: false });
class StartNodeModel extends DiagramModel {
  serialize() {
    return {
      ...super.serialize(),
      extras: this.extras,
      label: this.label,
      icon: this.icon,
    };
  }
  deserialize(event, engine) {
    super.deserialize(event, engine);
    this.extras = event.data.extras;
    this.label = event.data.label;
    this.icon = event.data.icon;
  }
}

const model = new StartNodeModel();
engine
  .getPortFactories()
  .registerFactory(new CustomPortFactory('tommy', config => new CustomPortModel(PortModelAlignment.LEFT)));
engine.getNodeFactories().registerFactory(new CustomNodeFactory());

engine.setModel(model);

const CanvasWrapper = styled.div`
  flex-grow: 1;
  overflow: hidden;
  & > div {
    height: 100%;
    width: 100vw;
    background: white;
  }
`
const colorDropdown = "rgb(170, 182, 1)"
const colorFreeanswer = "rgb(182, 133, 1)"
const colorError = "rgb(255,0,0)"
const questioncolor = "rgb(0, 128, 129)"
let availableFields = []
function QuestionsDiagram() {
  let [loading, setloading] = useState(true)
  let [form, setForm] = useState({})
  let formRef = useRef(form)
  let [button, setbutton] = useState('Add')
  let [error, seterror] = useState(undefined)
  useEffect(() => {
    formRef.current = form
  }, [form])
  useEffect(() => {
    fetch(`/admin/questions/fetch`, {
      headers: {
        "content-type": "application/json"
      },
    }).then(res => res.json())
      .then(res => {
        if (res.payload.questions.model) {
          availableFields = res.payload.hb_fields
          model.deserializeModel(res.payload.questions.model, engine);
          Object.values(model.activeNodeLayer.models).forEach((item) => {
            item.registerListener({
              eventDidFire: (e) => {
                e.stopPropagation();
                e.isSelected ? setbutton('update') : setbutton('add')
                if (e.isSelected) {
                  const formFromClickedNode = {
                    "question": e.isSelected && item.options.extras.customType === "question" ? item.options.name : "",
                    'questionidentifier': e.isSelected ? item.options.extras.questionidentifier : "",
                    'questiontranslation': e.isSelected ? item.options.extras.questiontranslation : "",
                    "answer": e.isSelected && item.options.extras.customType === "answer" ? item.options.name : "",
                    "answeridentifier": e.isSelected ? item.options.extras.answeridentifier : "",
                    "answertranslation": e.isSelected ? item.options.extras.answertranslation : "",
                    "freeanswer": e.isSelected ? item.options.extras.freeanswer : "",
                    "dropdown": e.isSelected ? item.options.extras.dropdown : "",
                  }
                  setForm({ ...form, ...formFromClickedNode })
                } else {
                  let formClone = { ...formRef.current }
                  Object.keys(formClone).map(a => {
                    formClone = { ...formClone, [a]: "" }
                  })
                  setForm(formClone)
                }
              }
            });
          });
          engine.setModel(model);
        }
      }).catch(err => {
        console.log(err);
      }).finally(() => {
        setloading(false)
      })
  }, [])

  const addQuestion = (e) => {
    e.preventDefault()
    const selectedNodes = Object.values(engine.model.activeNodeLayer.models).filter(i => i.options.selected)
    let node
    if (selectedNodes.length === 1) {
      node = selectedNodes[0]
      node.options.name = form['question']
      node.options.extras.questionidentifier = form['questionidentifier']
      node.options.extras.questiontranslation = form['questiontranslation']
    } else {
      node = new CustomNodeModel({
        name: `${e.target.elements.addquestion.value}`,
        color: e.target.elements.addquestion.dataset.color,
        extras: {
          customType: e.target.elements.addquestion.dataset.type,
          questionidentifier: e.target.elements.addquestionidentifier.value,
          questiontranslation: e.target.elements.addquestiontranslation.value
        }
      });
      node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);
      node.addInPort('In');
      node.addOutPort('Out');
    }
    model.addAll(node);
    engine.setModel(model);
    parseAllNodesForHubspotFields()
  }
  const addAnswer = (e) => {
    e.preventDefault()
    const selectedNodes = Object.values(engine.model.activeNodeLayer.models).filter(i => i.options.selected)
    let node
    if (selectedNodes.length === 1) {
      node = selectedNodes[0]
      node.options.name = form['answer']
      node.options.extras.dropdown = form['dropdown']
      node.options.extras.answeridentifier = form['answeridentifier']
      node.options.extras.answertranslation = form['answertranslation']
    } else {
      node = new CustomNodeModel({
        name: e.target.elements.answer.value,
        color: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked ? colorFreeanswer : !!e.target.elements.dropdown.checked ? colorDropdown : e.target.elements.answer.dataset.color,
        extras: {
          customType: e.target.elements.answer.dataset.type,
          freeanswer: !!e.target.elements.freeanswer && !!e.target.elements.freeanswer.checked,
          dropdown: !!e.target.elements.dropdown && !!e.target.elements.dropdown.checked,
          answeridentifier: e.target.elements.answeridentifier.value,
          answertranslation: e.target.elements.answertranslation.value
        }
      });
      node.setPosition(engine.canvas.offsetWidth / 2, engine.canvas.offsetHeight / 2);
      node.addInPort('In');
      node.addOutPort('Out');
    }
    model.addAll(node);
    engine.setModel(model);
    parseAllNodesForHubspotFields()
  }

  var checkIfQuestionsMatchWithAnswersAndSyncWithHubspot = (question) => {
    let errors = []
    var hbField = availableFields.find(a => a.name === question.options.extras.questionidentifier)
    var As = Object.values(model.layers[1].models).filter(m => m.options.extras.customType === "answer")
    const answers = As.filter(a => {
      return Object.keys(question.ports.Out.links).includes(Object.values(a.ports.In.links)[0].options.id)
    })
    //TODO `state_de_` is not `state` - overlapping between question and dropdown
    if (answers.filter(a => !a.options.extras.dropdown).length === 0) {
      answers.map(aI => {
        const subHbFields = availableFields.find(aF => aF.name === aI.options.extras.answeridentifier)
        const rawAnswers = aI.options.name.split(":").reverse()[0].split(',').map(a => a.trim())
        const notExistingAnswers = rawAnswers.filter(rA => {
          return !subHbFields.options.map(s => s.value).includes(rA)
        })
        if (notExistingAnswers.length == 0) {
          aI.setSelected(false)
          aI.options.color = colorDropdown
        } else {
          console.log('notExistingAnswers', notExistingAnswers);
          aI.setSelected(true)
          aI.options.color = colorError
          errors.push(`'${notExistingAnswers.join(", ")}' doesnt exist on '${aI.options.name}'`)
        }
        // return { answer: aI.options.name, notExistingAnswers }
      })
    } else {
      Object.values(question.portsOut[0].links).map(link => {
        if (answers.filter(a => !a.options.extras.freeanswer).length > 0) {
          const matchingQuestions = hbField.options.filter(f => f.value === link.targetPort.parent.options.extras.answeridentifier)
          if (link.targetPort.parent.options.extras.customType !== "answer" || matchingQuestions.length === 0) {
            if (matchingQuestions.length === 0) {
              errors.push(`This answer is not present on Hubspot: "${link.targetPort.parent.options.name}"\n\r`)
            }
            engine.getModel().getNode(link.targetPort.parent.options.id).setSelected(true);
            engine.getModel().getNode(link.targetPort.parent.options.id).options.color = colorError
            return link.targetPort.parent
          }
        }
      }).filter(l => !!l)
    }
    return errors
  }
  const parseAllNodesForHubspotFields = () => {
    var nodes = Object.values(model.layers.find(layer => layer.options.type === "diagram-nodes").models)
    let errorNodes = []

    const questions = nodes.filter(n => n.options.extras.customType !== "answer")
    questions.map(q => {
      errorNodes = [...errorNodes, ...checkIfQuestionsMatchWithAnswersAndSyncWithHubspot(q)]
    })
    seterror(errorNodes)
    if (errorNodes.length === 0) {
      seterror(undefined)
    }
  }
  const saveModel = () => {
    setloading(true)
    fetch(`/admin/questions/update`, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(model.serialize())
    }).then(res => res.json())
      .then(res => {
        setloading(false)
      })
  }

  const cloneSelected = () => {
    setloading(true)
    let itemMap = {};
    model.getSelectedEntities().filter(m => m.parent.options.type === "diagram-nodes").map(item => {
      let newItem = item.clone(itemMap)
      model.addNode(newItem)
      newItem.setPosition(newItem.getX() + 20, newItem.getY() + 20)
      engine.setModel(model);
      item.setSelected(!1)
      setloading(false)
    })
  }
  engine.getActionEventBus().registerAction(new DeleteItemsAction({ keyCodes: [8], modifiers: { shiftKey: true } }));
  return (
    <div className="h-100 d-flex flex-column">
      <div>
        <form onSubmit={addQuestion}>
          <div className=" row">
            <div className="col-md-4">
              <label htmlFor="addquestion">Add Question</label>
              <input className="form-control" name="question" type="text" value={form['question']}
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} data-type="question" data-color={questioncolor} style={{ borderColor: { questioncolor }, borderStyle: "solid" }} id="addquestion" required />
            </div>
            <div className="col-md-4">
              <label htmlFor="addquestiontranslation">DE Questiontranslation</label>
              <input className="form-control" name="questiontranslation" type="text" value={form['questiontranslation']}
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} data-type="questiontranslation" data-color={questioncolor} style={{ borderColor: { questioncolor }, borderStyle: "solid" }} id="addquestiontranslation" required />
            </div>
            <div className="col-md-4">
              <div className='d-flex align-items-end'>
                <div className="w-100">
                  <label htmlFor="addquestionidentifier">Questionidentifier</label>
                  <input className="form-control" name="questionidentifier" type="text" value={form['questionidentifier']}
                    onChange={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, [e.target.name]: e.target.value })
                    }} data-type="questionidentifier" data-color={questioncolor} style={{ borderColor: { questioncolor }, borderStyle: "solid" }} id="addquestionidentifier" required />
                </div>
                <button className="btn btn-primary ml-1" type="submit">{button}</button>
              </div>
            </div>
          </div>

        </form>

        <form className="" onSubmit={addAnswer}>
          <div className=" row">
            <div className="col-md-4">
              <label htmlFor="addanswer">Add Answer</label>
              <input className="form-control w-99" name="answer" value={form['answer']}
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} type="text" data-type="answer" data-color="rgb(256, 204, 1)" style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="addanswer" />
            </div>
            <div className="col-md-3">
              <label htmlFor="answertranslation">Answertranslation</label>
              <input className="form-control w-99" name="answertranslation" type="text" value={form['answertranslation']}
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.value })
                }} data-type="answertranslation" data-color={questioncolor} style={{ borderColor: "rgb(256, 204, 1)", borderStyle: "solid" }} id="answertranslation" required />
            </div>
            <div className="col-md-4">
              <div className='d-flex align-items-end'>
                <div className="w-100">
                  <label htmlFor="answeridentifier">Questionidentifier</label>
                  <input className="form-control w-100" name="answeridentifier" type="text" value={form['answeridentifier']}
                    onChange={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, [e.target.name]: e.target.value })
                    }} data-type="answeridentifier" data-color={questioncolor} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="answeridentifier" required />
                </div>
                <button className="btn btn-primary ml-1" type="submit">{button}</button>
              </div>
            </div>
          </div>
          <div className="d-flex w-100 mt-2">
            <div className="form-check d-flex align-items-center mr-3 mb-3">
              <input
                checked={form['freeanswer']}
                name='freeanswer'
                type="checkbox" name="freeanswer" className="form-check-input"
                onChange={(e) => {
                  e.stopPropagation();

                  setForm({ ...form, [e.target.name]: e.target.checked })
                }} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="freeanswer" />
              <label className="form-check-label" htmlFor="freeanswer">Free answer</label>
            </div>
            <div className="form-group form-check d-flex align-items-center mr-3 mb-3">
              <input
                checked={form['dropdown']}
                name='dropdown'
                type="checkbox" name="dropdown" className="form-check-input"
                onChange={(e) => {
                  e.stopPropagation();
                  setForm({ ...form, [e.target.name]: e.target.checked })
                }} style={{ borderColor: "rgb(255, 204, 1)", borderStyle: "solid" }} id="dropdown" />
              <label className="form-check-label" htmlFor="dropdown">Is dropdown</label>
              <button className="btn btn-secondary badge ml-2" type="button" data-container="body" data-toggle="popover" data-trigger="hover" data-placement="top" data-content="If checked, the name field gets more complex. Use a label followed by semicolon and then a comma seperated list to define the dropdown and its items. Eg: 'Whats your language level: A1, A2, B1, B2' - or: 'State: Berlin, Bayern'" data-original-title="" title=""> ? </button>
            </div>
          </div>
        </form>

        <button className="btn btn-primary btn-sm mr-2"
          disabled={loading}
          onClick={() => {
            cloneSelected()
          }}>{loading ? "Loading" : "Clone selected"}</button>
        <button className="btn btn-success btn-sm"
          disabled={loading}
          onClick={() => {
            saveModel()
          }}>{loading ? "Loading" : "Save"}</button>
      </div>
      {error && (
        <div claseName="flash m-0 mr-3 alert fade show alert-danger ">
          Errors: {error.map(e => <div>{e}</div>)}
        </div>
      )}
      <CanvasWrapper>
        <CanvasWidget id='canvas' engine={engine} />
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
