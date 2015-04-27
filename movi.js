import {objectProperty} from "lovedder/objectProperty";

let binds = [
    {
        binder: "bind",
        assignmentOperator: ":",
        type: "attribute"
    },
    {
        binder: "bind-event",
        assignmentOperator: ":",
        type: "event"
    },
    {
        binder: "repeat",
        assignmentOperator: " of ",
        type: "collection"
    },
    {
        binder: "if",
        type: "condition"
    }
];

function toCamelCase(input) {
    return input
        .toLowerCase()
        .replace(/-(.)/g, (match, group1) => {
            return group1.toUpperCase();
        });
}

function arrayFormDotNotation(string) {
    return string
        .trim()
        .split(".");
}

function arrayToDotNotation(array) {
    return array
        .toString()
        .replace(/\,/g, ".");
}

function amendObjectNotation(string) {
    let array = arrayFormDotNotation(string).map(property => {
        if (isNaN(parseInt(property))) {
            return property;
        } else {
            return `[${property}]`;
        }
    });

    return arrayToDotNotation(array).replace(/(.)\[/g, "[");
}

function children(element, constructor) {
    let elements = new Set();
    for (let child of element.childNodes) {
        if (child instanceof constructor) elements.add(child);
    }

    return elements;
}

function getSentences(string) {
    let query = string
        .split(";");

    let sentences = query.map(sentence => {
        return sentence.trim();
    });

    return sentences.filter(sentence => {
        return sentence !== "";
    });
}

function getAssignments(stringSentence, assignmentOperator) {

    let sentences = getSentences(stringSentence);

    let assignments = [];
    for (let sentence of sentences) {

        let assignment,
            object,
            property,
            args;

        if (assignmentOperator) {
            assignment = sentence.split(assignmentOperator);

            object = assignment[1];
            property = arrayFormDotNotation(assignment[0]);

            // http://stackoverflow.com/questions/13952870/regular-expression-to-get-parameter-list-from-function-definition
            args = /\(\s*([^)]+?)\s*\)/.exec(object);
            if (args) {
                object = object.replace(args[0], "")
                args = args[1].split(",");
            }

            object = arrayFormDotNotation(object.replace("()", ""));
        } else {
            // condition
            object = arrayFormDotNotation(sentence.replace("!", ""));

            property = sentence.includes("!") ?
                false :
                true;
        }

        assignments.push({
            property: property,
            object: object,
            arguments: args
        });
    }

    return assignments;
}

function getBoundData(reference) {
    let objectReference = reference
        .slice(0, reference.length - 1);

    let propertyReference = reference
        .slice(- 1)[0];

    let object = objectProperty(window, objectReference);

    if (object === undefined) {
        objectProperty(window, objectReference, {});
        object = objectProperty(window, objectReference);
    }

    return {
        object: object,
        property: propertyReference,
        value: object[propertyReference]
    };
}

class ModelViewBind {
    constructor(bound) {
        this.model = bound.object;
        this.modelProperty = [bound.property];

        this.view = bound.element;
        this.viewAttribute = arrayFormDotNotation(bound.attribute);
    }

    modelView(value) {
        objectProperty(this.view, this.viewAttribute, value);
    }

    viewModel(value) {
        objectProperty(this.model, this.modelProperty, value);
    }
}

function bindAttribute(bound) {
    let bind = new ModelViewBind(bound);

    bind.modelView(bound.value);

    let changeFromInput;
    if (bound.element.value !== undefined) {
        bound.element.addEventListener("input", () => {
            changeFromInput = true;
            if (bound.attribute === "value") {
                bind.viewModel(bound.element.value);
            }
        });
    }

    let observe = true;
    Object.observe(bound.object, changes => {
        if (observe) {
            if (bound.element.parentElement) {
                for (let change of changes) {
                    if (changeFromInput) {
                        changeFromInput = false;
                    } else {
                        if (bound.property === change.name) bind.modelView(change.object[change.name]);
                    }
                }
            } else {
                observe = false;
            }
        }
    });
}

function bindEvent(bound) {
    let args = "";
    if (bound.arguments) {
        args = `${bound.arguments.toString()}`;
    }

    bound.element.setAttribute(`on${bound.event}`, `${bound.objectName}(${args})`);

    bound.element.addEventListener(bound.event, event => {
        event.preventDefault();
    });
}

function amendCollectionItemAssignment(properties) {
    let assignment = properties.assignment,
        element = properties.element,
        collection = properties.collection,
        item = properties.item,
        index = properties.index,
        binder = properties.binder,
        assignmentOperator = properties.assignmentOperator;

    if (assignment.object[0] === item) {
        assignment.object[0] = `${collection}.${index}`;
    }

    if (binder === "if") {
        element.dataset[binder] = arrayToDotNotation(assignment.object);
    } else {
        element.dataset[binder] = element.dataset[binder] ?
            `${element.dataset[binder]}; ${arrayToDotNotation(assignment.property)}${assignmentOperator}${arrayToDotNotation(assignment.object)}` :
            `${arrayToDotNotation(assignment.property)}${assignmentOperator}${arrayToDotNotation(assignment.object)}`;
    }

    if (assignment.arguments) {
        let argumentIndex = 0;
        for (let argument of assignment.arguments) {
            if (argument.includes(item) && !argument.includes("this")) {
                assignment.arguments[argumentIndex] = assignment.arguments[argumentIndex].replace(item, `${collection}.${index}`);
                assignment.arguments[argumentIndex] = amendObjectNotation(assignment.arguments[argumentIndex]);
            }
            argumentIndex++;
        }

        element.dataset[binder] = `${element.dataset[binder]}(${assignment.arguments.toString()})`;
    }
}

