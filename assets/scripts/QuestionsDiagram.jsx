import React, { useState, useEffect, useRef } from 'react';
import createEngine, { DiagramModel } from '@projectstorm/react-diagrams';
import { CanvasWidget, DeleteItemsAction } from '@projectstorm/react-canvas-core';
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
  position: relative;
  & > div {
    height: 100%;
    width: 100vw;
    background: white;
  }
`
const Loader = styled.section`
  opacity: ${props => props.loading ? 0.8 : 0};
  pointer-events: ${props => props.loading ? `all` : `none`};
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: white;
  img {
    left: 50%;
    opacity: .7;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    animation: shine 1s alternate infinite;
    @keyframes shine {
      0% {

        transform: translate(-50%, -50%) rotate(0deg);
      }
      50% {

        transform: translate(-50%, -50%) rotate(400deg);
      }
      100% {
        transform: translate(-50%, -50%) rotate(0deg);
      }
    }
  }
`
const Pre = styled.pre`
  white-space: unset;
  padding: 10px;
  background-color: white;
`
const colorDropdown = "rgb(170, 182, 1)"
const colorFreeanswer = "rgb(182, 133, 1)"
const colorAnswer = "rgb(255, 204, 1)"
const colorError = "rgb(255,0,0)"
const questioncolor = "rgb(0, 128, 129)"
let availableFields = []
function QuestionsDiagram() {
  let [loading, setloading] = useState(true)
  let [form, setForm] = useState({})
  let formRef = useRef(form)
  let [button, setbutton] = useState('Add')
  let [nodevisibility, setnodevisibility] = useState(false)
  let [answersvisiblity, setanswersvisiblity] = useState(false)
  let [allFlows, setallFlows] = useState([])
  let [answers, setanswers] = useState([])
  let [currentModelId, setmodelState] = useState("")
  let [error, seterror] = useState([])
  useEffect(() => {
    formRef.current = form
  }, [form])
  const addEventListeners = (name) => {
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
              "flowname": name
            }
            setForm({ ...formRef.current, ...formFromClickedNode })
          } else {
            const formClone = {
              "question": "",
              'questionidentifier': "",
              'questiontranslation': "",
              "answer": "",
              "answeridentifier": "",
              "answertranslation": "",
              "freeanswer": "",
              "dropdown": ""
            }
            setForm({ ...formRef.current, formClone })
          }
        }
      });
    });
  }
  useEffect(() => {
    fetch(`/admin/questions/fetch`, {
      headers: {
        "content-type": "application/json"
      },
    }).then(res => res.json())
      .then(res => {
        if (res.payload.questions.length > 0) {
          availableFields = res.payload.hb_fields
          setallFlows(res.payload.questions)
          setanswers(res.payload.answers)
          if (res.payload.questions[0].model) {
            model.deserializeModel(res.payload.questions[0].model, engine);
          }
          setForm({ ...form, flowname: res.payload.questions[0].name, active: res.payload.questions[0].active })
          setmodelState(res.payload.questions[0]._id)
          addEventListeners(res.payload.questions[0].name)
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
    if (Object.values(model.layers[1].models).length > 0) {
      var hbField = availableFields.find(a => a.name === question.options.extras.questionidentifier)
      var As = Object.values(model.layers[1].models).filter(m => m.options.extras.customType === "answer")
      const answers = As.filter(a => {
        return Object.values(a.ports.In.links)[0] && Object.keys(question.ports.Out.links).includes(Object.values(a.ports.In.links)[0].options.id)
      })
      if (answers.filter(a => !a.options.extras.dropdown).length === 0) {
        answers.map(aI => {
          const subHbFields = availableFields.find(aF => aF.name === aI.options.extras.answeridentifier)
          const dropdownAnswers = aI.options.name.split(":").reverse()[0]
          const rawAnswers = dropdownAnswers.split(',').map(a => a.trim())
          const rawAnswersWithoutLabels = rawAnswers.map(a => a.replace(/\(.*\)/, '').trim())
          const notExistingAnswers = rawAnswersWithoutLabels.filter(rA => {
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
        })
      } else {
        Object.values(question.portsOut[0].links).map(link => {
          if (answers.filter(a => !a.options.extras.freeanswer).length > 0) {
            if (hbField) {
              question.options.color = questioncolor
              const matchingQuestions = hbField && hbField.options.length > 0 ? hbField.options.filter(f => f.value === link.targetPort.parent.options.extras.answeridentifier) : []
              if (hbField.options.length > 0 && matchingQuestions.length == 0) {
                errors.push(`This answer is not present on Hubspot: "${link.targetPort.parent.options.name}"\n\r`)
                engine.getModel().getNode(link.targetPort.parent.options.id).options.color = colorError
              } else {
                engine.getModel().getNode(link.targetPort.parent.options.id).options.color = colorAnswer
              }
            } else {
              question.options.color = colorError
              errors.push(`This question is not present on Hubspot: "${question.options.name}"\n\r`)
              engine.getModel().getNode(link.targetPort.parent.options.id).options.color = colorError
            }
            return link.targetPort.parent
          }
        }).filter(l => !!l)
      }
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
      <h2> Questions
        <button className="btn btn-secondary badge ml-2" type="button" data-container="body" data-toggle="popover" data-trigger="hover" data-placement="top" data-content="Link questions to one or multiple answers. If a question is followed by a freeanswer, it should be the only anwer of that question" data-original-title="" title=""> ?
        </button>
        <button className="btn btn-link text-left ml-3" type="button" onClick={e => {
          setanswersvisiblity(!answersvisiblity)
        }}>Show answers</button>
        <button className={`btn btn-secondary mr-2 word-break-break-all`} onClick={e => {
          setnodevisibility(!nodevisibility)
        }}>Add Nodes</button>
      </h2>



      <div className={!answersvisiblity ? `d-none` : ``}>
        <div className={`card`}>
          {answers.map(a => (
            <Pre className={""}>{JSON.stringify(a.answers)}</Pre>
          ))}
        </div>
      </div>
      <div className={!nodevisibility ? `d-none` : ``}>
        <form onSubmit={addQuestion}>
          <div className="form-row align-items-end">
            <div className="col-auto flex-column d-flex">
              <label htmlFor="flowselector">flowselector</label>
              <select
                id="flowselector"
                className={`custom-select w-auto mr-2`}
                onChange={e => {
                  const theModelToSet = allFlows.find(f => f.name === e.target.selectedOptions[0].value)
                  if (theModelToSet.model) {
                    model.deserializeModel(theModelToSet.model, engine);
                    setForm({ ...form, flowname: theModelToSet.name, active: theModelToSet.active })
                    setmodelState(theModelToSet._id)
                    engine.setModel(model);
                  } else {
                    const newModel = new StartNodeModel();
                    model.deserializeModel(newModel, engine);
                    engine.setModel(newModel)
                  }
                  addEventListeners(theModelToSet.name)
                }}>
                <option disabled value='' defaultChecked>select flow...</option>
                {allFlows.map((f, i) => (
                  <option key={i} defaultChecked={f._id == currentModelId} value={f.name} >{f.name}</option>
                ))}
              </select>
            </div>
            <div className="col-auto px-3 align-items-center d-flex">
              <input
                checked={form['active']}
                name='active'
                type="checkbox" name="active" className="form-check-input"
                onChange={(e) => {
                  e.stopPropagation();

                  setForm({ ...form, [e.target.name]: e.target.checked })
                }} style={{ borderColor: colorAnswer, borderStyle: "solid" }} id="active" />
              <label className="form-check-label" htmlFor="active">Active?</label>
            </div>
            <div className="col-auto">
              <label htmlFor="flowname">Flow name</label>
              <input className="form-control" id="flowname" name="flowname" value={form['formname']} value={form.flowname} onChange={(e) => {
                e.stopPropagation();
                setForm({ ...form, [e.target.name]: e.target.value })
              }} />
            </div>
            <div className="col-auto">
              <button className={`btn btn-secondary mr-2`} onClick={e => {
                if (form.flowname) {
                  setloading(true)
                  const newModel = new StartNodeModel();
                  fetch(`/admin/questions/update`, {
                    method: "POST",
                    headers: {
                      "content-type": "application/json"
                    },
                    body: JSON.stringify({
                      _id: "",
                      name: "New Flow",
                      model: newModel.serialize(),
                    })
                  }).then(res => res.json())
                    .then(res => {
                      if (res.error) {
                        seterror([...error, res.error])
                      } else {
                        engine.setModel(newModel)
                        setallFlows([...allFlows, res.payload])
                        setForm({ ...form, flowname: res.payload.name })
                        setmodelState(res.payload._id)
                      }
                      setloading(false)
                    })
                  seterror(error.splice(error.findIndex(e => e === `Name must be provided`), 1))
                } else {
                  seterror([...error, `Name must be provided`])
                }
              }}>Add Flow</button>
            </div>
          </div>
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
            <div className="col-md-4">
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
              <button className="btn btn-secondary badge ml-2" type="button" data-container="body" data-toggle="popover" data-trigger="hover" data-placement="top" data-content="If checked you can split by a ':' between the fieldlabel and the placeholder. Eg: fieldlabel:placeholder or Phone:+490987654321" data-original-title="" title=""> ? </button>
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
              <button className="btn btn-secondary badge ml-2" type="button" data-container="body" data-toggle="popover" data-trigger="hover" data-placement="top" data-content="If checked, the name field gets more complex. Use a label followed by semicolon and then a comma seperated list to define the dropdown and its items. You can provide a optional dropdown label also with putting it in ().Eg: 'Whats your language level: A1(Beginner), A2, B1, B2(Mother tongue)' - or: 'State: Berlin(Haupstadt), Bayern'." data-original-title="" title=""> ? </button>
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
            setloading(true)
            parseAllNodesForHubspotFields()
            fetch(`/admin/questions/update`, {
              method: "POST",
              headers: {
                "content-type": "application/json"
              },
              body: JSON.stringify({
                _id: currentModelId,
                name: form['flowname'],
                model: model.serialize(),
                active: form.active
              })
            }).then(res => res.json())
              .then(res => {
                allFlows[allFlows.findIndex(f => f._id === res.payload._id)] = res.payload
                setloading(false)
              }).catch(e => {
                setloading(false)
              })
          }}>{loading ? "Loading" : "Save"}</button>
      </div>
      {error && error.length > 0 && (
        <div className=" m-0 mr-3 alert alert-danger">
          <button type="button" className="close" onClick={e => {
            seterror([])
          }}>
            <span aria-hidden="true">&times;</span>
          </button>
          Errors: {error.map((e, i) => <div key={i}>{e}</div>)}
        </div>
      )}
      <CanvasWrapper >
        <CanvasWidget id='canvas' engine={engine} />
        <Loader loading={loading} >
          <img src="/media/dci.svg" />
        </Loader>
      </CanvasWrapper>
    </div>
  );
}

export default QuestionsDiagram;