function setCollectionToElement(bound) {
    let elementContent = bound.element.cloneNode(true);
    bound.element.innerHTML = "";

    let index = 0;
    for (let value of bound.value) {
        let item = document.createElement(bound.element.tagName);
        item.innerHTML = elementContent.innerHTML;

        for (let child of children(item, Element)) {
            child.dataset.item = index;
            child.dataset[`${bound.collectionItem}Index`] = index;
            bound.element.appendChild(child);
        }

        for (let bind of binds) {
            let binder = toCamelCase(bind.binder);

            let childs = bound.element.querySelectorAll(`[data-item="${index}"][data-${bind.binder}], [data-item="${index}"] [data-${bind.binder}]`);

            for (let child of childs) {
                child.dataset[`${bound.collectionItem}Index`] = index;

                if (child.dataset[binder].includes(bound.collectionItem)) {
                    let assignmentOperator;
                    if (binder !== "if") {
                        assignmentOperator = binder === "repeat" ?
                            " of " :
                            ":";
                    }

                    let assignments = getAssignments(child.dataset[binder], assignmentOperator);
                    child.dataset[binder] = "";

                    for (let assignment of assignments) {
                        amendCollectionItemAssignment({
                            assignment: assignment,
                            element: child,
                            collection: bound.collection,
                            item: bound.collectionItem,
                            index: index,
                            binder: binder,
                            assignmentOperator: assignmentOperator
                        });
                    }
                }
            }
        }
        index++;
    }
}

function bindArray(bound) {
    if (!(bound.value instanceof Array)) {
        bound.value = (bound.object[bound.property] = []);
    }

    let item = bound.element.cloneNode(true);
    setCollectionToElement(bound);

    let observe = true;
    Array.observe(bound.value, changes => {
        if (observe) {
            if (bound.element.parentElement) {
                for (let change of changes) {
                    if (change.type === "splice") {
                        bound.element.innerHTML = item.innerHTML;
                        setCollectionToElement(bound);
                        bindData(bound.element);
                    }
                }
            } else {
                observe = false;
            }
        }
    });
}

function setConditionToElement(bound, content) {
    if (bound.condition === true) {
        bound.element.innerHTML = !bound.value ?
            "" :
            content;
    } else {
        bound.element.innerHTML = bound.value ?
            "" :
            content;
    }
}

function bindCondition(bound) {
    let content = bound.element.cloneNode(true);
    setConditionToElement(bound, content.innerHTML);

    let condition = bound.value ?
        true :
        false;

    let observe = true;
    Object.observe(bound.object, changes => {
        if (observe) {
            if (bound.element.parentElement) {

                for (let change of changes) {
                    if (bound.property === change.name) {
                        let allBound = getAllBoundData(bound.element);

                        for (let bound of allBound) {
                            if (bound.condition !== undefined) {
                                if ((bound.value ? true : false) !== condition) {
                                    condition = condition ?
                                        false :
                                        true;

                                    setConditionToElement(bound, content.innerHTML);
                                    bindData(bound.element);
                                }
                            }
                        }
                    }
                }
            } else {
                observe = false;
            }
        }
    });
}

function bindValue(bound) {
    if (bound.attribute === undefined) {
        bound.element.dataset.condition = "";
        bound.attribute = "dataset.condition";
    }
    bound.object[bound.property] = objectProperty(bound.element, arrayFormDotNotation(bound.attribute));
    bound.value = objectProperty(bound.element, arrayFormDotNotation(bound.attribute));
}

function bindType(bind, element, assignment) {
    let bound = getBoundData(assignment.object);

    bound.element = element;

    if (bind.type === "collection") {
        bound[bind.type] = arrayToDotNotation(assignment.object);
        bound.collectionItem = assignment.property[0];
    } else if (bind.type === "event") {
        bound[bind.type] = arrayToDotNotation(assignment.property);
        bound.objectName = amendObjectNotation(arrayToDotNotation(assignment.object));
        if (assignment.arguments) {
            bound.arguments = assignment.arguments.toString();
        }
    } else if (bind.type === "condition") {
        bound[bind.type] = assignment.property;
    } else if (bind.type === "attribute") {
        if (assignment.object[0] === "this") {
            let value = objectProperty(element, assignment.object.slice(1));
            objectProperty(element, assignment.property, value);
        }
        bound[bind.type] = arrayToDotNotation(assignment.property);
    }

    if (bound.value === undefined) {
        bindValue(bound);
    }

    return bound;
}

function getAllBoundData(element) {
    let boundData = [];

    for (let bind of binds) {
        let binder = toCamelCase(bind.binder);

        if (element.dataset[binder] !== undefined) {
            let sentences = getSentences(element.dataset[binder]);

            for (let sentence of sentences) {

                let assignments = getAssignments(sentence, bind.assignmentOperator);

                for (let assignment of assignments) {
                    let bound = bindType(bind, element, assignment);

                    boundData.push(bound);
                }
            }
        }
    }

    return boundData;
}

function bindByType(bound) {
    if (bound.attribute !== undefined) bindAttribute(bound);

    if (bound.event !== undefined) bindEvent(bound);

    if (bound.condition !== undefined) bindCondition(bound);

    if (bound.collection !== undefined) bindArray(bound);
}

export function bindData(node = document) {
    for (let element of children(node, Element)) {

        let allBound = getAllBoundData(element);

        for (let bound of allBound) {
            bindByType(bound);
        }
    }

    for (let element of children(node, Element)) {
        bindData(element);
    }
}
